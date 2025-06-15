
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

      // Get the starting order index once and increment for each item
      let currentOrderIndex = getMaxOrderIndex(items) + 1;

      // Process items in order with manually managed order indices
      for (const item of parsedItems) {
        const success = await onAddItem(
          item.text, 
          item.quantity, 
          item.category, 
          undefined, // notes
          undefined, // shopName
          item.completed, // pass completion status directly
          true, // maintainOrder=true to add items at the end in order
          currentOrderIndex // pass the specific order index
        );
        
        if (success) {
          addedCount++;
          if (item.completed) {
            completedCount++;
          }
          currentOrderIndex++; // increment for next item
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
