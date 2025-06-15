
import { useState, useRef, useEffect } from 'react';
import { ShoppingItem } from '@/types/shoppingItem';

export const useShoppingItemsState = (initialItems: ShoppingItem[] = []) => {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const sortItems = (items: ShoppingItem[]) => {
    return items.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.order_index - a.order_index;
    });
  };

  const updateItems = (updater: (prevItems: ShoppingItem[]) => ShoppingItem[]) => {
    setItems(prevItems => {
      const newItems = updater(prevItems);
      return sortItems(newItems);
    });
  };

  const addItem = (item: ShoppingItem, maintainOrder = false) => {
    if (maintainOrder) {
      updateItems(prev => sortItems([...prev, item]));
    } else {
      setItems(prev => [item, ...prev]);
    }
  };

  const updateItem = (id: string, updates: Partial<ShoppingItem>) => {
    updateItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const removeItemsByCategory = (categoryName: string) => {
    setItems(prev => prev.filter(item => item.category !== categoryName));
  };

  return {
    items,
    itemsRef,
    setItems,
    addItem,
    updateItem,
    removeItem,
    removeItemsByCategory,
    updateItems,
  };
};
