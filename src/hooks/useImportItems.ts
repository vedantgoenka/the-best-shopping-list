
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

  const findMatchingItem = (parsedItem: ParsedItem) => {
    return items.find(item => 
      item.text.toLowerCase() === parsedItem.text.toLowerCase() &&
      item.quantity === parsedItem.quantity &&
      item.category === parsedItem.category
    );
  };

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

      // Process items sequentially to maintain proper state
      for (const item of parsedItems) {
        const success = await onAddItem(item.text, item.quantity, item.category);
        
        if (success) {
          addedCount++;
          
          // If item should be completed, find and update it immediately
          if (item.completed) {
            // Get the updated items list to find the newly added item
            const currentItems = [...items];
            
            // Find the matching item (it should be the most recently added one)
            const matchingItem = currentItems
              .filter(existingItem => 
                existingItem.text.toLowerCase() === item.text.toLowerCase() &&
                existingItem.quantity === item.quantity &&
                existingItem.category === item.category
              )
              .sort((a, b) => b.id.localeCompare(a.id))[0]; // Get the most recent one
            
            if (matchingItem) {
              const updateSuccess = await onUpdateItem(matchingItem.id, { completed: true });
              if (updateSuccess) {
                completedCount++;
              }
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
