
import { ShoppingItem } from '@/types/shoppingItem';

export const findExistingItem = (items: ShoppingItem[], text: string): ShoppingItem | undefined => {
  return items.find(item => 
    item.text.toLowerCase() === text.trim().toLowerCase()
  );
};

export const getMaxOrderIndex = (items: ShoppingItem[]): number => {
  return items.length > 0 ? Math.max(...items.map(item => item.order_index)) : -1;
};

export const createItemUpdates = (
  existingItem: ShoppingItem,
  quantity: number,
  category?: string,
  notes?: string,
  shopName?: string
): Record<string, any> => {
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
  
  return updates;
};

export const getUpdateDetailsMessage = (updates: Record<string, any>): string => {
  const updateDetails = [];
  if (updates.quantity) updateDetails.push(`quantity to ${updates.quantity}`);
  if (updates.category) updateDetails.push(`category to "${updates.category}"`);
  if (updates.shop_name) updateDetails.push(`shop to "${updates.shop_name}"`);
  if (updates.notes) updateDetails.push('notes');
  
  return updateDetails.join(', ');
};

export const getQuantityText = (quantity: number): string => {
  return quantity === 1 ? '' : ` x${quantity}`;
};
