
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

      // Import each item individually
      for (const item of parsedItems) {
        const success = await onAddItem(item.text, item.quantity, item.category);
        
        if (success) {
          addedCount++;
          
          // If the item should be completed, we need to wait a bit and then find it
          if (item.completed) {
            // Wait a short moment for the state to update
            setTimeout(async () => {
              // Get fresh items list - find the most recently added item that matches
              const addedItem = items
                .filter(existingItem => 
                  existingItem.text.toLowerCase() === item.text.toLowerCase() &&
                  existingItem.quantity === item.quantity &&
                  existingItem.category === item.category
                )
                .sort((a, b) => b.id.localeCompare(a.id))[0]; // Get the most recent one
              
              if (addedItem) {
                await onUpdateItem(addedItem.id, { completed: true });
              }
            }, 100);
          }
        }
      }
      
      toast({
        title: "Items imported successfully!",
        description: `${addedCount} items have been added to your shopping list.${parsedItems.filter(item => item.completed).length > 0 ? ` Completed items will be marked automatically.` : ''}`,
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
