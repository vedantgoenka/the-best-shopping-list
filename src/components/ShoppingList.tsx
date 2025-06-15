
import React, { useState, useMemo } from 'react';
import { ShoppingBag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingItems } from '@/hooks/useShoppingItems';
import SearchAndAddItem from './SearchAndAddItem';
import GroupingToggle from './GroupingToggle';
import ImportItemsDialog from './ImportItemsDialog';
import DragDropList from './DragDropList';
import SortableShoppingItem from './SortableShoppingItem';
import CategoryDeleteDialog from './CategoryDeleteDialog';
import Header from './Header';

const ShoppingList = () => {
  const { items, loading, addItem, updateItem, deleteItem, deleteCategoryWithItems, reorderItems } = useShoppingItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [groupBy, setGroupBy] = useState<'category' | 'shop'>(() => {
    return (localStorage.getItem('shoppingListGroupBy') as 'category' | 'shop') || 'category';
  });

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

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: typeof items } = {};
    
    filteredItems.forEach(item => {
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

    return sortedGroups.map(groupKey => ({
      name: groupKey,
      items: groups[groupKey]
    }));
  }, [filteredItems, groupBy]);

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
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Overview */}
        <div className="text-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Shopping Progress</h2>
            {totalItems === 0 ? (
              <p className="text-gray-600 text-lg">Your list is empty - time to add some items!</p>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600 text-lg">
                  {completedItems} of {totalItems} items completed
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {Math.round(progressPercentage)}% complete
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <SearchAndAddItem
            items={items}
            onAddItem={addItem}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
          />
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white/50">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="flex-1">
                  <GroupingToggle groupBy={groupBy} onGroupChange={handleGroupChange} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant={showCompleted ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="whitespace-nowrap h-10 px-4 font-medium shadow-sm"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showCompleted ? 'Hide' : 'Show'} Completed
                  </Button>
                  <ImportItemsDialog 
                    onAddItem={addItem} 
                    onUpdateItem={updateItem}
                    items={items}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {searchTerm ? 'No matching items' : 'Your list is empty'}
                  </h3>
                  <p className="text-gray-500 text-lg mb-6">
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
                <div className="space-y-8">
                  {groupedItems.map(group => (
                    <div key={group.name} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-800">
                            {group.name}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                            {group.items.length}
                          </span>
                        </div>
                        {groupBy === 'category' && group.name !== 'No Category' && (
                          <CategoryDeleteDialog
                            categoryName={group.name}
                            itemCount={group.items.length}
                            onConfirmDelete={handleDeleteCategory}
                          />
                        )}
                      </div>
                      <DragDropList items={group.items} onReorder={handleReorder}>
                        <div className="space-y-3">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
