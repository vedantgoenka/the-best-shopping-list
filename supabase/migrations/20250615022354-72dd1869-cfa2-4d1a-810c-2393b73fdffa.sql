
-- Add order_index column to shopping_items table
ALTER TABLE public.shopping_items 
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Update existing items to have sequential order_index values using a subquery
WITH numbered_items AS (
  SELECT id, row_number() OVER (ORDER BY created_at) - 1 as new_order
  FROM public.shopping_items
)
UPDATE public.shopping_items 
SET order_index = numbered_items.new_order
FROM numbered_items 
WHERE shopping_items.id = numbered_items.id;

-- Make order_index NOT NULL after setting initial values
ALTER TABLE public.shopping_items 
ALTER COLUMN order_index SET NOT NULL;
