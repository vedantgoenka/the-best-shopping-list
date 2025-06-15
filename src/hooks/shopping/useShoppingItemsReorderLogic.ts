
import { ShoppingItem } from '@/types/shoppingItem';
import { shoppingItemsService } from '@/services/shoppingItemsService';
import { useShoppingItemsToast } from '@/hooks/useShoppingItemsToast';

export const useShoppingItemsReorderLogic = (
  items: ShoppingItem[],
  updateItems: (updater: (prevItems: ShoppingItem[]) => ShoppingItem[]) => void,
  refetch: () => Promise<void>
) => {
  const { showItemsReordered, showReorderError } = useShoppingItemsToast();

  const reorderItems = async (reorderedItems: ShoppingItem[]) => {
    try {
      // Update the local state immediately
      updateItems(prevItems => {
        const reorderedIds = reorderedItems.map(item => item.id);
        const firstReorderedIndex = prevItems.findIndex(item => reorderedIds.includes(item.id));
        
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
        
        // Update order_index for all items
        const totalItems = newItems.length;
        return newItems.map((item, index) => ({ 
          ...item, 
          order_index: totalItems - 1 - index
        }));
      });

      // Calculate the correct order indices for database update
      const reorderedIds = reorderedItems.map(item => item.id);
      const firstReorderedItemOriginalIndex = items.findIndex(item => reorderedIds.includes(item.id));
      
      const totalItems = items.length;
      const updatePromises = reorderedItems.map((item, relativeIndex) => {
        const newArrayPosition = firstReorderedItemOriginalIndex + relativeIndex;
        const newOrderIndex = totalItems - 1 - newArrayPosition;
        return shoppingItemsService.updateItemOrder(item.id, newOrderIndex);
      });
      
      await Promise.all(updatePromises);
      showItemsReordered();
    } catch (error) {
      console.error('Error reordering items:', error);
      await refetch();
      showReorderError();
    }
  };

  return {
    reorderItems,
  };
};
