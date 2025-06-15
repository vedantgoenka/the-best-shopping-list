
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { parseImportText, ParsedItem } from '@/utils/importTextParser';

interface UseImportItemsProps {
  onAddItem: (text: string, quantity: number, category?: string, notes?: string, shopName?: string) => Promise<boolean>;
  onUpdateItem: (id: string, updates: { completed?: boolean }) => Promise<boolean>;
  items: Array<{ id: string; text: string; quantity: number; category?: string | null }>;
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
      const itemsToComplete: string[] = [];

      // First pass: Add all items and collect IDs of items that need to be completed
      for (const item of parsedItems) {
        const success = await onAddItem(item.text, item.quantity, item.category);
        
        if (success) {
          addedCount++;
          
          // If item should be completed, we'll mark it after all items are added
          if (item.completed) {
            itemsToComplete.push(`${item.text}|${item.quantity}|${item.category || ''}`);
          }
        }
      }

      // Second pass: Mark items as completed after all items have been added
      if (itemsToComplete.length > 0) {
        // Refetch the current items to get the newly added ones
        // We need to find items that match our criteria and aren't already completed
        for (const itemKey of itemsToComplete) {
          const [text, quantity, category] = itemKey.split('|');
          
          // Find the most recently added item that matches
          const matchingItems = items.filter(existingItem => 
            existingItem.text.toLowerCase() === text.toLowerCase() &&
            existingItem.quantity === parseInt(quantity) &&
            (existingItem.category || '') === category
          );
          
          // Get the most recent one (assuming newer items have larger IDs)
          const itemToComplete = matchingItems.sort((a, b) => b.id.localeCompare(a.id))[0];
          
          if (itemToComplete) {
            const updateSuccess = await onUpdateItem(itemToComplete.id, { completed: true });
            if (updateSuccess) {
              completedCount++;
            }
          }
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
