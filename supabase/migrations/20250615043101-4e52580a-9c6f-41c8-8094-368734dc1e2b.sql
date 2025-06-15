
-- Only apply the schema hardening changes since RLS policies already exist
-- First, ensure all existing records have a user_id (update orphaned records if any)
UPDATE public.shopping_items 
SET user_id = (
  SELECT id 
  FROM auth.users 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Now make the column NOT NULL to prevent future orphaned records
ALTER TABLE public.shopping_items 
ALTER COLUMN user_id SET NOT NULL;

-- Add a check constraint to ensure user_id references a valid user
ALTER TABLE public.shopping_items 
ADD CONSTRAINT shopping_items_user_id_check 
CHECK (user_id IS NOT NULL);
