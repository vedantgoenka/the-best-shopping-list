
-- Create shopping_lists table
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Add RLS policies for shopping_lists
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping lists" 
  ON public.shopping_lists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping lists" 
  ON public.shopping_lists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists" 
  ON public.shopping_lists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists" 
  ON public.shopping_lists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add shopping_list_id to shopping_items table
ALTER TABLE public.shopping_items 
ADD COLUMN shopping_list_id UUID REFERENCES public.shopping_lists(id) ON DELETE CASCADE;

-- Create trigger to update updated_at on shopping_lists
CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create default shopping list for new users
CREATE OR REPLACE FUNCTION public.create_default_shopping_list()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create default shopping list for new user
  INSERT INTO public.shopping_lists (name, user_id)
  VALUES ('My Shopping List', NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create default shopping list when user profile is created
CREATE TRIGGER on_profile_created_create_default_list
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_shopping_list();
