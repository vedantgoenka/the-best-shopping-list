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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your shopping list...</p>
        </div>
      </div>
    );
  }

  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg">
            {totalItems === 0 ? "Your list is empty" : 
             `${completedItems} of ${totalItems} items completed`}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <SearchAndAddItem
            items={items}
            onAddItem={addItem}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
          />
          
          <div className="bg-white rounded-xl shadow-lg mb-6 border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="flex-1">
                  <GroupingToggle groupBy={groupBy} onGroupChange={handleGroupChange} />
                </div>
                <div className="flex gap-3 items-center justify-center sm:justify-end">
                  <Button
                    variant={showCompleted ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="whitespace-nowrap h-9"
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
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? 'No items match your search' : 'No items in your list'}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedItems.map(group => (
                    <div key={group.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2 flex-1">
                          {group.name} ({group.items.length})
                        </h3>
                        {groupBy === 'category' && group.name !== 'No Category' && (
                          <CategoryDeleteDialog
                            categoryName={group.name}
                            itemCount={group.items.length}
                            onConfirmDelete={handleDeleteCategory}
                          />
                        )}
                      </div>
                      <DragDropList items={group.items} onReorder={handleReorder}>
                        <div className="space-y-2">
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
