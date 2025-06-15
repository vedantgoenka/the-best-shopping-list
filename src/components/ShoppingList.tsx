import React, { useState, useEffect } from 'react';
import { RefreshCw, Import, Search, X, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useShoppingItems } from '@/hooks/useShoppingItems';
import { toast } from '@/hooks/use-toast';
import AddItemForm from './AddItemForm';
import ShoppingItem from './ShoppingItem';
import ImportItemsDialog from './ImportItemsDialog';
import GroupingToggle from './GroupingToggle';

interface DeletedItem {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
  category?: string | null;
  notes?: string | null;
  shop_name?: string | null;
}

const ShoppingList = () => {
  const { items, loading, addItem, updateItem, deleteItem, refetch } = useShoppingItems();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentlyDeleted, setRecentlyDeleted] = useState<DeletedItem | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
  const [groupBy, setGroupBy] = useState<'category' | 'shop'>(() => {
    const saved = localStorage.getItem('shopping-list-group-by');
    return (saved as 'category' | 'shop') || 'category';
  });

  // Save grouping preference to localStorage
  useEffect(() => {
    localStorage.setItem('shopping-list-group-by', groupBy);
  }, [groupBy]);

  // Clear undo timeout on component unmount
  useEffect(() => {
    return () => {
      if (undoTimeout) {
        clearTimeout(undoTimeout);
      }
    };
  }, [undoTimeout]);

  const handleTouchStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleTouchEnd = () => {
    setDraggedItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return false;

    // Store the deleted item for undo functionality
    setRecentlyDeleted({
      id: itemToDelete.id,
      text: itemToDelete.text,
      quantity: itemToDelete.quantity,
      completed: itemToDelete.completed,
      category: itemToDelete.category,
      notes: itemToDelete.notes,
      shop_name: itemToDelete.shop_name
    });

    // Clear any existing timeout
    if (undoTimeout) {
      clearTimeout(undoTimeout);
    }

    // Set a new timeout to clear the undo option after 10 seconds
    const timeout = setTimeout(() => {
      setRecentlyDeleted(null);
    }, 10000);
    setUndoTimeout(timeout);

    const success = await deleteItem(id);
    
    if (success) {
      toast({
        title: "Item deleted",
        description: "Tap undo if this was a mistake",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndoDelete}
            className="ml-2"
          >
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
        ),
      });
    }

    return success;
  };

  const handleUndoDelete = async () => {
    if (!recentlyDeleted) return;

    const success = await addItem(
      recentlyDeleted.text,
      recentlyDeleted.quantity,
      recentlyDeleted.category || undefined,
      recentlyDeleted.notes || undefined,
      recentlyDeleted.shop_name || undefined
    );

    if (success) {
      setRecentlyDeleted(null);
      if (undoTimeout) {
        clearTimeout(undoTimeout);
        setUndoTimeout(null);
      }
      toast({
        title: "Item restored",
        description: `"${recentlyDeleted.text}" has been restored to your list`,
      });
    }
  };

  const handleImportItems = async (importedItems: Array<{
    text: string;
    quantity: number;
    completed: boolean;
    category?: string;
  }>) => {
    const existingItemsMap = new Map(
      items.map(item => [item.text.toLowerCase(), item])
    );
    
    const newItems: typeof importedItems = [];
    const duplicatesToUpdate: Array<{
      existingItem: any;
      updates: any;
    }> = [];

    for (const importedItem of importedItems) {
      const existingItem = existingItemsMap.get(importedItem.text.toLowerCase());
      
      if (existingItem) {
        // Check if we need to update the existing item
        const updates: any = {};
        
        // Update completion status if different
        if (existingItem.completed !== importedItem.completed) {
          updates.completed = importedItem.completed;
        }
        
        // Update quantity if different and imported quantity is greater than 1
        if (importedItem.quantity > 1 && existingItem.quantity !== importedItem.quantity) {
          updates.quantity = importedItem.quantity;
        }
        
        // Update category if imported item has one and existing doesn't, or if they're different
        if (importedItem.category && 
            (!existingItem.category || existingItem.category !== importedItem.category)) {
          updates.category = importedItem.category;
        }
        
        // Only add to update list if there are actual changes
        if (Object.keys(updates).length > 0) {
          duplicatesToUpdate.push({ existingItem, updates });
        }
      } else {
        newItems.push(importedItem);
      }
    }

    // Add all new items
    const addPromises = newItems.map(item => 
      addItem(item.text, item.quantity, item.category, undefined, undefined)
    );
    
    // Update existing items with new information
    const updatePromises = duplicatesToUpdate.map(({ existingItem, updates }) => 
      updateItem(existingItem.id, updates)
    );
    
    await Promise.all([...addPromises, ...updatePromises]);

    // Show summary of what was imported and updated
    const summary = [];
    if (newItems.length > 0) {
      summary.push(`${newItems.length} new items added`);
    }
    if (duplicatesToUpdate.length > 0) {
      summary.push(`${duplicatesToUpdate.length} existing items updated`);
    }
    
    if (summary.length > 0) {
      console.log('Import summary:', summary.join(', '));
    }
  };

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.shop_name && item.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const completedCount = filteredItems.filter(item => item.completed).length;
  const totalCount = filteredItems.length;

  // Group filtered items by category or shop based on groupBy state
  const groupedItems = filteredItems.reduce((groups, item) => {
    const groupKey = groupBy === 'category' 
      ? (item.category || 'Uncategorized')
      : (item.shop_name || 'No Shop');
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, typeof filteredItems>);

  // Sort items within each group by completion status (incomplete first)
  Object.keys(groupedItems).forEach(groupKey => {
    groupedItems[groupKey].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1; // incomplete items first
    });
  });

  // Sort groups with "Uncategorized"/"No Shop" last
  const sortedGroups = Object.keys(groupedItems).sort((a, b) => {
    const isASpecial = a === 'Uncategorized' || a === 'No Shop';
    const isBSpecial = b === 'Uncategorized' || b === 'No Shop';
    
    if (isASpecial && !isBSpecial) return 1;
    if (!isASpecial && isBSpecial) return -1;
    return a.localeCompare(b);
  });

  // Calculate group progress and determine which groups are fully completed
  const groupProgress = Object.keys(groupedItems).reduce((progress, groupKey) => {
    const groupItems = groupedItems[groupKey];
    const completedInGroup = groupItems.filter(item => item.completed).length;
    const totalInGroup = groupItems.length;
    const percentage = totalInGroup > 0 ? (completedInGroup / totalInGroup) * 100 : 0;
    
    progress[groupKey] = {
      completed: completedInGroup,
      total: totalInGroup,
      percentage: percentage,
      isFullyCompleted: percentage === 100
    };
    
    return progress;
  }, {} as Record<string, { completed: number; total: number; percentage: number; isFullyCompleted: boolean }>);

  // Get default open groups (all incomplete groups)
  const defaultOpenGroups = sortedGroups.filter(groupKey => 
    !groupProgress[groupKey]?.isFullyCompleted
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-2 sm:p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center pt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Shopping List</h1>
            <p className="text-gray-600">Loading your items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-2 sm:p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Shopping List</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="text-gray-500 hover:text-gray-700 p-1 sm:p-2"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
              className="text-gray-500 hover:text-gray-700 p-1 sm:p-2"
            >
              <Import className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            {totalCount === 0 
              ? "Add your first item below" 
              : `${completedCount} of ${totalCount} items completed`
            }
          </p>
        </div>

        {/* Grouping Toggle */}
        <GroupingToggle groupBy={groupBy} onGroupByChange={setGroupBy} />

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search items, categories, shops, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-10 sm:h-12 text-sm sm:text-base"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Showing {totalCount} result{totalCount !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Undo Banner */}
        {recentlyDeleted && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                "{recentlyDeleted.text}" deleted
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndoDelete}
              className="text-orange-600 border-orange-300 hover:bg-orange-100 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
            >
              Undo
            </Button>
          </div>
        )}

        {/* Add Item Form */}
        <AddItemForm onAddItem={addItem} />

        {/* Shopping Items Grouped by Category or Shop */}
        <div className="space-y-4 sm:space-y-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {searchTerm ? (
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                ) : (
                  <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-500 mb-2">
                {searchTerm ? 'No items found' : 'Your list is empty'}
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                {searchTerm ? 'Try a different search term' : 'Add some items to get started!'}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={defaultOpenGroups} className="space-y-3 sm:space-y-4">
              {sortedGroups.map((groupKey) => {
                const progress = groupProgress[groupKey];
                const isFullyCompleted = progress?.isFullyCompleted;
                
                return (
                  <AccordionItem key={groupKey} value={groupKey} className="border-none">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <AccordionTrigger className="px-3 sm:px-4 py-2 sm:py-3 hover:no-underline hover:bg-gray-50">
                        <div className="flex items-center gap-2 sm:gap-3 w-full">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                              <h2 className={`text-sm sm:text-lg font-semibold ${isFullyCompleted ? 'text-green-600' : 'text-gray-700'}`}>
                                {groupKey}
                              </h2>
                              <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                                isFullyCompleted 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {progress?.completed}/{progress?.total}
                              </span>
                            </div>
                            <Progress 
                              value={progress?.percentage || 0} 
                              className="h-1.5 sm:h-2 w-full"
                            />
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
                          {groupedItems[groupKey].map((item) => (
                            <ShoppingItem
                              key={item.id}
                              item={item}
                              onUpdate={updateItem}
                              onDelete={handleDeleteItem}
                              draggedItem={draggedItem}
                              onTouchStart={handleTouchStart}
                              onTouchEnd={handleTouchEnd}
                            />
                          ))}
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>

        {/* Progress Summary */}
        {filteredItems.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm sm:text-base text-gray-600 font-medium">Overall Progress</span>
              <span className="text-xs sm:text-sm text-gray-500">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Total items: <span className="font-medium">{totalCount}</span>
              </p>
            </div>
          </div>
        )}

        {/* Import Dialog */}
        <ImportItemsDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImport={handleImportItems}
        />
      </div>
    </div>
  );
};

export default ShoppingList;
