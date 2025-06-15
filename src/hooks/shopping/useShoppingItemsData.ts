
import { useState, useEffect } from 'react';
import { ShoppingItem } from '@/types/shoppingItem';
import { shoppingItemsService } from '@/services/shoppingItemsService';
import { useShoppingItemsToast } from '@/hooks/useShoppingItemsToast';

interface UseShoppingItemsDataProps {
  currentListId?: string | null;
}

export const useShoppingItemsData = ({ currentListId }: UseShoppingItemsDataProps = {}) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showLoadError } = useShoppingItemsToast();

  const loadItems = async () => {
    try {
      setLoading(true);
      let data: ShoppingItem[];
      
      if (currentListId) {
        // Fetch items for specific list
        data = await (shoppingItemsService as any).fetchItemsByList(currentListId);
      } else {
        // Fetch all items (backward compatibility)
        data = await shoppingItemsService.fetchItems();
      }
      
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
  }, [currentListId]);

  return {
    items,
    setItems,
    loading,
    refetch: loadItems,
  };
};
