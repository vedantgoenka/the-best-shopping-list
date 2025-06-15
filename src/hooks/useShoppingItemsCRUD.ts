import { useRef, useEffect, useCallback } from 'react';
import { ShoppingItem } from '@/types/shoppingItem';
import { shoppingItemsService } from '@/services/shoppingItemsService';
import { 
  getMaxOrderIndex, 
  createItemUpdates, 
  getUpdateDetailsMessage,
} from '@/utils/shoppingItemUtils';
import { useShoppingItemsToast } from './useShoppingItemsToast';

export const useShoppingItemsCRUD = (
  items: ShoppingItem[],
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>
) => {
  const {
    showItemAdded,
    showItemUpdated,
    showItemExists,
    showItemExistsUpdated,
    showItemDeleted,
    showCategoryDeleted,
    showAddError,
    showUpdateError,
    showDeleteError,
    showCategoryDeleteError,
  } = useShoppingItemsToast();

  // Use a ref to hold the latest items array to prevent stale state in callbacks.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const updateItem = useCallback(async (id: string, updates: Partial<Pick<ShoppingItem, 'text' | 'quantity' | 'completed' | 'category' | 'notes' | 'shop_name' | 'order_index'>>) => {
    try {
      await shoppingItemsService.updateItem(id, updates);

      setItems(prev => {
        const updatedItems = prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        
        if ('order_index' in updates || 'completed' in updates) {
          return updatedItems.sort((a, b) => {
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            return b.order_index - a.order_index; // Reverse order (highest first)
          });
        }
        
        return updatedItems;
      });

      showItemUpdated(updates);
      return true;
    } catch (error) {
      console.error('Unexpected error updating item:', error);
      showUpdateError();
      return false;
    }
  }, [setItems, showItemUpdated, showUpdateError]);

  const addItem = useCallback(async (
    text: string, 
    quantity: number, 
    category?: string, 
    notes?: string, 
    shopName?: string, 
    completed?: boolean, 
    maintainOrder = false,
    specificOrderIndex?: number
  ) => {
    try {
      const currentItems = itemsRef.current;
      const existingItem = currentItems.find(item => 
        item.text.toLowerCase() === text.trim().toLowerCase()
      );

      if (existingItem) {
        const updates: any = createItemUpdates(existingItem, quantity, category, notes, shopName);
        
        if (completed !== undefined && existingItem.completed !== completed) {
          updates.completed = completed;
        }

        if (specificOrderIndex !== undefined && existingItem.order_index !== specificOrderIndex) {
          updates.order_index = specificOrderIndex;
        }
        
        if (Object.keys(updates).length > 0) {
          const success = await updateItem(existingItem.id, updates);
          if (success) {
            const updateDetails = getUpdateDetailsMessage(updates);
            showItemExistsUpdated(existingItem.text, updateDetails);
          }
          return success;
        } else {
          showItemExists(existingItem.text);
          return true;
        }
      }

      // For new items, add to the bottom with highest order index
      const orderIndex = specificOrderIndex !== undefined ? specificOrderIndex : (getMaxOrderIndex(currentItems) + 1);
      
      const newItem = await shoppingItemsService.createItem({
        text,
        quantity: quantity || 1,
        category,
        notes,
        shop_name: shopName,
        order_index: orderIndex,
        completed: completed || false,
      });

      if (maintainOrder) {
        setItems(prev => {
          const newItems = [...prev, newItem];
          return newItems.sort((a, b) => {
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            return b.order_index - a.order_index; // Reverse order (highest first)
          });
        });
      } else {
        setItems(prev => [newItem, ...prev]);
      }
      showItemAdded(newItem);
      return true;
    } catch (error) {
      console.error('Unexpected error adding item:', error);
      showAddError();
      return false;
    }
  }, [setItems, updateItem, showItemAdded, showItemExists, showItemExistsUpdated, showAddError, showItemUpdated, showUpdateError]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      const currentItems = itemsRef.current;
      const itemToDelete = currentItems.find(item => item.id === id);
      
      await shoppingItemsService.deleteItem(id);

      setItems(prev => prev.filter(item => item.id !== id));
      
      if (itemToDelete) {
        showItemDeleted(itemToDelete);
      }
      return true;
    } catch (error) {
      console.error('Unexpected error deleting item:', error);
      showDeleteError();
      return false;
    }
  }, [setItems, showItemDeleted, showDeleteError]);

  const deleteCategoryWithItems = useCallback(async (categoryName: string) => {
    try {
      const currentItems = itemsRef.current;
      const itemsInCategory = currentItems.filter(item => item.category === categoryName);
      
      await shoppingItemsService.deleteItemsByCategory(categoryName);

      setItems(prev => prev.filter(item => item.category !== categoryName));
      
      showCategoryDeleted(categoryName, itemsInCategory.length);
      return true;
    } catch (error) {
      console.error('Unexpected error deleting category:', error);
      showCategoryDeleteError();
      return false;
    }
  }, [setItems, showCategoryDeleted, showCategoryDeleteError]);

  return {
    addItem,
    updateItem,
    deleteItem,
    deleteCategoryWithItems,
  };
};
