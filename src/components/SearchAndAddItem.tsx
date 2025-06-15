
import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [category, setCategory] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('1');

  // Check if the exact item already exists (case-insensitive)
  const exactItemExists = useMemo(() => {
    if (!searchTerm.trim()) return false;
    return items.some(item => 
      item.text.toLowerCase() === searchTerm.trim().toLowerCase()
    );
  }, [items, searchTerm]);

  // Get unique categories and shops from existing items
  const existingCategories = useMemo(() => {
    const categories = items
      .map(item => item.category)
      .filter((cat): cat is string => cat !== null && cat !== undefined && cat.trim() !== '')
      .filter((cat, index, arr) => arr.indexOf(cat) === index)
      .sort();
    return categories;
  }, [items]);

  const existingShops = useMemo(() => {
    const shops = items
      .map(item => item.shop_name)
      .filter((shop): shop is string => shop !== null && shop !== undefined && shop.trim() !== '')
      .filter((shop, index, arr) => arr.indexOf(shop) === index)
      .sort();
    return shops;
  }, [items]);

  const handleAddItem = async () => {
    if (!searchTerm.trim()) return;
    
    const quantity = parseInt(quantityInput) || 1;
    
    setIsAdding(true);
    const success = await onAddItem(
      searchTerm.trim(), 
      quantity, 
      category || undefined, 
      undefined, 
      shopName || undefined
    );
    
    if (success) {
      onSearchChange(''); // Clear the search input
      setCategory(''); // Clear category
      setShopName(''); // Clear shop
      setQuantityInput('1'); // Reset quantity
    }
    setIsAdding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim() && !exactItemExists) {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for editing, but ensure minimum of 1 when not empty
    if (value === '' || (parseInt(value) > 0)) {
      setQuantityInput(value);
    }
  };

  const showAddButton = searchTerm.trim() && !exactItemExists;
  const showExtraFields = showAddButton;

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
        
        {showExtraFields && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Shop (optional)</label>
              <Select value={shopName} onValueChange={setShopName}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select shop" />
                </SelectTrigger>
                <SelectContent>
                  {existingShops.map((shop) => (
                    <SelectItem key={shop} value={shop}>
                      {shop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <Input
                type="number"
                min="1"
                value={quantityInput}
                onChange={handleQuantityChange}
                className="w-full"
                placeholder="1"
              />
            </div>
          </div>
        )}
        
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
