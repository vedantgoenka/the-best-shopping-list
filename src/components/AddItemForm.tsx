
import React, { useState } from 'react';
import { Plus, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AddItemFormProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string) => Promise<boolean>;
  items: Array<{
    id: string;
    text: string;
    quantity: number;
    completed: boolean;
    category?: string | null;
    notes?: string | null;
    shop_name?: string | null;
  }>;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, items }) => {
  const [inputValue, setInputValue] = useState('');
  const [quantityValue, setQuantityValue] = useState('1');
  const [categoryValue, setCategoryValue] = useState('');
  const [notesValue, setNotesValue] = useState('');
  const [shopNameValue, setShopNameValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  // Get unique categories and shops from existing items
  const existingCategories = Array.from(new Set(
    items
      .map(item => item.category)
      .filter(category => category && category.trim() !== '')
  )).sort();

  const existingShops = Array.from(new Set(
    items
      .map(item => item.shop_name)
      .filter(shop => shop && shop.trim() !== '')
  )).sort();

  const handleAddItem = async () => {
    if (inputValue.trim()) {
      const success = await onAddItem(
        inputValue.trim(), 
        parseInt(quantityValue) || 1,
        categoryValue.trim() || undefined,
        notesValue.trim() || undefined,
        shopNameValue.trim() || undefined
      );
      if (success) {
        setInputValue('');
        setQuantityValue('1');
        setCategoryValue('');
        setNotesValue('');
        setShopNameValue('');
        setShowAdvanced(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex gap-3 mb-3">
        <div className="w-20">
          <Input
            type="number"
            placeholder="Qty"
            value={quantityValue}
            onChange={(e) => setQuantityValue(e.target.value)}
            min="1"
            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        <Input
          type="text"
          placeholder="Add a new item..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
        />
        <Button 
          onClick={handleAddItem}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} category, shop & notes
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-3">
          {/* Category Combobox */}
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={categoryOpen}
                className="w-full justify-between border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              >
                {categoryValue || "Select or add category..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search or add category..." 
                  value={categoryValue}
                  onValueChange={setCategoryValue}
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setCategoryOpen(false);
                        }}
                      >
                        Add "{categoryValue}"
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {existingCategories.map((category) => (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={(currentValue) => {
                          setCategoryValue(currentValue === categoryValue ? "" : currentValue);
                          setCategoryOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            categoryValue === category ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Shop Combobox */}
          <Popover open={shopOpen} onOpenChange={setShopOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={shopOpen}
                className="w-full justify-between border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              >
                {shopNameValue || "Select or add shop..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search or add shop..." 
                  value={shopNameValue}
                  onValueChange={setShopNameValue}
                />
                <CommandList>
                  <CommandEmpty>
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setShopOpen(false);
                        }}
                      >
                        Add "{shopNameValue}"
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {existingShops.map((shop) => (
                      <CommandItem
                        key={shop}
                        value={shop}
                        onSelect={(currentValue) => {
                          setShopNameValue(currentValue === shopNameValue ? "" : currentValue);
                          setShopOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            shopNameValue === shop ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {shop}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Textarea
            placeholder="Notes (optional)"
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
            rows={2}
          />
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-3">Click on any item to edit it</p>
    </div>
  );
};

export default AddItemForm;
