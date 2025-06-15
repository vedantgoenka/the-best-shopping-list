import { supabase } from '@/integrations/supabase/client';
import { ShoppingItem } from '@/types/shoppingItem';
import { CreateShoppingItemData, UpdateShoppingItemData, ShoppingItemsRepository } from './types';

export class SupabaseShoppingItemsRepository implements ShoppingItemsRepository {
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
  }

  async fetchItemsByList(shoppingListId: string): Promise<ShoppingItem[]> {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('shopping_list_id', shoppingListId)
      .order('completed', { ascending: true })
      .order('order_index', { ascending: false });

    if (error) {
      console.error('Error loading items for list:', error);
      throw new Error('Failed to load shopping items');
    }

    return data || [];
  }

  async createItem(item: CreateShoppingItemData): Promise<ShoppingItem> {
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
        shopping_list_id: item.shopping_list_id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding item:', error);
      throw new Error('Failed to add item');
    }

    return data;
  }

  async updateItem(id: string, updates: UpdateShoppingItemData): Promise<void> {
    const { error } = await supabase
      .from('shopping_items')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating item:', error);
      throw new Error('Failed to update item');
    }
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      throw new Error('Failed to delete item');
    }
  }

  async deleteItemsByCategory(categoryName: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('category', categoryName);

    if (error) {
      console.error('Error deleting items by category:', error);
      throw new Error('Failed to delete items by category');
    }
  }

  async updateItemOrder(id: string, orderIndex: number): Promise<void> {
    const { error } = await supabase
      .from('shopping_items')
      .update({ order_index: orderIndex })
      .eq('id', id);

    if (error) {
      console.error('Error updating order_index:', error);
      throw new Error('Failed to update item order');
    }
  }
}

export const shoppingItemsRepository = new SupabaseShoppingItemsRepository();
