
-- First, let's check what policies already exist and then add only the missing ones
-- Add policy to allow users to update their own profile (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" 
          ON public.profiles 
          FOR UPDATE 
          USING (auth.uid() = id);
    END IF;
END $$;

-- Add policy to allow profile creation during user registration (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Enable profile creation during registration'
    ) THEN
        CREATE POLICY "Enable profile creation during registration" 
          ON public.profiles 
          FOR INSERT 
          WITH CHECK (true);
    END IF;
END $$;
