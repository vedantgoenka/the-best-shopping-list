
import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchAndAddItemProps {
  items: Array<{
    id: string;
    text: string;
    quantity: number;
    completed: boolean;
    category?: string | null;
    notes?: string | null;
    shop_name?: string | null;
  }>;
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string) => Promise<boolean>;
  onSearchChange: (searchTerm: string) => void;
  searchTerm: string;
}

const SearchAndAddItem: React.FC<SearchAndAddItemProps> = ({
  items,
  onAddItem,
  onSearchChange,
  searchTerm
}) => {
  const [isAdding, setIsAdding] = useState(false);

  // Check if the exact item already exists (case-insensitive)
  const exactItemExists = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return items.some(item => 
      item.text.toLowerCase() === searchTerm.trim().toLowerCase()
    );
  }, [items, searchTerm]);

  const handleAddItem = async () => {
    if (!searchTerm.trim()) return;
    
    setIsAdding(true);
    const success = await onAddItem(searchTerm.trim(), 1);
    
    if (success) {
      onSearchChange(''); // Clear the search input
    }
    setIsAdding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim() && !exactItemExists) {
      e.preventDefault();
      handleAddItem();
    }
  };

  const showAddButton = searchTerm.trim() && !exactItemExists;

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 border border-gray-100">
      <div className="p-6">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for an item or add a new one..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 pr-4 text-base h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          
          {showAddButton && (
            <Button
              onClick={handleAddItem}
              disabled={isAdding}
              className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white font-medium whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? 'Adding...' : `Add "${searchTerm.trim()}"`}
            </Button>
          )}
        </div>
        
        {searchTerm.trim() && exactItemExists && (
          <div className="mt-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="font-medium">"{searchTerm.trim()}"</span> is already in your list
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndAddItem;
