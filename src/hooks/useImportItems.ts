
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { parseImportText, ParsedItem } from '@/utils/importTextParser';
import { getMaxOrderIndex } from '@/utils/shoppingItemUtils';
import { ShoppingItem } from '@/types/shoppingItem';

interface UseImportItemsProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string, completed?: boolean, maintainOrder?: boolean, specificOrderIndex?: number) => Promise<boolean>;
  items: ShoppingItem[];
}

interface ItemToImport extends ParsedItem {
  orderIndex: number;
}

export const useImportItems = ({ onAddItem, items }: UseImportItemsProps) => {
  const [isImporting, setIsImporting] = useState(false);

  const importItems = async (importText: string) => {
    if (isImporting) {
      toast({ title: "Import already in progress.", variant: "destructive" });
      return;
    }
    if (!importText.trim()) {
      toast({
        title: "No items to import",
        description: "Please paste some items to import.",
        variant: "destructive",
      });
      return;
    }

    const parsed = parseImportText(importText);
    if (parsed.length === 0) {
      toast({
        title: "No valid items found",
        description: "Could not parse any valid items from the text.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      // Pre-calculate order indices for all items
      const startOrderIndex = getMaxOrderIndex(items) + 1;
      const itemsToImport: ItemToImport[] = parsed.map((item, index) => ({
        ...item,
        orderIndex: startOrderIndex + index,
      }));

      console.log(`Starting import of ${itemsToImport.length} items with order indices from ${startOrderIndex}`);

      // Process all items in parallel
      const results = await Promise.allSettled(
        itemsToImport.map(item =>
          onAddItem(
            item.text,
            item.quantity,
            item.category,
            undefined, // notes
            undefined, // shopName
            item.completed,
            true, // maintainOrder
            item.orderIndex
          )
        )
      );

      // Count successful additions and completed items
      let addedCount = 0;
      let completedInBatch = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          addedCount++;
          if (itemsToImport[index].completed) {
            completedInBatch++;
          }
        } else if (result.status === 'rejected') {
          console.error(`Failed to import item ${index}:`, result.reason);
        }
      });

      const completedMessage = completedInBatch > 0 ? ` ${completedInBatch} items marked as completed.` : '';
      
      toast({
        title: "Import complete!",
        description: `${addedCount} of ${itemsToImport.length} items were added to your shopping list.${completedMessage}`,
      });

    } catch (error) {
      console.error("Error during import:", error);
      toast({
        title: "Import failed",
        description: "An error occurred while importing items.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importItems,
  };
};
