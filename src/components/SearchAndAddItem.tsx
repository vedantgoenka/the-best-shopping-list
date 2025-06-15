
import React, { useState, useMemo } from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ImportItemsDialog from './ImportItemsDialog';
import { ShoppingItem } from '@/types/shoppingItem';

interface SearchAndAddItemProps {
  items: ShoppingItem[];
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string) => Promise<boolean>;
  onUpdateItem: (id: string, updates: { completed?: boolean }) => Promise<boolean>;
  onSearchChange: (searchTerm: string) => void;
  searchTerm: string;
}

const SearchAndAddItem: React.FC<SearchAndAddItemProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onSearchChange,
  searchTerm
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [quantityFocused, setQuantityFocused] = useState(false);

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
      setQuantityFocused(false); // Reset focus state
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

  const handleQuantityFocus = () => {
    setQuantityFocused(true);
    if (quantityInput === '1') {
      setQuantityInput('');
    }
  };

  const handleQuantityBlur = () => {
    setQuantityFocused(false);
    if (quantityInput === '') {
      setQuantityInput('1');
    }
  };

  const showAddButton = searchTerm.trim() && !exactItemExists;
  const showExtraFields = showAddButton;

  return (
    <div className="w-full">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for an item or add a new one..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 pr-4 text-lg h-12 border-0 focus:border-0 focus:ring-0 bg-white rounded-lg shadow-none"
              />
            </div>
            
            <ImportItemsDialog 
              onAddItem={onAddItem} 
              onUpdateItem={onUpdateItem}
              items={items}
            />
            
            {showAddButton && (
              <Button
                onClick={handleAddItem}
                disabled={isAdding}
                className="h-12 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold whitespace-nowrap rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                {isAdding ? 'Adding...' : 'Add Item'}
              </Button>
            )}
          </div>
          
          {showExtraFields && (
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Customize your item</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Type or select category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      list="categories"
                      className="w-full bg-white/80 border-gray-200 rounded-lg"
                    />
                    <datalist id="categories">
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Shop</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Type or select shop"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      list="shops"
                      className="w-full bg-white/80 border-gray-200 rounded-lg"
                    />
                    <datalist id="shops">
                      {existingShops.map((shop) => (
                        <option key={shop} value={shop} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantityInput}
                    onChange={handleQuantityChange}
                    onFocus={handleQuantityFocus}
                    onBlur={handleQuantityBlur}
                    className="w-full bg-white/80 border-gray-200 rounded-lg"
                    placeholder={quantityFocused ? "" : "1"}
                  />
                </div>
              </div>
            </div>
          )}
          
          {searchTerm.trim() && exactItemExists && (
            <div className="mt-4 text-sm text-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="font-medium">"{searchTerm.trim()}"</span> is already in your list
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndAddItem;
