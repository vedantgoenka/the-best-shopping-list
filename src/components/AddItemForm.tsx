
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AddItemFormProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string) => Promise<boolean>;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem }) => {
  const [inputValue, setInputValue] = useState('');
  const [quantityValue, setQuantityValue] = useState('1');
  const [categoryValue, setCategoryValue] = useState('');
  const [notesValue, setNotesValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddItem = async () => {
    if (inputValue.trim()) {
      const success = await onAddItem(
        inputValue.trim(), 
        parseInt(quantityValue) || 1,
        categoryValue.trim() || undefined,
        notesValue.trim() || undefined
      );
      if (success) {
        setInputValue('');
        setQuantityValue('1');
        setCategoryValue('');
        setNotesValue('');
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
          {showAdvanced ? 'Hide' : 'Show'} category & notes
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Category (e.g., Groceries, Electronics)"
            value={categoryValue}
            onChange={(e) => setCategoryValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
          />
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
