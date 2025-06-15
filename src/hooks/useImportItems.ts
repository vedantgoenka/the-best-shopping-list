
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { parseImportText, ParsedItem } from '@/utils/importTextParser';
import { getMaxOrderIndex } from '@/utils/shoppingItemUtils';
import { ShoppingItem } from '@/types/shoppingItem';

interface UseImportItemsProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string, completed?: boolean, maintainOrder?: boolean, specificOrderIndex?: number) => Promise<boolean>;
  items: ShoppingItem[];
}

export const useImportItems = ({ onAddItem, items }: UseImportItemsProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importQueue, setImportQueue] = useState<ParsedItem[]>([]);
  const [startOrderIndex, setStartOrderIndex] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [addedCount, setAddedCount] = useState(0);
  const [completedInBatch, setCompletedInBatch] = useState(0);

  useEffect(() => {
    // This effect runs when the import is finished.
    if (isImporting && processedCount > 0 && processedCount === totalToProcess) {
      const completedMessage = completedInBatch > 0 ? ` ${completedInBatch} items marked as completed.` : '';
      
      toast({
        title: "Import complete!",
        description: `${addedCount} of ${totalToProcess} items were added to your shopping list.${completedMessage}`,
      });

      setIsImporting(false);
    }
  }, [isImporting, processedCount, totalToProcess, addedCount, completedInBatch]);

  useEffect(() => {
    // This effect processes one item from the queue at a time.
    if (!isImporting || importQueue.length === 0) {
      return;
    }

    const itemToProcess = importQueue[0];
    const specificOrderIndex = startOrderIndex + processedCount;

    const processItem = async () => {
      try {
        const success = await onAddItem(
          itemToProcess.text,
          itemToProcess.quantity,
          itemToProcess.category,
          undefined, // notes
          undefined, // shopName
          itemToProcess.completed,
          true, // maintainOrder
          specificOrderIndex
        );

        if (success) {
          setAddedCount(prev => prev + 1);
          if (itemToProcess.completed) {
            setCompletedInBatch(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error("Error processing item from import queue:", error);
      } finally {
        // Move to the next item regardless of success/failure.
        setProcessedCount(prev => prev + 1);
        setImportQueue(prev => prev.slice(1));
      }
    };

    processItem();
  }, [isImporting, importQueue, onAddItem, startOrderIndex, processedCount]);

  const importItems = (importText: string) => {
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
    
    // Reset state and kick off the import.
    setProcessedCount(0);
    setAddedCount(0);
    setCompletedInBatch(0);
    setTotalToProcess(parsed.length);
    setStartOrderIndex(getMaxOrderIndex(items) + 1);
    setImportQueue(parsed);
    setIsImporting(true);
  };

  return {
    isImporting,
    importItems,
  };
};
