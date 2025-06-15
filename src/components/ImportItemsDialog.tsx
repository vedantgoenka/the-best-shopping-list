
import React, { useState } from 'react';
import { Import, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface ImportItemsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Array<{
    text: string;
    quantity: number;
    completed: boolean;
    category?: string;
  }>) => Promise<void>;
}

interface ParsedItem {
  text: string;
  quantity: number;
  completed: boolean;
  category?: string;
}

const ImportItemsDialog: React.FC<ImportItemsDialogProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const parseImportText = (text: string): ParsedItem[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const items: ParsedItem[] = [];
    let currentCategory: string | undefined;

    for (const line of lines) {
      // Check if line is a category heading (no checkbox, no quantity, ends with colon or is all caps)
      if (!line.includes('[') && !line.match(/^\d+x?\s/) && (line.endsWith(':') || line === line.toUpperCase())) {
        currentCategory = line.replace(':', '').trim();
        continue;
      }

      // Skip empty lines or lines that look like headers
      if (line.length === 0 || line.match(/^[-=]+$/)) {
        continue;
      }

      let parsedLine = line;
      let completed = false;

      // Check for completion status [x] or [X] means completed, [ ] means not completed
      if (line.includes('[x]') || line.includes('[X]')) {
        completed = true;
        parsedLine = parsedLine.replace(/\[x\]/gi, '').trim();
      } else if (line.includes('[ ]')) {
        completed = false;
        parsedLine = parsedLine.replace(/\[ \]/g, '').trim();
      }

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

      await onImport(parsedItems);
      
      toast({
        title: "Items imported successfully!",
        description: `${parsedItems.length} items have been added to your shopping list.`,
      });
      
      setImportText('');
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Import Shopping Items</h2>
            <button
              onClick={onClose}
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
[ ] cleaning supplies

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
                <li>• <code>[ ]</code> for uncompleted items, <code>[x]</code> for completed</li>
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
                onClick={onClose}
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
  );
};

export default ImportItemsDialog;
