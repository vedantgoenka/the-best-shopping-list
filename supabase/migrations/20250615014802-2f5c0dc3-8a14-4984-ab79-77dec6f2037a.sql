
-- Add shop_name column to the shopping_items table
ALTER TABLE public.shopping_items 
ADD COLUMN IF NOT EXISTS shop_name TEXT;
