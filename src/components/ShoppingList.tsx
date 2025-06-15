
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useShoppingItems } from '@/hooks/useShoppingItems';
import { useShoppingLists } from '@/hooks/useShoppingLists';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useShoppingListState } from '@/hooks/useShoppingListState';
import { useShoppingListFilters } from '@/hooks/useShoppingListFilters';
import SearchAndAddItem from './SearchAndAddItem';
import Header from './Header';
import ProgressBanner from './ProgressBanner';
import FilterControls from './FilterControls';
import SortControls from './SortControls';
import ShoppingListContent from './ShoppingListContent';

const ShoppingList = () => {
  const { currentList, loading: listsLoading } = useShoppingLists();
  const { items, loading: itemsLoading, addItem, updateItem, deleteItem, deleteCategoryWithItems, reorderItems } = useShoppingItems({ 
    currentListId: currentList?.id 
  });
  
  const {
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
  } = useShoppingListState();

  const { filteredItems, sortedItems, groupedItems } = useShoppingListFilters({
    items,
    searchTerm,
    showCompleted,
    sortBy,
    sortOrder,
    groupBy,
    isManuallyReordering: false, // Will be updated by drag and drop hook
  });

  const { sensors, isManuallyReordering, handleDragEnd, resetManualReordering } = useDragAndDrop({
    sortedItems,
    reorderItems,
  });

  // Update filtered items with manual reordering state
  const { filteredItems: finalFilteredItems, sortedItems: finalSortedItems, groupedItems: finalGroupedItems } = useShoppingListFilters({
    items,
    searchTerm,
    showCompleted,
    sortBy,
    sortOrder,
    groupBy,
    isManuallyReordering,
  });

  const handleDeleteCategory = async (categoryName: string) => {
    await deleteCategoryWithItems(categoryName);
  };

  const handleSortChangeWithReset = (newSortBy: typeof sortBy) => {
    handleSortChange(newSortBy, resetManualReordering);
  };

  const loading = listsLoading || itemsLoading;

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

  // Show message if no current list is selected
  if (!currentList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <p className="text-gray-600 text-lg font-medium">No shopping list selected</p>
          </div>
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
      
      <div className="container mx-auto px-1 sm:px-4 py-2 sm:py-8 max-w-4xl pb-32">
        <div className="max-w-full mx-auto space-y-2 sm:space-y-6">
          <SearchAndAddItem
            items={items}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
          />
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-[0.5px] border-white/30 overflow-hidden">
            <div className="p-2 sm:p-6 border-b border-gray-100 bg-white/50">
              <div className="flex items-center justify-between gap-1 sm:gap-4">
                <FilterControls
                  groupBy={groupBy}
                  showCompleted={showCompleted}
                  onGroupChange={handleGroupChange}
                  onShowCompletedChange={setShowCompleted}
                />
                
                <SortControls
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChangeWithReset}
                />
              </div>
            </div>

            <div className="p-2 sm:p-6">
              <ShoppingListContent
                filteredItems={finalFilteredItems}
                sortedItems={finalSortedItems}
                groupedItems={finalGroupedItems}
                searchTerm={searchTerm}
                groupBy={groupBy}
                collapsedGroups={collapsedGroups}
                sensors={sensors}
                handleDragEnd={handleDragEnd}
                updateItem={updateItem}
                deleteItem={deleteItem}
                handleDeleteCategory={handleDeleteCategory}
                toggleGroupCollapse={toggleGroupCollapse}
                onClearSearch={() => setSearchTerm('')}
                items={items}
              />
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
