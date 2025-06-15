
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

  const addItem = async (
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
      // Check for existing item in current state (only among non-deleted items)
      const existingItem = items.find(item => 
        item.text.toLowerCase() === text.trim().toLowerCase()
      );

      if (existingItem) {
        const updates = createItemUpdates(existingItem, quantity, category, notes, shopName);
        
        // If we're trying to set completed status and it's different from existing
        if (completed !== undefined && existingItem.completed !== completed) {
          updates.completed = completed;
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

      // Item doesn't exist in current state, create new one
      // Use specific order index if provided, otherwise calculate from current items
      const orderIndex = specificOrderIndex !== undefined ? specificOrderIndex : (getMaxOrderIndex(items) + 1);
      
      console.log('Creating item with order index:', orderIndex, 'for item:', text);
      
      const newItem = await shoppingItemsService.createItem({
        text,
        quantity: quantity || 1,
        category,
        notes,
        shop_name: shopName,
        order_index: orderIndex,
        completed: completed || false, // Set completion status when creating
      });

      // Add item to beginning or end based on maintainOrder flag and specificOrderIndex
      if (maintainOrder && specificOrderIndex !== undefined) {
        // When maintaining order with specific index, add to end and let sorting handle it
        setItems(prev => [...prev, newItem]);
      } else if (maintainOrder) {
        // When maintaining order without specific index, add to end
        setItems(prev => [...prev, newItem]);
      } else {
        // Default behavior - add to beginning
        setItems(prev => [newItem, ...prev]);
      }
      showItemAdded(newItem);
      return true;
    } catch (error) {
      console.error('Unexpected error adding item:', error);
      showAddError();
      return false;
    }
  };

  const updateItem = async (id: string, updates: Partial<Pick<ShoppingItem, 'text' | 'quantity' | 'completed' | 'category' | 'notes' | 'shop_name'>>) => {
    try {
      await shoppingItemsService.updateItem(id, updates);

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      showItemUpdated(updates);
      return true;
    } catch (error) {
      console.error('Unexpected error updating item:', error);
      showUpdateError();
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const itemToDelete = items.find(item => item.id === id);
      
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
  };

  const deleteCategoryWithItems = async (categoryName: string) => {
    try {
      const itemsInCategory = items.filter(item => item.category === categoryName);
      
      await shoppingItemsService.deleteItemsByCategory(categoryName);

      setItems(prev => prev.filter(item => item.category !== categoryName));
      
      showCategoryDeleted(categoryName, itemsInCategory.length);
      return true;
    } catch (error) {
      console.error('Unexpected error deleting category:', error);
      showCategoryDeleteError();
      return false;
    }
  };

  return {
    addItem,
    updateItem,
    deleteItem,
    deleteCategoryWithItems,
  };
};
