-- Fix security warnings

-- 1. Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Drop the overly permissive contact submissions policy and create a more specific one
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Create policy that allows anonymous and authenticated users to insert
CREATE POLICY "Public can submit contact form" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL 
    AND message IS NOT NULL 
    AND length(message) > 0
  );