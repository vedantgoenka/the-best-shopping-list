import { useCallback } from 'react';
import { ShoppingItem } from '@/types/shoppingItem';
import { shoppingItemsService } from '@/services/shoppingItemsService';
import { 
  getMaxOrderIndex, 
  createItemUpdates, 
  getUpdateDetailsMessage,
} from '@/utils/shoppingItemUtils';
import { useShoppingItemsToast } from '@/hooks/useShoppingItemsToast';

interface UseShoppingItemOperationsProps {
  items: ShoppingItem[];
  itemsRef: React.MutableRefObject<ShoppingItem[]>;
  addItem: (item: ShoppingItem, maintainOrder?: boolean) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeItem: (id: string) => void;
  removeItemsByCategory: (categoryName: string) => void;
  currentListId?: string | null;
}

export const useShoppingItemOperations = ({
  items,
  itemsRef,
  addItem,
  updateItem,
  removeItem,
  removeItemsByCategory,
  currentListId,
}: UseShoppingItemOperationsProps) => {
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

  const updateItemInDb = useCallback(async (id: string, updates: Partial<Pick<ShoppingItem, 'text' | 'quantity' | 'completed' | 'category' | 'notes' | 'shop_name' | 'order_index'>>) => {
    try {
      await shoppingItemsService.updateItem(id, updates);
      updateItem(id, updates);
      showItemUpdated(updates);
      return true;
    } catch (error) {
      console.error('Unexpected error updating item:', error);
      showUpdateError();
      return false;
    }
  }, [updateItem, showItemUpdated, showUpdateError]);

  const addItemToDb = useCallback(async (
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
          const success = await updateItemInDb(existingItem.id, updates);
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

      const orderIndex = specificOrderIndex !== undefined ? specificOrderIndex : (getMaxOrderIndex(currentItems) + 1);
      
      const newItem = await shoppingItemsService.createItem({
        text,
        quantity: quantity || 1,
        category,
        notes,
        shop_name: shopName,
        order_index: orderIndex,
        completed: completed || false,
        shopping_list_id: currentListId,
      });

      addItem(newItem, maintainOrder);
      showItemAdded(newItem);
      return true;
    } catch (error) {
      console.error('Unexpected error adding item:', error);
      showAddError();
      return false;
    }
  }, [itemsRef, updateItemInDb, addItem, showItemAdded, showItemExists, showItemExistsUpdated, showAddError, currentListId]);

  const deleteItemFromDb = useCallback(async (id: string) => {
    try {
      const currentItems = itemsRef.current;
      const itemToDelete = currentItems.find(item => item.id === id);
      
      await shoppingItemsService.deleteItem(id);
      removeItem(id);
      
      if (itemToDelete) {
        showItemDeleted(itemToDelete);
      }
      return true;
    } catch (error) {
      console.error('Unexpected error deleting item:', error);
      showDeleteError();
      return false;
    }
  }, [itemsRef, removeItem, showItemDeleted, showDeleteError]);

  const deleteCategoryWithItems = useCallback(async (categoryName: string) => {
    try {
      const currentItems = itemsRef.current;
      const itemsInCategory = currentItems.filter(item => item.category === categoryName);
      
      await shoppingItemsService.deleteItemsByCategory(categoryName);
      removeItemsByCategory(categoryName);
      
      showCategoryDeleted(categoryName, itemsInCategory.length);
      return true;
    } catch (error) {
      console.error('Unexpected error deleting category:', error);
      showCategoryDeleteError();
      return false;
    }
  }, [itemsRef, removeItemsByCategory, showCategoryDeleted, showCategoryDeleteError]);

  return {
    addItem: addItemToDb,
    updateItem: updateItemInDb,
    deleteItem: deleteItemFromDb,
    deleteCategoryWithItems,
  };
};
