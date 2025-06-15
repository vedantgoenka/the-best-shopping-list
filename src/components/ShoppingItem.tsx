
import React, { useState } from 'react';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface ShoppingItemData {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
  category?: string | null;
  notes?: string | null;
}

interface ShoppingItemProps {
  item: ShoppingItemData;
  onUpdate: (id: string, updates: Partial<Pick<ShoppingItemData, 'text' | 'quantity' | 'completed' | 'category' | 'notes'>>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  draggedItem: string | null;
  onTouchStart: (id: string) => void;
  onTouchEnd: () => void;
}

const ShoppingItem: React.FC<ShoppingItemProps> = ({
  item,
  onUpdate,
  onDelete,
  draggedItem,
  onTouchStart,
  onTouchEnd
}) => {
  const [editingItem, setEditingItem] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());
  const [editCategory, setEditCategory] = useState(item.category || '');
  const [editNotes, setEditNotes] = useState(item.notes || '');

  const startEdit = () => {
    setEditingItem(true);
    setEditText(item.text);
    setEditQuantity(item.quantity.toString());
    setEditCategory(item.category || '');
    setEditNotes(item.notes || '');
  };

  const saveEdit = async () => {
    if (editText.trim()) {
      const success = await onUpdate(item.id, {
        text: editText.trim(),
        quantity: parseInt(editQuantity) || 1,
        category: editCategory.trim() || null,
        notes: editNotes.trim() || null
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
    setEditCategory(item.category || '');
    setEditNotes(item.notes || '');
  };

  const toggleItem = async () => {
    await onUpdate(item.id, { completed: !item.completed });
  };

  const handleDeleteItem = async () => {
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

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-300 transform hover:shadow-md ${
        draggedItem === item.id ? 'scale-95 opacity-75' : 'scale-100 opacity-100'
      } ${item.completed ? 'bg-gray-50' : ''}`}
      onTouchStart={() => onTouchStart(item.id)}
      onTouchEnd={onTouchEnd}
    >
      {editingItem ? (
        <div className="space-y-3">
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
          <Input
            type="text"
            placeholder="Category (optional)"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            onKeyPress={handleEditKeyPress}
            className="text-sm"
          />
          <Textarea
            placeholder="Notes (optional)"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            className="text-sm resize-none"
            rows={2}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={item.completed}
              onCheckedChange={toggleItem}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <div 
              className={`flex-1 cursor-pointer transition-all duration-200 ${
                item.completed 
                  ? 'text-gray-500 line-through' 
                  : 'text-gray-800'
              }`}
              onClick={startEdit}
            >
              {item.quantity > 1 && (
                <span className="font-medium text-blue-600">{item.quantity}x </span>
              )}
              {item.text}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={startEdit}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 opacity-60 hover:opacity-100"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteItem}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {(item.category || item.notes) && (
            <div className="ml-8 space-y-1">
              {item.category && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                  {item.category}
                </div>
              )}
              {item.notes && (
                <div className="text-sm text-gray-600 italic">
                  {item.notes}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingItem;
