
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
          newItems.splice(insertIndex + index, 0, { ...item, order_index: insertIndex + index });
        });
        
        // Update order_index for all items after the reordered section
        return newItems.map((item, index) => ({ ...item, order_index: index }));
      });

      // Calculate the correct order indices based on the current position in the full items array
      const reorderedIds = reorderedItems.map(item => item.id);
      const firstReorderedItemOriginalIndex = items.findIndex(item => reorderedIds.includes(item.id));
      
      // Calculate new order indices
      const updatePromises = reorderedItems.map((item, relativeIndex) => {
        const newOrderIndex = firstReorderedItemOriginalIndex + relativeIndex;
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
