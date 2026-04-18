-- Fix 1: Drop the old contact form insert policy and create a new one with server-side validation
DROP POLICY IF EXISTS "Public can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Create new policy with proper validation
CREATE POLICY "Public can submit contact form" ON public.contact_submissions
  FOR INSERT
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    message IS NOT NULL AND 
    length(message) > 0 AND length(message) <= 5000 AND
    name IS NOT NULL AND
    length(name) > 0 AND length(name) <= 255 AND
    (subject IS NULL OR length(subject) <= 255)
  );

-- Fix 2: Add explicit deny policy for non-admins trying to update user_roles
-- First ensure we have the base policy
DROP POLICY IF EXISTS "Users cannot update own role" ON public.user_roles;

-- Create explicit deny policy for UPDATE to prevent privilege escalation
-- This ensures only admins can update roles via the existing "Admins can manage roles" policy
CREATE POLICY "Users cannot update own role" ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Also add explicit deny for INSERT for non-admins (roles should only be set by trigger or admin)
DROP POLICY IF EXISTS "Users cannot insert roles" ON public.user_roles;
CREATE POLICY "Users cannot insert roles" ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());