import { useMemo } from 'react';
import { ShoppingItem } from '@/types/shoppingItem';

interface UseShoppingListFiltersProps {
  items: ShoppingItem[];
  searchTerm: string;
  showCompleted: boolean;
  sortBy: 'manual' | 'name' | 'category' | 'shop' | 'created' | 'completed';
  sortOrder: 'asc' | 'desc';
  groupBy: 'category' | 'shop';
  isManuallyReordering: boolean;
}

export const useShoppingListFilters = ({
  items,
  searchTerm,
  showCompleted,
  sortBy,
  sortOrder,
  groupBy,
  isManuallyReordering,
}: UseShoppingListFiltersProps) => {
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.shop_name && item.shop_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCompleted = showCompleted || !item.completed;
      return matchesSearch && matchesCompleted;
    });
  }, [items, searchTerm, showCompleted]);

  const sortedItems = useMemo(() => {
    // If we're manually reordering, don't apply automatic sorting
    if (isManuallyReordering) {
      return filteredItems;
    }

    const sorted = [...filteredItems].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'manual':
          // For manual sorting, compare order_index directly
          compareValue = a.order_index - b.order_index;
          break;
        case 'name':
          compareValue = a.text.localeCompare(b.text);
          break;
        case 'category':
          compareValue = (a.category || '').localeCompare(b.category || '');
          break;
        case 'shop':
          compareValue = (a.shop_name || '').localeCompare(b.shop_name || '');
          break;
        case 'created':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'completed':
          compareValue = Number(a.completed) - Number(b.completed);
          break;
        default:
          compareValue = 0;
      }
      
      // Apply the sortOrder (asc/desc) to all sorting types
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [filteredItems, sortBy, sortOrder, isManuallyReordering]);

  const allItemsProgressData = useMemo(() => {
    const groups: { [key: string]: { items: typeof items, completedCount: number, totalCount: number, progressPercentage: number } } = {};
    
    items.forEach(item => {
      let groupKey: string;
      
      if (groupBy === 'category') {
        groupKey = item.category || 'No Category';
      } else {
        groupKey = item.shop_name || 'No Shop';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          items: [],
          completedCount: 0,
          totalCount: 0,
          progressPercentage: 0
        };
      }
      
      groups[groupKey].items.push(item);
      groups[groupKey].totalCount++;
      if (item.completed) {
        groups[groupKey].completedCount++;
      }
    });

    Object.keys(groups).forEach(groupKey => {
      const group = groups[groupKey];
      group.progressPercentage = group.totalCount > 0 
        ? (group.completedCount / group.totalCount) * 100 
        : 0;
    });

    return groups;
  }, [items, groupBy]);

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: typeof items } = {};
    
    sortedItems.forEach(item => {
      let groupKey: string;
      
      if (groupBy === 'category') {
        groupKey = item.category || 'No Category';
      } else {
        groupKey = item.shop_name || 'No Shop';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => {
      const noGroupA = a.startsWith('No ');
      const noGroupB = b.startsWith('No ');
      
      if (noGroupA && !noGroupB) return 1;
      if (!noGroupA && noGroupB) return -1;
      return a.localeCompare(b);
    });

    return sortedGroups.map(groupKey => {
      const progressData = allItemsProgressData[groupKey] || { completedCount: 0, totalCount: 0, progressPercentage: 0 };
      
      return {
        name: groupKey,
        items: groups[groupKey],
        completedCount: progressData.completedCount,
        totalCount: progressData.totalCount,
        progressPercentage: progressData.progressPercentage
      };
    });
  }, [sortedItems, groupBy, allItemsProgressData]);

  return {
    filteredItems,
    sortedItems,
    groupedItems,
  };
};
