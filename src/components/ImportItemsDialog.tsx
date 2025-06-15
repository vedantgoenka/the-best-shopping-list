
import React, { useState } from 'react';
import { Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImportItems } from '@/hooks/useImportItems';
import ImportDialogContent from './ImportDialogContent';
import { ShoppingItem } from '@/types/shoppingItem';

interface ImportItemsDialogProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string, completed?: boolean, maintainOrder?: boolean, specificOrderIndex?: number) => Promise<boolean>;
  items: ShoppingItem[];
}

const ImportItemsDialog: React.FC<ImportItemsDialogProps> = ({
  onAddItem,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState('');
  
  const { isImporting, importItems } = useImportItems({
    onAddItem,
    items,
  });

  const handleImport = () => {
    importItems(importText);
    // The dialog now closes immediately, and the import runs in the background.
    setImportText('');
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-12 w-12"
        title="Import items"
      >
        <Import className="h-5 w-5" />
      </Button>

      {isOpen && (
        <ImportDialogContent
          importText={importText}
          setImportText={setImportText}
          onImport={handleImport}
          onClose={() => setIsOpen(false)}
          isImporting={isImporting}
        />
      )}
    </>
  );
};

export default ImportItemsDialog;
