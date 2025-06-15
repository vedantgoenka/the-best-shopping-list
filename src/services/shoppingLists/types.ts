
import { ShoppingList } from '@/types/shoppingList';

export interface CreateShoppingListData {
  name: string;
}

export interface UpdateShoppingListData {
  name?: string;
}

export interface ShoppingListsRepository {
  fetchLists(): Promise<ShoppingList[]>;
  createList(data: CreateShoppingListData): Promise<ShoppingList>;
  updateList(id: string, updates: UpdateShoppingListData): Promise<void>;
  deleteList(id: string): Promise<void>;
  getDefaultList(): Promise<ShoppingList | null>;
}
