import React, { useState, useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useShoppingItems } from '@/hooks/useShoppingItems';
import SearchAndAddItem from './SearchAndAddItem';
import DragDropList from './DragDropList';
import SortableShoppingItem from './SortableShoppingItem';
import Header from './Header';
import ProgressBanner from './ProgressBanner';
import FilterControls from './FilterControls';
import SortControls from './SortControls';
import GroupHeader from './GroupHeader';
import EmptyState from './EmptyState';

const ShoppingList = () => {
  const { items, loading, addItem, updateItem, deleteItem, deleteCategoryWithItems, reorderItems } = useShoppingItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'shop' | 'created' | 'completed'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<'category' | 'shop'>(() => {
    return (localStorage.getItem('shoppingListGroupBy') as 'category' | 'shop') || 'category';
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
    const sorted = [...filteredItems].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
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
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [filteredItems, sortBy, sortOrder]);

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

  const handleGroupChange = (newGroupBy: 'category' | 'shop') => {
    setGroupBy(newGroupBy);
    localStorage.setItem('shoppingListGroupBy', newGroupBy);
  };

  const handleReorder = (reorderedItems: typeof items) => {
    reorderItems(reorderedItems);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    await deleteCategoryWithItems(categoryName);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-blue-500 mx-auto mb-6 animate-pulse" />
          <p className="text-gray-600 text-lg font-medium">Loading your shopping list...</p>
        </div>
      </div>
    );
  }

  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl pb-32">
        <div className="max-w-full mx-auto space-y-4 sm:space-y-6">
          <SearchAndAddItem
            items={items}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
          />
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 overflow-hidden">
            <div className="p-3 sm:p-6 border-b border-gray-100 bg-white/50">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <FilterControls
                  groupBy={groupBy}
                  showCompleted={showCompleted}
                  onGroupChange={handleGroupChange}
                  onShowCompletedChange={setShowCompleted}
                />
                
                <SortControls
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>

            <div className="p-3 sm:p-6">
              {filteredItems.length === 0 ? (
                <EmptyState
                  searchTerm={searchTerm}
                  onClearSearch={() => setSearchTerm('')}
                />
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {groupedItems.map(group => (
                    <Collapsible 
                      key={group.name} 
                      open={!collapsedGroups.has(group.name)}
                      onOpenChange={() => toggleGroupCollapse(group.name)}
                    >
                      <div className="space-y-3 sm:space-y-4">
                        <GroupHeader
                          groupName={group.name}
                          itemCount={group.items.length}
                          completedCount={group.completedCount}
                          totalCount={group.totalCount}
                          progressPercentage={group.progressPercentage}
                          isCollapsed={collapsedGroups.has(group.name)}
                          groupBy={groupBy}
                          onDeleteCategory={handleDeleteCategory}
                        />
                        <CollapsibleContent>
                          <DragDropList items={group.items} onReorder={handleReorder}>
                            <div className="space-y-2 sm:space-y-3">
                              {group.items.map(item => (
                                <SortableShoppingItem
                                  key={item.id}
                                  item={item}
                                  onUpdate={updateItem}
                                  onDelete={deleteItem}
                                  items={items}
                                />
                              ))}
                            </div>
                          </DragDropList>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <ProgressBanner 
          totalItems={totalItems}
          completedItems={completedItems}
          progressPercentage={progressPercentage}
        />
      </div>
    </div>
  );
};

export default ShoppingList;
