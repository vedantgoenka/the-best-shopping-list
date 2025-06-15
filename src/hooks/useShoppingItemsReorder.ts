import { ShoppingItem } from '@/types/shoppingItem';
import { shoppingItemsService } from '@/services/shoppingItemsService';
import { useShoppingItemsToast } from './useShoppingItemsToast';

export const useShoppingItemsReorder = (
  items: ShoppingItem[],
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>,
  refetch: () => Promise<void>
) => {
  const { showItemsReordered, showReorderError } = useShoppingItemsToast();

  const reorderItems = async (reorderedItems: ShoppingItem[]) => {
    try {
      // Update the local state immediately
      setItems(prevItems => {
        // Create a new array with the reordered items
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
          newItems.splice(insertIndex + index, 0, item);
        });
        
        // Update order_index for all items - higher index for items at the top
        const totalItems = newItems.length;
        return newItems.map((item, index) => ({ 
          ...item, 
          order_index: totalItems - 1 - index // Reverse index: first item gets highest order_index
        }));
      });

      // Calculate the correct order indices for database update
      const reorderedIds = reorderedItems.map(item => item.id);
      const firstReorderedItemOriginalIndex = items.findIndex(item => reorderedIds.includes(item.id));
      
      // Calculate new order indices - need to account for descending order
      const totalItems = items.length;
      const updatePromises = reorderedItems.map((item, relativeIndex) => {
        const newArrayPosition = firstReorderedItemOriginalIndex + relativeIndex;
        const newOrderIndex = totalItems - 1 - newArrayPosition; // Convert position to descending order_index
        return shoppingItemsService.updateItemOrder(item.id, newOrderIndex);
      });
      
      await Promise.all(updatePromises);

      showItemsReordered();
    } catch (error) {
      console.error('Error reordering items:', error);
      // Revert the local state by reloading from database
      await refetch();
      showReorderError();
    }
  };

  return {
    reorderItems,
  };
};
