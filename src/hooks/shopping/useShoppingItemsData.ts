
import { useState, useEffect } from 'react';
import { ShoppingItem } from '@/types/shoppingItem';
import { shoppingItemsService } from '@/services/shoppingItemsService';
import { useShoppingItemsToast } from '@/hooks/useShoppingItemsToast';

export const useShoppingItemsData = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showLoadError } = useShoppingItemsToast();

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await shoppingItemsService.fetchItems();
      setItems(data);
    } catch (error) {
      console.error('Unexpected error loading items:', error);
      showLoadError();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return {
    items,
    setItems,
    loading,
    refetch: loadItems,
  };
};
