
-- Add new columns to the shopping_items table
ALTER TABLE public.shopping_items 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the trigger function to handle the new columns
-- (The quantity column already exists with default 1, so no need to add it)
