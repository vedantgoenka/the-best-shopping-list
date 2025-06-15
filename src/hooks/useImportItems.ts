
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { parseImportText, ParsedItem } from '@/utils/importTextParser';
import { getMaxOrderIndex } from '@/utils/shoppingItemUtils';
import { ShoppingItem } from '@/types/shoppingItem';

interface UseImportItemsProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string, completed?: boolean, maintainOrder?: boolean, specificOrderIndex?: number) => Promise<boolean>;
  onUpdateItem: (id: string, updates: { completed?: boolean }) => Promise<boolean>;
  items: ShoppingItem[];
}

export const useImportItems = ({ onAddItem, onUpdateItem, items }: UseImportItemsProps) => {
  const [isImporting, setIsImporting] = useState(false);

  const importItems = async (importText: string) => {
    if (!importText.trim()) {
      toast({
        title: "No items to import",
        description: "Please paste some items to import.",
        variant: "destructive",
      });
      return false;
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
        return false;
      }

      let addedCount = 0;
      let completedCount = 0;

      // Get the starting order index and ensure items are added in sequence
      let currentOrderIndex = getMaxOrderIndex(items) + 1;

      console.log('Starting import with order index:', currentOrderIndex);
      console.log('Parsed items:', parsedItems);

      // Process items sequentially to maintain order
      for (let i = 0; i < parsedItems.length; i++) {
        const item = parsedItems[i];
        console.log(`Adding item ${i + 1}/${parsedItems.length}:`, item.text, 'at order:', currentOrderIndex);
        
        const success = await onAddItem(
          item.text, 
          item.quantity, 
          item.category, 
          undefined, // notes
          undefined, // shopName
          item.completed, // pass completion status directly
          true, // maintainOrder=true to preserve order
          currentOrderIndex // specific order index for this item
        );
        
        if (success) {
          addedCount++;
          if (item.completed) {
            completedCount++;
          }
          currentOrderIndex++; // increment for next item to maintain sequence
        } else {
          console.log('Failed to add item:', item.text);
        }
      }
      
      const completedMessage = completedCount > 0 ? ` ${completedCount} items marked as completed.` : '';
      
      toast({
        title: "Items imported successfully!",
        description: `${addedCount} items have been added to your shopping list.${completedMessage}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error importing items:', error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing items.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importItems,
  };
};
