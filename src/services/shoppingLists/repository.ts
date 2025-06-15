
import { supabase } from '@/integrations/supabase/client';
import { ShoppingList } from '@/types/shoppingList';
import { CreateShoppingListData, UpdateShoppingListData, ShoppingListsRepository } from './types';

export class SupabaseShoppingListsRepository implements ShoppingListsRepository {
  async fetchLists(): Promise<ShoppingList[]> {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading shopping lists:', error);
      throw new Error('Failed to load shopping lists');
    }

    return data || [];
  }

  async createList(listData: CreateShoppingListData): Promise<ShoppingList> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create lists');
    }

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        name: listData.name.trim(),
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shopping list:', error);
      throw new Error('Failed to create shopping list');
    }

    return data;
  }

  async updateList(id: string, updates: UpdateShoppingListData): Promise<void> {
    const { error } = await supabase
      .from('shopping_lists')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating shopping list:', error);
      throw new Error('Failed to update shopping list');
    }
  }

  async deleteList(id: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shopping list:', error);
      throw new Error('Failed to delete shopping list');
    }
  }

  async getDefaultList(): Promise<ShoppingList | null> {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting default list:', error);
      throw new Error('Failed to get default list');
    }

    return data || null;
  }
}

export const shoppingListsRepository = new SupabaseShoppingListsRepository();
