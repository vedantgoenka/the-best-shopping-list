
-- Create a table for shopping list items
CREATE TABLE public.shopping_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - for now we'll make it public access
-- You can add user authentication later if needed
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations for now (public access)
CREATE POLICY "Allow all operations on shopping_items" 
  ON public.shopping_items 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Add trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shopping_items_updated_at 
    BEFORE UPDATE ON public.shopping_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
