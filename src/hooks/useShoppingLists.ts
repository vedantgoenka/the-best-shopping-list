
import { useShoppingListsData } from './shopping/useShoppingListsData';
import { useShoppingListOperations } from './shopping/useShoppingListOperations';

export const useShoppingLists = () => {
  const { lists, setLists, currentList, setCurrentList, loading, refetch } = useShoppingListsData();
  
  const { createList, updateList, deleteList, switchToList } = useShoppingListOperations({
    lists,
    setLists,
    currentList,
    setCurrentList,
  });

  return {
    lists,
    currentList,
    loading,
    createList,
    updateList,
    deleteList,
    switchToList,
    refetch,
  };
};
