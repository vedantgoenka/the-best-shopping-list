
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { ShoppingItem } from '@/types/shoppingItem';
import { shoppingItemsService } from '@/services/shoppingItemsService';
import { 
  getMaxOrderIndex, 
  createItemUpdates, 
  getUpdateDetailsMessage, 
  getQuantityText 
} from '@/utils/shoppingItemUtils';

export const useShoppingItems = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items from Supabase on component mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await shoppingItemsService.fetchItems();
      setItems(data);
    } catch (error) {
      console.error('Unexpected error loading items:', error);
      toast({
        title: "Error loading items",
        description: "An unexpected error occurred while loading your shopping list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reorderItems = async (reorderedItems: ShoppingItem[]) => {
    try {
      // Update the local state immediately
      setItems(prevItems => {
        // Create a new array with the reordered items
        const itemsMap = new Map(prevItems.map(item => [item.id, item]));
        const reorderedIds = reorderedItems.map(item => item.id);
        
        // Find the position of the first reordered item in the original array
        const firstReorderedIndex = prevItems.findIndex(item => reorderedIds.includes(item.id));
        
        // Create the new array by replacing the reordered section
        const newItems = [...prevItems];
        let insertIndex = firstReorderedIndex;
        
        // Remove all reordered items from their current positions
        for (let i = newItems.length - 1; i >= 0; i--) {
          if (reorderedIds.includes(newItems[i].id)) {
            newItems.splice(i, 1);
          }
        }
        
        // Insert reordered items at the correct position
        reorderedItems.forEach((item, index) => {
          newItems.splice(insertIndex + index, 0, { ...item, order_index: insertIndex + index });
        });
        
        // Update order_index for all items after the reordered section
        return newItems.map((item, index) => ({ ...item, order_index: index }));
      });

      // Calculate the correct order indices based on the current position in the full items array
      const itemsMap = new Map(items.map(item => [item.id, item]));
      const reorderedIds = reorderedItems.map(item => item.id);
      
      // Find where these items should be positioned
      const allItemsWithoutReordered = items.filter(item => !reorderedIds.includes(item.id));
      const firstReorderedItemOriginalIndex = items.findIndex(item => reorderedIds.includes(item.id));
      
      // Calculate new order indices
      const updatePromises = reorderedItems.map((item, relativeIndex) => {
        const newOrderIndex = firstReorderedItemOriginalIndex + relativeIndex;
        return shoppingItemsService.updateItemOrder(item.id, newOrderIndex);
      });
      
      await Promise.all(updatePromises);

      toast({
        title: "Items reordered",
        description: "Your shopping list order has been saved.",
      });
    } catch (error) {
      console.error('Error reordering items:', error);
      // Revert the local state by reloading from database
      await loadItems();
      toast({
        title: "Error reordering items",
        description: "Failed to save the item order. The list has been restored.",
        variant: "destructive",
      });
    }
  };

  const addItem = async (text: string, quantity: number, category?: string, notes?: string, shopName?: string) => {
    try {
      // Check for existing item in current state (only among non-deleted items)
      const existingItem = items.find(item => 
        item.text.toLowerCase() === text.trim().toLowerCase()
      );

      if (existingItem) {
        const updates = createItemUpdates(existingItem, quantity, category, notes, shopName);
        
        if (Object.keys(updates).length > 0) {
          const success = await updateItem(existingItem.id, updates);
          if (success) {
            const updateDetails = getUpdateDetailsMessage(updates);
            toast({
              title: "Item updated!",
              description: `"${existingItem.text}" already exists. Updated ${updateDetails}.`,
            });
          }
          return success;
        } else {
          toast({
            title: "Item already exists",
            description: `"${existingItem.text}" is already in your list.`,
          });
          return true;
        }
      }

      // Item doesn't exist in current state, create new one
      const maxOrderIndex = getMaxOrderIndex(items);
      const newItem = await shoppingItemsService.createItem({
        text,
        quantity: quantity || 1,
        category,
        notes,
        shop_name: shopName,
        order_index: maxOrderIndex + 1,
      });

      setItems(prev => [newItem, ...prev]);
      const quantityText = getQuantityText(newItem.quantity);
      toast({
        title: "Item added!",
        description: `"${newItem.text}${quantityText}" was added to your shopping list.`,
      });
      return true;
    } catch (error) {
      console.error('Unexpected error adding item:', error);
      toast({
        title: "Error adding item",
        description: "An unexpected error occurred while adding the item.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateItem = async (id: string, updates: Partial<Pick<ShoppingItem, 'text' | 'quantity' | 'completed' | 'category' | 'notes' | 'shop_name'>>) => {
    try {
      await shoppingItemsService.updateItem(id, updates);

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      if (updates.text || updates.quantity || updates.category || updates.notes || updates.shop_name) {
        toast({
          title: "Item updated!",
          description: "Your item has been successfully updated.",
        });
      }
      return true;
    } catch (error) {
      console.error('Unexpected error updating item:', error);
      toast({
        title: "Error updating item",
        description: "An unexpected error occurred while updating the item.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const itemToDelete = items.find(item => item.id === id);
      
      await shoppingItemsService.deleteItem(id);

      setItems(prev => prev.filter(item => item.id !== id));
      
      if (itemToDelete) {
        const quantityText = getQuantityText(itemToDelete.quantity);
        toast({
          title: "Item removed",
          description: `"${itemToDelete.text}${quantityText}" was removed from your list.`,
        });
      }
      return true;
    } catch (error) {
      console.error('Unexpected error deleting item:', error);
      toast({
        title: "Error deleting item",
        description: "An unexpected error occurred while deleting the item.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCategoryWithItems = async (categoryName: string) => {
    try {
      const itemsInCategory = items.filter(item => item.category === categoryName);
      
      await shoppingItemsService.deleteItemsByCategory(categoryName);

      setItems(prev => prev.filter(item => item.category !== categoryName));
      
      toast({
        title: "Category deleted",
        description: `Category "${categoryName}" and ${itemsInCategory.length} item${itemsInCategory.length !== 1 ? 's' : ''} removed.`,
      });
      return true;
    } catch (error) {
      console.error('Unexpected error deleting category:', error);
      toast({
        title: "Error deleting category",
        description: "An unexpected error occurred while deleting the category.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    deleteCategoryWithItems,
    reorderItems,
    refetch: loadItems,
  };
};
