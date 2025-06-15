import React, { useState } from 'react';
import { Import, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface ImportItemsDialogProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string) => Promise<boolean>;
  onUpdateItem: (id: string, updates: { completed?: boolean }) => Promise<boolean>;
  items: Array<{ id: string; text: string; quantity: number; category?: string | null }>;
}

interface ParsedItem {
  text: string;
  quantity: number;
  completed: boolean;
  category?: string;
}

const ImportItemsDialog: React.FC<ImportItemsDialogProps> = ({
  onAddItem,
  onUpdateItem,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const parseImportText = (text: string): ParsedItem[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const items: ParsedItem[] = [];
    let currentCategory: string | undefined;

    for (const line of lines) {
      // Check for completion status first (before any modifications)
      let completed = false;
      if (line.match(/\[x\]/i) || line.includes('[✓]') || line.includes('[X]')) {
        completed = true;
      }

      // Remove leading bullets, dashes, asterisks
      let cleanLine = line.replace(/^[-*•·]\s*/, '').trim();
      
      // Remove checkbox markers after checking completion status
      cleanLine = cleanLine.replace(/\[x\]/gi, '').replace(/\[X\]/g, '').replace(/\[✓\]/g, '').replace(/\[ \]/g, '').trim();
      
      // Check if line is a category heading (no checkbox, no quantity, ends with colon or is all caps)
      if (!line.includes('[') && !cleanLine.match(/^\d+x?\s/) && (cleanLine.endsWith(':') || cleanLine === cleanLine.toUpperCase())) {
        currentCategory = cleanLine.replace(':', '').trim();
        continue;
      }

      // Skip empty lines or lines that look like headers
      if (cleanLine.length === 0 || cleanLine.match(/^[-=]+$/)) {
        continue;
      }

      let parsedLine = cleanLine;

      // Parse quantity (formats like "2x apples", "3 apples", "2x ", etc.)
      let quantity = 1;
      let itemText = parsedLine;

      const quantityMatch = parsedLine.match(/^(\d+)x?\s+(.+)$/i);
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1]);
        itemText = quantityMatch[2].trim();
      }

      // Skip if no item text after parsing
      if (!itemText || itemText.length === 0) {
        continue;
      }

      items.push({
        text: itemText,
        quantity,
        completed,
        category: currentCategory,
      });
    }

    return items;
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      toast({
        title: "No items to import",
        description: "Please paste some items to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const parsedItems = parseImportText(importText);
      
      if (parsedItems.length === 0) {
        toast({
          title: "No valid items found",
          description: "Could not parse any valid items from the text.",
          variant: "destructive",
        });
        return;
      }

      let completedCount = 0;
      let addedCount = 0;

      // Import each item individually
      for (const item of parsedItems) {
        const success = await onAddItem(item.text, item.quantity, item.category);
        
        if (success) {
          addedCount++;
          
          // If the item should be completed, find it in the items list and mark it as completed
          if (item.completed) {
            // Find the newly added item by matching text, quantity, and category
            const addedItem = items.find(existingItem => 
              existingItem.text.toLowerCase() === item.text.toLowerCase() &&
              existingItem.quantity === item.quantity &&
              existingItem.category === item.category
            );
            
            if (addedItem) {
              const updateSuccess = await onUpdateItem(addedItem.id, { completed: true });
              if (updateSuccess) {
                completedCount++;
              }
            }
          }
        }
      }
      
      const totalCount = parsedItems.length;
      const expectedCompletedCount = parsedItems.filter(item => item.completed).length;
      
      toast({
        title: "Items imported successfully!",
        description: `${addedCount} items have been added to your shopping list.${completedCount > 0 ? ` ${completedCount} items were automatically marked as completed.` : ''}`,
      });
      
      setImportText('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error importing items:', error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing items.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="whitespace-nowrap"
      >
        <Import className="h-4 w-4 mr-2" />
        Import
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Import Shopping Items</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your shopping list here
                  </label>
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`Paste your items here, for example:

GROCERIES:
[ ] 2x apples
[x] milk
[ ] bread

HOUSEHOLD:
[ ] 3x toilet paper
[X] cleaning supplies

Or just a simple list:
2x bananas
cheese
1x orange juice`}
                    rows={12}
                    className="w-full"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Supported formats:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <code>[ ]</code> for uncompleted items, <code>[x]</code> or <code>[X]</code> for completed</li>
                    <li>• <code>2x apples</code> or <code>3 bananas</code> for quantities</li>
                    <li>• <code>CATEGORY:</code> or <code>CATEGORY</code> (uppercase) for categories</li>
                    <li>• One item per line</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleImport}
                    disabled={isImporting || !importText.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                  >
                    <Import className="h-4 w-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import Items'}
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                    disabled={isImporting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportItemsDialog;
