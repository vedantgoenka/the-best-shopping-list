
import React from 'react';
import { Import, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ImportDialogContentProps {
  importText: string;
  setImportText: (text: string) => void;
  onImport: () => void;
  onClose: () => void;
  isImporting: boolean;
}

const ImportDialogContent: React.FC<ImportDialogContentProps> = ({
  importText,
  setImportText,
  onImport,
  onClose,
  isImporting,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
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
                onClick={onImport}
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

export default ImportDialogContent;
