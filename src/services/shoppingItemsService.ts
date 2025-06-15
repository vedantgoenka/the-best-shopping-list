import { supabase } from '@/integrations/supabase/client';
import { ShoppingItem } from '@/types/shoppingItem';

export const shoppingItemsService = {
  async fetchItems(): Promise<ShoppingItem[]> {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .order('completed', { ascending: true })
      .order('order_index', { ascending: false });

    if (error) {
      console.error('Error loading items:', error);
      throw new Error('Failed to load shopping items');
    }

    return data || [];
  },

  async createItem(item: {
    text: string;
    quantity: number;
    category?: string | null;
    notes?: string | null;
    shop_name?: string | null;
    order_index: number;
    completed?: boolean;
  }): Promise<ShoppingItem> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create items');
    }

    const { data, error } = await supabase
      .from('shopping_items')
      .insert({
        text: item.text.trim(),
        quantity: item.quantity || 1,
        completed: item.completed || false,
        category: item.category?.trim() || null,
        notes: item.notes?.trim() || null,
        shop_name: item.shop_name?.trim() || null,
        order_index: item.order_index,
        user_id: user.id, // Associate with current user
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
      throw new Error('Failed to add item');
    }

    return data;
  },

  async updateItem(id: string, updates: Partial<Pick<ShoppingItem, 'text' | 'quantity' | 'completed' | 'category' | 'notes' | 'shop_name' | 'order_index'>>) {
    const { error } = await supabase
      .from('shopping_items')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating item:', error);
      throw new Error('Failed to update item');
    }
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      throw new Error('Failed to delete item');
    }
  },

  async deleteItemsByCategory(categoryName: string) {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('category', categoryName);

    if (error) {
      console.error('Error deleting items by category:', error);
      throw new Error('Failed to delete items by category');
    }
  },

  async updateItemOrder(id: string, orderIndex: number) {
    const { error } = await supabase
      .from('shopping_items')
      .update({ order_index: orderIndex })
      .eq('id', id);

    if (error) {
      console.error('Error updating order_index:', error);
      throw new Error('Failed to update item order');
    }
  },
};
