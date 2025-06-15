
import { useState, useEffect } from 'react';
import { ShoppingList } from '@/types/shoppingList';
import { shoppingListsRepository } from '@/services/shoppingLists';

export const useShoppingListsData = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLists = async () => {
    try {
      setLoading(true);
      const data = await shoppingListsRepository.fetchLists();
      setLists(data);
      
      // Set current list to first list if none selected
      if (!currentList && data.length > 0) {
        setCurrentList(data[0]);
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  return {
    lists,
    setLists,
    currentList,
    setCurrentList,
    loading,
    refetch: loadLists,
  };
};
