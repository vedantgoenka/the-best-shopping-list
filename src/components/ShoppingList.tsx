
import React, { useState, useMemo } from 'react';
import { ShoppingBag, Filter, ArrowUpDown, Grid3X3, Store, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useShoppingItems } from '@/hooks/useShoppingItems';
import SearchAndAddItem from './SearchAndAddItem';
import ImportItemsDialog from './ImportItemsDialog';
import DragDropList from './DragDropList';
import SortableShoppingItem from './SortableShoppingItem';
import CategoryDeleteDialog from './CategoryDeleteDialog';
import Header from './Header';
import ProgressBanner from './ProgressBanner';

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

  // Calculate progress data for all items (not filtered) to show true category/shop completion status
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

    // Calculate progress percentages
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

    // Sort groups alphabetically, but keep "No Category"/"No Shop" at the end
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

  const handleToggleChange = (checked: boolean) => {
    handleGroupChange(checked ? 'shop' : 'category');
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
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-[0.5px] border-white/40 overflow-hidden">
            <div className="p-3 sm:p-6 border-b border-gray-100 bg-white/50">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Category</span>
                  </div>
                  
                  <Switch
                    checked={groupBy === 'shop'}
                    onCheckedChange={handleToggleChange}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
                  />
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Shop</span>
                    <Store className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                </div>
                
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant={showCompleted ? "default" : "outline"}
                    size="icon"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    title={showCompleted ? 'Hide completed items' : 'Show completed items'}
                  >
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        title="Sort options"
                      >
                        <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleSortChange('name')}>
                        Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange('category')}>
                        Sort by Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange('shop')}>
                        Sort by Shop {sortBy === 'shop' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange('created')}>
                        Sort by Date Added {sortBy === 'created' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange('completed')}>
                        Sort by Status {sortBy === 'completed' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-6">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 sm:py-16">
                  <div className="bg-gray-50 rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                    {searchTerm ? 'No matching items' : 'Your list is empty'}
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-lg mb-4 sm:mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms or clear the filter' 
                      : 'Add your first item to get started with your shopping list'
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                      className="shadow-sm"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  {groupedItems.map(group => (
                    <Collapsible 
                      key={group.name} 
                      open={!collapsedGroups.has(group.name)}
                      onOpenChange={() => toggleGroupCollapse(group.name)}
                    >
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <CollapsibleTrigger className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg p-1 sm:p-2 -m-1 sm:-m-2 transition-colors">
                            <ChevronDown 
                              className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-500 transition-transform duration-200 ${
                                collapsedGroups.has(group.name) ? '-rotate-90' : ''
                              }`} 
                            />
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                              {group.name}
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                              {group.items.length}
                            </span>
                            <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
                              <Progress 
                                value={group.progressPercentage} 
                                className="w-16 sm:w-20 h-2"
                              />
                              <span className="text-xs text-gray-500 min-w-[2.5rem] sm:min-w-[3rem]">
                                {group.completedCount}/{group.totalCount}
                              </span>
                            </div>
                          </CollapsibleTrigger>
                          {groupBy === 'category' && group.name !== 'No Category' && (
                            <CategoryDeleteDialog
                              categoryName={group.name}
                              itemCount={group.items.length}
                              onConfirmDelete={handleDeleteCategory}
                            />
                          )}
                        </div>
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
