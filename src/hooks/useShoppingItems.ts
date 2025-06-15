
import { useShoppingItemsCore } from './useShoppingItemsCore';
import { useShoppingItemsCRUD } from './useShoppingItemsCRUD';
import { useShoppingItemsReorder } from './useShoppingItemsReorder';

export const useShoppingItems = () => {
  const { items, setItems, loading, refetch } = useShoppingItemsCore();
  
  const { addItem, updateItem, deleteItem, deleteCategoryWithItems } = useShoppingItemsCRUD(
    items,
    setItems
  );
  
  const { reorderItems } = useShoppingItemsReorder(
    items,
    setItems,
    refetch
  );

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    deleteCategoryWithItems,
    reorderItems,
    refetch,
  };
};
