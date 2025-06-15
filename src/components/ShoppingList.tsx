import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface ShoppingItem {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
}

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [quantityValue, setQuantityValue] = useState('1');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editQuantity, setEditQuantity] = useState('1');

  const addItem = () => {
    if (inputValue.trim()) {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        quantity: parseInt(quantityValue) || 1,
        completed: false,
      };
      setItems([...items, newItem]);
      setInputValue('');
      setQuantityValue('1');
      const quantityText = newItem.quantity === 1 ? '' : `${newItem.quantity}x `;
      toast({
        title: "Item added!",
        description: `"${quantityText}${newItem.text}" was added to your shopping list.`,
      });
    }
  };

  const startEdit = (item: ShoppingItem) => {
    setEditingItem(item.id);
    setEditText(item.text);
    setEditQuantity(item.quantity.toString());
  };

  const saveEdit = () => {
    if (editText.trim() && editingItem) {
      setItems(items.map(item => 
        item.id === editingItem 
          ? { ...item, text: editText.trim(), quantity: parseInt(editQuantity) || 1 }
          : item
      ));
      setEditingItem(null);
      setEditText('');
      setEditQuantity('1');
      toast({
        title: "Item updated!",
        description: "Your item has been successfully updated.",
      });
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditText('');
    setEditQuantity('1');
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: string) => {
    const itemToDelete = items.find(item => item.id === id);
    setItems(items.filter(item => item.id !== id));
    if (itemToDelete) {
      const quantityText = itemToDelete.quantity === 1 ? '' : `${itemToDelete.quantity}x `;
      toast({
        title: "Item removed",
        description: `"${quantityText}${itemToDelete.text}" was removed from your list.`,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleTouchStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleTouchEnd = () => {
    setDraggedItem(null);
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping List</h1>
          <p className="text-gray-600">
            {totalCount === 0 
              ? "Add your first item below" 
              : `${completedCount} of ${totalCount} items completed`
            }
          </p>
        </div>

        {/* Add Item Section */}
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
              onClick={addItem}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">Click on any item to edit it</p>
        </div>

        {/* Shopping Items */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">Your list is empty</h3>
              <p className="text-gray-400">Add some items to get started!</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-300 transform hover:shadow-md ${
                  draggedItem === item.id ? 'scale-95 opacity-75' : 'scale-100 opacity-100'
                } ${item.completed ? 'bg-gray-50' : ''}`}
                onTouchStart={() => handleTouchStart(item.id)}
                onTouchEnd={handleTouchEnd}
              >
                {editingItem === item.id ? (
                  <div className="flex items-center gap-3">
                    <div className="w-16">
                      <Input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        min="1"
                        className="text-sm"
                      />
                    </div>
                    <Input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={handleEditKeyPress}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveEdit}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <div 
                      className={`flex-1 cursor-pointer transition-all duration-200 ${
                        item.completed 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-800'
                      }`}
                      onClick={() => startEdit(item)}
                    >
                      {item.quantity > 1 && (
                        <span className="font-medium text-blue-600">{item.quantity}x </span>
                      )}
                      {item.text}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(item)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 opacity-60 hover:opacity-100"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
