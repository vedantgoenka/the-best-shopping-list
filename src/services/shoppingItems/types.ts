
import { ShoppingItem } from '@/types/shoppingItem';

export interface CreateShoppingItemData {
  text: string;
  quantity: number;
  category?: string | null;
  notes?: string | null;
  shop_name?: string | null;
  order_index: number;
  completed?: boolean;
  shopping_list_id?: string | null;
}

export interface UpdateShoppingItemData extends Partial<Pick<ShoppingItem, 'text' | 'quantity' | 'completed' | 'category' | 'notes' | 'shop_name' | 'order_index'>> {}

export interface ShoppingItemsRepository {
  fetchItems(): Promise<ShoppingItem[]>;
  fetchItemsByList(shoppingListId: string): Promise<ShoppingItem[]>;
  createItem(item: CreateShoppingItemData): Promise<ShoppingItem>;
  updateItem(id: string, updates: UpdateShoppingItemData): Promise<void>;
  deleteItem(id: string): Promise<void>;
  deleteItemsByCategory(categoryName: string): Promise<void>;
  updateItemOrder(id: string, orderIndex: number): Promise<void>;
}
