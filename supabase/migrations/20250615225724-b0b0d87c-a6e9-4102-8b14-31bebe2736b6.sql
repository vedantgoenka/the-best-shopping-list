
-- Connect all existing shopping items (where shopping_list_id is null) to each user's default shopping list
UPDATE public.shopping_items 
SET shopping_list_id = (
  SELECT sl.id 
  FROM public.shopping_lists sl 
  WHERE sl.user_id = shopping_items.user_id 
  ORDER BY sl.created_at ASC 
  LIMIT 1
)
WHERE shopping_list_id IS NULL;
