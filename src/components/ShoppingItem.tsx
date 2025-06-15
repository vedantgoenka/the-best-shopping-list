
import React, { useState, useRef } from 'react';
import { Trash2, Edit3, Check, X, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ShoppingItemData {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
  category?: string | null;
  notes?: string | null;
  shop_name?: string | null;
}

interface ShoppingItemProps {
  item: ShoppingItemData;
  onUpdate: (id: string, updates: Partial<Pick<ShoppingItemData, 'text' | 'quantity' | 'completed' | 'category' | 'notes' | 'shop_name'>>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  draggedItem?: string | null;
  onTouchStart?: (id: string) => void;
  onTouchEnd?: () => void;
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

const ShoppingItem: React.FC<ShoppingItemProps> = ({
  item,
  onUpdate,
  onDelete,
  draggedItem = null,
  onTouchStart = () => {},
  onTouchEnd = () => {},
  items
}) => {
  const [editingItem, setEditingItem] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [editShopName, setEditShopName] = useState(item.shop_name || '');
  const [editCategory, setEditCategory] = useState(item.category || '');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  
  // Swipe-to-delete state
  const [swipeX, setSwipeX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swipeThreshold = 100; // Minimum swipe distance to trigger delete

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

  const startEdit = () => {
    setEditingItem(true);
    setEditText(item.text);
    setEditQuantity(item.quantity.toString());
    setEditNotes(item.notes || '');
    setEditShopName(item.shop_name || '');
    setEditCategory(item.category || '');
  };

  const saveEdit = async () => {
    if (editText.trim()) {
      const success = await onUpdate(item.id, {
        text: editText.trim(),
        quantity: parseInt(editQuantity) || 1,
        notes: editNotes.trim() || null,
        shop_name: editShopName.trim() || null,
        category: editCategory.trim() || null
      });
      
      if (success) {
        setEditingItem(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingItem(false);
    setEditText(item.text);
    setEditQuantity(item.quantity.toString());
    setEditNotes(item.notes || '');
    setEditShopName(item.shop_name || '');
    setEditCategory(item.category || '');
  };

  const toggleItem = async () => {
    await onUpdate(item.id, { completed: !item.completed });
  };

  const handleDeleteItem = async () => {
    setIsDeleting(true);
    await onDelete(item.id);
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (editingItem) return; // Don't allow swipe when editing
    
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    onTouchStart(item.id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (editingItem) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = touchY - touchStartY.current;
    
    // Only respond to horizontal swipes (prevent interference with vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      
      // Only allow left swipes (negative deltaX)
      if (deltaX < 0) {
        setSwipeX(Math.max(deltaX, -150)); // Limit maximum swipe distance
      }
    }
  };

  const handleTouchEnd = () => {
    if (editingItem) return;
    
    // If swiped far enough left, delete the item
    if (swipeX <= -swipeThreshold) {
      handleDeleteItem();
    } else {
      // Reset position with animation
      setSwipeX(0);
    }
    
    onTouchEnd();
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 transform hover:shadow-md overflow-hidden ${
        draggedItem === item.id ? 'scale-95 opacity-75' : 'scale-100 opacity-100'
      } ${item.completed ? 'bg-gray-50' : ''} ${isDeleting ? 'animate-fade-out' : ''}`}
      style={{
        transform: `translateX(${swipeX}px)`,
        transition: swipeX === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Delete indicator background */}
      {swipeX < 0 && (
        <div
          className="absolute inset-y-0 right-0 bg-red-500 flex items-center justify-end pr-4 z-0"
          style={{ width: Math.abs(swipeX) }}
        >
          <Trash2 className="h-5 w-5 text-white" />
        </div>
      )}
      
      <div className="relative z-10 bg-white p-4 sm:p-4">
        {editingItem ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 sm:w-16">
                <Input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  onKeyPress={handleEditKeyPress}
                  min="1"
                  className="text-sm h-10"
                />
              </div>
              <Input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={handleEditKeyPress}
                className="flex-1 text-sm h-10"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={saveEdit}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 h-10 w-10 p-0"
              >
                <Check className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-10 w-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Category Combobox */}
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className="w-full justify-between text-sm h-10 border-gray-200"
                >
                  {editCategory || "Select or add category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or add category..." 
                    value={editCategory}
                    onValueChange={setEditCategory}
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
                          Add "{editCategory}"
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {existingCategories.map((category) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={(currentValue) => {
                            setEditCategory(currentValue === editCategory ? "" : currentValue);
                            setCategoryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              editCategory === category ? "opacity-100" : "opacity-0"
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
                  className="w-full justify-between text-sm h-10 border-gray-200"
                >
                  {editShopName || "Select or add shop..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or add shop..." 
                    value={editShopName}
                    onValueChange={setEditShopName}
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
                          Add "{editShopName}"
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {existingShops.map((shop) => (
                        <CommandItem
                          key={shop}
                          value={shop}
                          onSelect={(currentValue) => {
                            setEditShopName(currentValue === editShopName ? "" : currentValue);
                            setShopOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              editShopName === shop ? "opacity-100" : "opacity-0"
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
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="text-sm resize-none h-20"
              rows={2}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={item.completed}
                onCheckedChange={toggleItem}
                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 h-6 w-6 shrink-0"
              />
              <div 
                className={`flex-1 cursor-pointer transition-all duration-200 text-base min-h-[44px] flex items-center ${
                  item.completed 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-800'
                }`}
                onClick={startEdit}
              >
                {item.text}
                {item.quantity > 1 && (
                  <span className="font-medium text-blue-600"> x{item.quantity}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={startEdit}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-10 w-10 p-0 shrink-0"
              >
                <Edit3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteItem}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0 shrink-0 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
            {item.shop_name && (
              <div className="ml-9">
                <div className="text-sm text-blue-600 font-medium">
                  🏪 {item.shop_name}
                </div>
              </div>
            )}
            {item.notes && (
              <div className="ml-9">
                <div className="text-sm text-gray-600 italic">
                  {item.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingItem;
