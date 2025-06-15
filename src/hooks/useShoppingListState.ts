
import { useState } from 'react';

export const useShoppingListState = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'shop' | 'created' | 'completed'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<'category' | 'shop'>(() => {
    return (localStorage.getItem('shoppingListGroupBy') as 'category' | 'shop') || 'category';
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleGroupChange = (newGroupBy: 'category' | 'shop') => {
    setGroupBy(newGroupBy);
    localStorage.setItem('shoppingListGroupBy', newGroupBy);
  };

  const handleSortChange = (newSortBy: typeof sortBy, resetManualReordering: () => void) => {
    // Reset manual reordering when user changes sort
    resetManualReordering();
    
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    showCompleted,
    setShowCompleted,
    sortBy,
    sortOrder,
    groupBy,
    collapsedGroups,
    handleGroupChange,
    handleSortChange,
    toggleGroupCollapse,
  };
};
