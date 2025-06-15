
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
      const result = await processImportedItems(parsed, items, onAddItem);
      showImportResults(result, parsed.length);
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

const processImportedItems = async (
  parsed: ParsedItem[],
  items: ShoppingItem[],
  onAddItem: UseImportItemsProps['onAddItem']
) => {
  // Split into new and duplicate items
  const existingTexts = new Set(items.map(item => item.text.trim().toLowerCase()));
  const { uniqueToImport, duplicates } = splitItemsByExistence(parsed, existingTexts);

  // Assign order indices for correct display order
  const itemsToImport = assignOrderIndices(uniqueToImport, items);

  // Process new items
  const newItemsResult = await processNewItems(itemsToImport, onAddItem);
  
  // Process duplicates
  const duplicatesResult = await processDuplicateItems(duplicates, items, onAddItem);

  return {
    ...newItemsResult,
    ...duplicatesResult,
  };
};

const splitItemsByExistence = (parsed: ParsedItem[], existingTexts: Set<string>) => {
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

  return { uniqueToImport, duplicates };
};

const assignOrderIndices = (uniqueToImport: ParsedItem[], items: ShoppingItem[]): ItemToImport[] => {
  let baseOrderIndex = getMaxOrderIndex(items) + 1;
  
  return uniqueToImport.map((item, idx) => ({
    ...item,
    orderIndex: baseOrderIndex + (uniqueToImport.length - 1 - idx),
  }));
};

const processNewItems = async (
  itemsToImport: ItemToImport[],
  onAddItem: UseImportItemsProps['onAddItem']
) => {
  let addedCount = 0;
  let completedInBatch = 0;
  
  for (const item of itemsToImport) {
    const success = await onAddItem(
      item.text,
      item.quantity,
      item.category,
      undefined,
      undefined,
      item.completed,
      true,
      item.orderIndex
    );
    
    if (success) {
      addedCount++;
      if (item.completed) completedInBatch++;
    }
  }

  return { addedCount, completedInBatch };
};

const processDuplicateItems = async (
  duplicates: ParsedItem[],
  items: ShoppingItem[],
  onAddItem: UseImportItemsProps['onAddItem']
) => {
  let updatedDuplicates = 0;
  let completedUpdated = 0;
  
  for (const item of duplicates) {
    if (item.completed) {
      const match = items.find(
        i => i.text.trim().toLowerCase() === item.text.trim().toLowerCase()
      );
      
      if (match && !match.completed) {
        const updated = await onAddItem(
          item.text,
          match.quantity,
          item.category || match.category || undefined,
          match.notes || undefined,
          match.shop_name || undefined,
          true,
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

  return { updatedDuplicates, completedUpdated };
};

const showImportResults = (
  result: { addedCount: number; completedInBatch: number; updatedDuplicates: number; completedUpdated: number },
  totalParsed: number
) => {
  const { addedCount, completedInBatch, updatedDuplicates, completedUpdated } = result;
  
  let desc = `${addedCount} of ${totalParsed} items were added to your shopping list.`;
  if (completedInBatch > 0) desc += ` ${completedInBatch} item${completedInBatch === 1 ? '' : 's'} marked as completed.`;
  if (updatedDuplicates > 0) desc += ` ${updatedDuplicates} duplicate${updatedDuplicates === 1 ? '' : 's'} updated as completed.`;

  toast({
    title: "Import complete!",
    description: desc,
  });
};
