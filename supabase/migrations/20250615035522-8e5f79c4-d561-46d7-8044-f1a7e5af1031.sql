
-- Connect all existing shopping items (where user_id is null) to the only user in the database
UPDATE public.shopping_items 
SET user_id = (
  SELECT id 
  FROM auth.users 
  LIMIT 1
)
WHERE user_id IS NULL;
