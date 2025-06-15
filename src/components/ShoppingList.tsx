import React, { useState } from 'react';
import { RefreshCw, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShoppingItems } from '@/hooks/useShoppingItems';
import AddItemForm from './AddItemForm';
import ShoppingItem from './ShoppingItem';
import ImportItemsDialog from './ImportItemsDialog';

const ShoppingList = () => {
  const { items, loading, addItem, updateItem, deleteItem, refetch } = useShoppingItems();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleTouchStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleTouchEnd = () => {
    setDraggedItem(null);
  };

  const handleImportItems = async (importedItems: Array<{
    text: string;
    quantity: number;
    completed: boolean;
    category?: string;
  }>) => {
    // Check for duplicates and handle them gracefully
    const existingItemTexts = new Set(items.map(item => item.text.toLowerCase()));
    const duplicates: string[] = [];
    const newItems: typeof importedItems = [];

    for (const item of importedItems) {
      if (existingItemTexts.has(item.text.toLowerCase())) {
        duplicates.push(item.text);
      } else {
        newItems.push(item);
        existingItemTexts.add(item.text.toLowerCase());
      }
    }

    // Add all new items
    const addPromises = newItems.map(item => 
      addItem(item.text, item.quantity, item.category, undefined)
    );
    
    await Promise.all(addPromises);

    // Update completion status for items that were marked as completed in import
    const completedItems = newItems.filter(item => item.completed);
    if (completedItems.length > 0) {
      // We need to find the newly added items and mark them as completed
      // This is a bit tricky since we need to wait for the items to be added first
      setTimeout(async () => {
        const updatedItems = await refetch();
        const updatePromises = completedItems.map(importedItem => {
          const foundItem = items.find(item => 
            item.text.toLowerCase() === importedItem.text.toLowerCase() && 
            !item.completed
          );
          if (foundItem) {
            return updateItem(foundItem.id, { completed: true });
          }
        }).filter(Boolean);
        
        await Promise.all(updatePromises);
      }, 1000);
    }

    if (duplicates.length > 0) {
      console.log(`Skipped ${duplicates.length} duplicate items:`, duplicates);
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  // Group items by category
  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, typeof items>);

  // Sort categories with "Uncategorized" last
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center pt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping List</h1>
            <p className="text-gray-600">Loading your items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Shopping List</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Import className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600">
            {totalCount === 0 
              ? "Add your first item below" 
              : `${completedCount} of ${totalCount} items completed`
            }
          </p>
        </div>

        {/* Add Item Form */}
        <AddItemForm onAddItem={addItem} />

        {/* Shopping Items Grouped by Category */}
        <div className="space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">Your list is empty</h3>
              <p className="text-gray-400">Add some items to get started!</p>
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-700">{category}</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {groupedItems[category].length}
                  </span>
                </div>
                <div className="space-y-3">
                  {groupedItems[category].map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onUpdate={updateItem}
                      onDelete={deleteItem}
                      draggedItem={draggedItem}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Summary */}
        {items.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="text-sm text-gray-500">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
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
