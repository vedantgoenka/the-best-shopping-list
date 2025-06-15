
import React, { useState } from 'react';
import { Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImportItems } from '@/hooks/useImportItems';
import ImportDialogContent from './ImportDialogContent';

interface ImportItemsDialogProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string, completed?: boolean) => Promise<boolean>;
  onUpdateItem: (id: string, updates: { completed?: boolean }) => Promise<boolean>;
  items: Array<{ id: string; text: string; quantity: number; category?: string | null }>;
}

const ImportItemsDialog: React.FC<ImportItemsDialogProps> = ({
  onAddItem,
  onUpdateItem,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState('');
  
  const { isImporting, importItems } = useImportItems({
    onAddItem,
    onUpdateItem,
    items,
  });

  const handleImport = async () => {
    const success = await importItems(importText);
    if (success) {
      setImportText('');
      setIsOpen(false);
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
