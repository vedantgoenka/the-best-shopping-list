
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ShoppingItem {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
}

export const useShoppingItems = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items from Supabase on component mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading items:', error);
        toast({
          title: "Error loading items",
          description: "Failed to load your shopping list from the database.",
          variant: "destructive",
        });
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Unexpected error loading items:', error);
      toast({
        title: "Error loading items",
        description: "An unexpected error occurred while loading your shopping list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (text: string, quantity: number) => {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert({
          text: text.trim(),
          quantity: quantity || 1,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding item:', error);
        toast({
          title: "Error adding item",
          description: "Failed to add the item to your shopping list.",
          variant: "destructive",
        });
        return false;
      }

      setItems(prev => [...prev, data]);
      const quantityText = data.quantity === 1 ? '' : `${data.quantity}x `;
      toast({
        title: "Item added!",
        description: `"${quantityText}${data.text}" was added to your shopping list.`,
      });
      return true;
    } catch (error) {
      console.error('Unexpected error adding item:', error);
      toast({
        title: "Error adding item",
        description: "An unexpected error occurred while adding the item.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateItem = async (id: string, updates: Partial<Pick<ShoppingItem, 'text' | 'quantity' | 'completed'>>) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating item:', error);
        toast({
          title: "Error updating item",
          description: "Failed to update the item in your shopping list.",
          variant: "destructive",
        });
        return false;
      }

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      if (updates.text || updates.quantity) {
        toast({
          title: "Item updated!",
          description: "Your item has been successfully updated.",
        });
      }
      return true;
    } catch (error) {
      console.error('Unexpected error updating item:', error);
      toast({
        title: "Error updating item",
        description: "An unexpected error occurred while updating the item.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const itemToDelete = items.find(item => item.id === id);
      
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting item:', error);
        toast({
          title: "Error deleting item",
          description: "Failed to delete the item from your shopping list.",
          variant: "destructive",
        });
        return false;
      }

      setItems(prev => prev.filter(item => item.id !== id));
      
      if (itemToDelete) {
        const quantityText = itemToDelete.quantity === 1 ? '' : `${itemToDelete.quantity}x `;
        toast({
          title: "Item removed",
          description: `"${quantityText}${itemToDelete.text}" was removed from your list.`,
        });
      }
      return true;
    } catch (error) {
      console.error('Unexpected error deleting item:', error);
      toast({
        title: "Error deleting item",
        description: "An unexpected error occurred while deleting the item.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    refetch: loadItems,
  };
};
