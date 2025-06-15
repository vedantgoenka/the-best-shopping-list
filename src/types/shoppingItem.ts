
export interface ShoppingItem {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
  category?: string | null;
  notes?: string | null;
  shop_name?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}
