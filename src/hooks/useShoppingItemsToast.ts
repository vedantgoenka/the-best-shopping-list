
import { toast } from '@/hooks/use-toast';
import { getQuantityText } from '@/utils/shoppingItemUtils';
import { ShoppingItem } from '@/types/shoppingItem';

export const useShoppingItemsToast = () => {
  const showLoadError = () => {
    toast({
      title: "Error loading items",
      description: "An unexpected error occurred while loading your shopping list.",
      variant: "destructive",
    });
  };

  const showItemAdded = (item: ShoppingItem) => {
    const quantityText = getQuantityText(item.quantity);
    toast({
      title: "Item added!",
      description: `"${item.text}${quantityText}" was added to your shopping list.`,
    });
  };

  const showItemUpdated = (updates: Record<string, any>, itemText?: string) => {
    if (updates.text || updates.quantity || updates.category || updates.notes || updates.shop_name) {
      toast({
        title: "Item updated!",
        description: itemText ? `"${itemText}" has been successfully updated.` : "Your item has been successfully updated.",
      });
    }
  };

  const showItemExists = (text: string) => {
    toast({
      title: "Item already exists",
      description: `"${text}" is already in your list.`,
    });
  };

  const showItemExistsUpdated = (text: string, updateDetails: string) => {
    toast({
      title: "Item updated!",
      description: `"${text}" already exists. Updated ${updateDetails}.`,
    });
  };

  const showItemDeleted = (item: ShoppingItem) => {
    const quantityText = getQuantityText(item.quantity);
    toast({
      title: "Item removed",
      description: `"${item.text}${quantityText}" was removed from your list.`,
    });
  };

  const showCategoryDeleted = (categoryName: string, itemCount: number) => {
    toast({
      title: "Category deleted",
      description: `Category "${categoryName}" and ${itemCount} item${itemCount !== 1 ? 's' : ''} removed.`,
    });
  };

  const showItemsReordered = () => {
    toast({
      title: "Items reordered",
      description: "Your shopping list order has been saved.",
    });
  };

  const showReorderError = () => {
    toast({
      title: "Error reordering items",
      description: "Failed to save the item order. The list has been restored.",
      variant: "destructive",
    });
  };

  const showUpdateError = () => {
    toast({
      title: "Error updating item",
      description: "An unexpected error occurred while updating the item.",
      variant: "destructive",
    });
  };

  const showAddError = () => {
    toast({
      title: "Error adding item",
      description: "An unexpected error occurred while adding the item.",
      variant: "destructive",
    });
  };

  const showDeleteError = () => {
    toast({
      title: "Error deleting item",
      description: "An unexpected error occurred while deleting the item.",
      variant: "destructive",
    });
  };

  const showCategoryDeleteError = () => {
    toast({
      title: "Error deleting category",
      description: "An unexpected error occurred while deleting the category.",
      variant: "destructive",
    });
  };

  return {
    showLoadError,
    showItemAdded,
    showItemUpdated,
    showItemExists,
    showItemExistsUpdated,
    showItemDeleted,
    showCategoryDeleted,
    showItemsReordered,
    showReorderError,
    showUpdateError,
    showAddError,
    showDeleteError,
    showCategoryDeleteError,
  };
};
