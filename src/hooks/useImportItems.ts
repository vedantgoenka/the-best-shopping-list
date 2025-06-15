
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { parseImportText, ParsedItem } from '@/utils/importTextParser';
import { getMaxOrderIndex } from '@/utils/shoppingItemUtils';
import { ShoppingItem } from '@/types/shoppingItem';

interface UseImportItemsProps {
  onAddItem: (
    text: string,
    quantity: number,
    category?: string,
    notes?: string,
    shopName?: string,
    completed?: boolean,
    maintainOrder?: boolean,
    specificOrderIndex?: number
  ) => Promise<boolean>;
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
      // Step 1: Lowercase set of existing item texts (for duplicate detection)
      const existingTexts = new Set(items.map(item => item.text.trim().toLowerCase()));

      // Step 2: Split parsed items into new and duplicate
      const uniqueToImport: ParsedItem[] = [];
      const duplicates: ParsedItem[] = [];
      parsed.forEach(item => {
        const normalized = item.text.trim().toLowerCase();
        if (existingTexts.has(normalized)) {
          duplicates.push(item);
        } else {
          uniqueToImport.push(item);
        }
      });

      // Step 3: Calculate order indices to preserve import order
      // Start from max + 1 and assign incrementally to preserve import text order
      let startOrderIndex = getMaxOrderIndex(items) + 1;
      const itemsToImport: ItemToImport[] = uniqueToImport.map((item, idx) => ({
        ...item,
        orderIndex: startOrderIndex + idx,
      }));

      // Step 4: Sequentially add new items WITH their assigned order indices
      let addedCount = 0;
      let completedInBatch = 0;
      for (const item of itemsToImport) {
        const success = await onAddItem(
          item.text,
          item.quantity,
          item.category,
          undefined, // notes
          undefined, // shopName
          item.completed,
          true, // maintainOrder
          item.orderIndex
        );
        if (success) {
          addedCount++;
          if (item.completed) completedInBatch++;
        }
      }

      // Step 5: For duplicates, update to completed if needed
      let updatedDuplicates = 0;
      let completedUpdated = 0;
      for (const item of duplicates) {
        if (item.completed) {
          // Find the matching item's id
          const match = items.find(
            i => i.text.trim().toLowerCase() === item.text.trim().toLowerCase()
          );
          if (match && !match.completed) {
            // Only update if not already completed
            // Assume user's onAddItem handles this as an update
            const updated = await onAddItem(
              item.text,
              match.quantity,
              item.category || match.category || undefined,
              match.notes || undefined,
              match.shop_name || undefined,
              true, // completed
              true,
              match.order_index
            );
            if (updated) {
              updatedDuplicates++;
              completedUpdated++;
            }
          }
        }
      }
      // Feedback message
      let desc = `${addedCount} of ${parsed.length} items were added to your shopping list.`;
      if (completedInBatch > 0) desc += ` ${completedInBatch} item${completedInBatch === 1 ? '' : 's'} marked as completed.`;
      if (updatedDuplicates > 0) desc += ` ${updatedDuplicates} duplicate${updatedDuplicates === 1 ? '' : 's'} updated as completed.`;

      toast({
        title: "Import complete!",
        description: desc,
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
