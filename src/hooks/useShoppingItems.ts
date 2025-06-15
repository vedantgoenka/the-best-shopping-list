
import React from 'react';
import { useShoppingItemsData } from './shopping/useShoppingItemsData';
import { useShoppingItemsState } from './shopping/useShoppingItemsState';
import { useShoppingItemOperations } from './shopping/useShoppingItemOperations';
import { useShoppingItemsReorderLogic } from './shopping/useShoppingItemsReorderLogic';

interface UseShoppingItemsProps {
  currentListId?: string | null;
}

export const useShoppingItems = ({ currentListId }: UseShoppingItemsProps = {}) => {
  const { items: initialItems, loading, refetch } = useShoppingItemsData({ currentListId });
  
  const {
    items,
    itemsRef,
    setItems,
    addItem: addItemToState,
    updateItem: updateItemInState,
    removeItem,
    removeItemsByCategory,
    updateItems,
  } = useShoppingItemsState(initialItems);

  // Sync items when initial data changes
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems, setItems]);

  const { addItem, updateItem, deleteItem, deleteCategoryWithItems } = useShoppingItemOperations({
    items,
    itemsRef,
    addItem: addItemToState,
    updateItem: updateItemInState,
    removeItem,
    removeItemsByCategory,
    currentListId,
  });
  
  const { reorderItems } = useShoppingItemsReorderLogic(
    items,
    updateItems,
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
