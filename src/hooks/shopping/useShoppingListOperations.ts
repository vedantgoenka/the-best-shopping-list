
import { useCallback } from 'react';
import { ShoppingList } from '@/types/shoppingList';
import { shoppingListsRepository } from '@/services/shoppingLists';
import { useToast } from '@/hooks/use-toast';

interface UseShoppingListOperationsProps {
  lists: ShoppingList[];
  setLists: (lists: ShoppingList[]) => void;
  currentList: ShoppingList | null;
  setCurrentList: (list: ShoppingList | null) => void;
}

export const useShoppingListOperations = ({
  lists,
  setLists,
  currentList,
  setCurrentList,
}: UseShoppingListOperationsProps) => {
  const { toast } = useToast();

  const createList = useCallback(async (name: string) => {
    try {
      const newList = await shoppingListsRepository.createList({ name });
      setLists([...lists, newList]);
      toast({
        title: "Shopping list created",
        description: `"${name}" has been created successfully.`,
      });
      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: "Error",
        description: "Failed to create shopping list.",
        variant: "destructive",
      });
      return null;
    }
  }, [lists, setLists, toast]);

  const updateList = useCallback(async (id: string, name: string) => {
    try {
      await shoppingListsRepository.updateList(id, { name });
      const updatedLists = lists.map(list => 
        list.id === id ? { ...list, name } : list
      );
      setLists(updatedLists);
      
      if (currentList?.id === id) {
        setCurrentList({ ...currentList, name });
      }
      
      toast({
        title: "Shopping list updated",
        description: `List renamed to "${name}".`,
      });
    } catch (error) {
      console.error('Error updating list:', error);
      toast({
        title: "Error",
        description: "Failed to update shopping list.",
        variant: "destructive",
      });
    }
  }, [lists, setLists, currentList, setCurrentList, toast]);

  const deleteList = useCallback(async (id: string) => {
    try {
      await shoppingListsRepository.deleteList(id);
      const remainingLists = lists.filter(list => list.id !== id);
      setLists(remainingLists);
      
      if (currentList?.id === id) {
        setCurrentList(remainingLists.length > 0 ? remainingLists[0] : null);
      }
      
      toast({
        title: "Shopping list deleted",
        description: "The shopping list has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: "Error",
        description: "Failed to delete shopping list.",
        variant: "destructive",
      });
    }
  }, [lists, setLists, currentList, setCurrentList, toast]);

  const switchToList = useCallback((list: ShoppingList) => {
    setCurrentList(list);
    localStorage.setItem('currentShoppingListId', list.id);
  }, [setCurrentList]);

  return {
    createList,
    updateList,
    deleteList,
    switchToList,
  };
};
