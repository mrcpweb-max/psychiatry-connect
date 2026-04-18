-- 1. Add INSERT policy for payments table - only allow service role/admin to create payments
CREATE POLICY "Only admins can insert payments"
ON public.payments
FOR INSERT
WITH CHECK (is_admin());

-- 2. Create a public view for trainers that excludes email
CREATE VIEW public.trainers_public
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  avatar_url,
  bio,
  specialty,
  calendly_url,
  calendar_type,
  is_active,
  status,
  user_id,
  areas_of_expertise,
  session_types_offered,
  years_experience,
  qualifications,
  created_at,
  updated_at,
  applied_at
FROM public.trainers;

-- 3. Update the public SELECT policy to be more restrictive (deny direct access for non-authenticated public queries)
DROP POLICY IF EXISTS "Anyone can view approved active trainers" ON public.trainers;

-- 4. Create new policy that only allows authenticated users to see approved trainers (without email exposure through the view)
CREATE POLICY "Authenticated users can view approved active trainers"
ON public.trainers
FOR SELECT
TO authenticated
USING ((is_active = true) AND (status = 'approved'::trainer_status));