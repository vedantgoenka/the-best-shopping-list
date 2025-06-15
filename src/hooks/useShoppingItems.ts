
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ShoppingItem {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
  category?: string | null;
  notes?: string | null;
  shop_name?: string | null;
  created_at: string;
  updated_at: string;
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
        .order('completed', { ascending: true })
        .order('updated_at', { ascending: false });

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

  const reorderItems = async (reorderedItems: ShoppingItem[]) => {
    try {
      // For now, just update the local state since we don't have order_index column
      // In the future, you could add an order_index column to persist the order
      setItems(reorderedItems);

      toast({
        title: "Items reordered",
        description: "Your shopping list order has been updated.",
      });
    } catch (error) {
      console.error('Error reordering items:', error);
      toast({
        title: "Error reordering items",
        description: "Failed to update the item order.",
        variant: "destructive",
      });
    }
  };

  const addItem = async (text: string, quantity: number, category?: string, notes?: string, shopName?: string) => {
    try {
      // Check for existing item with the same text (case-insensitive)
      const existingItem = items.find(item => 
        item.text.toLowerCase() === text.trim().toLowerCase()
      );

      if (existingItem) {
        // Prepare updates for the existing item
        const updates: any = {};
        
        // Update quantity if new quantity is greater than 1 and different from existing
        if (quantity > 1 && existingItem.quantity !== quantity) {
          updates.quantity = quantity;
        }
        
        // Update category if provided and different from existing (or if existing has no category)
        if (category && category.trim() && 
            (!existingItem.category || existingItem.category !== category.trim())) {
          updates.category = category.trim();
        }
        
        // Update shop if provided and different from existing (or if existing has no shop)
        if (shopName && shopName.trim() && 
            (!existingItem.shop_name || existingItem.shop_name !== shopName.trim())) {
          updates.shop_name = shopName.trim();
        }
        
        // Update notes if provided and different from existing (or if existing has no notes)
        if (notes && notes.trim() && 
            (!existingItem.notes || existingItem.notes !== notes.trim())) {
          updates.notes = notes.trim();
        }
        
        // If there are updates to make, update the existing item
        if (Object.keys(updates).length > 0) {
          const success = await updateItem(existingItem.id, updates);
          if (success) {
            const updateDetails = [];
            if (updates.quantity) updateDetails.push(`quantity to ${updates.quantity}`);
            if (updates.category) updateDetails.push(`category to "${updates.category}"`);
            if (updates.shop_name) updateDetails.push(`shop to "${updates.shop_name}"`);
            if (updates.notes) updateDetails.push('notes');
            
            toast({
              title: "Item updated!",
              description: `"${existingItem.text}" already exists. Updated ${updateDetails.join(', ')}.`,
            });
          }
          return success;
        } else {
          // No updates needed, just notify the user
          toast({
            title: "Item already exists",
            description: `"${existingItem.text}" is already in your list.`,
          });
          return true;
        }
      }

      // If no existing item found, add new item
      const { data, error } = await supabase
        .from('shopping_items')
        .insert({
          text: text.trim(),
          quantity: quantity || 1,
          completed: false,
          category: category?.trim() || null,
          notes: notes?.trim() || null,
          shop_name: shopName?.trim() || null,
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

      setItems(prev => [data, ...prev]);
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

  const updateItem = async (id: string, updates: Partial<Pick<ShoppingItem, 'text' | 'quantity' | 'completed' | 'category' | 'notes' | 'shop_name'>>) => {
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

      if (updates.text || updates.quantity || updates.category || updates.notes || updates.shop_name) {
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
    reorderItems,
    refetch: loadItems,
  };
};
