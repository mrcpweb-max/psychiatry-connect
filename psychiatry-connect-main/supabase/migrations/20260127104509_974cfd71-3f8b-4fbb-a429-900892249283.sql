-- Add trainer status enum
CREATE TYPE public.trainer_status AS ENUM ('pending', 'approved', 'rejected');

-- Add new columns to trainers table for onboarding
ALTER TABLE public.trainers
ADD COLUMN IF NOT EXISTS status public.trainer_status DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS qualifications TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS areas_of_expertise TEXT[],
ADD COLUMN IF NOT EXISTS session_types_offered TEXT[],
ADD COLUMN IF NOT EXISTS calendar_type TEXT DEFAULT 'calendly',
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE;

-- Set all existing trainers as approved (they were already active)
UPDATE public.trainers SET status = 'approved' WHERE status IS NULL;

-- Add refund_amount and refund_status columns to payments table for refund tracking
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES public.profiles(id);

-- Create policy for trainers to insert their own trainer application
CREATE POLICY "Authenticated users can apply as trainer" 
ON public.trainers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update RLS policy for candidates to view only approved trainers in booking
DROP POLICY IF EXISTS "Anyone can view active trainers" ON public.trainers;
CREATE POLICY "Anyone can view approved active trainers" 
ON public.trainers FOR SELECT 
USING (is_active = true AND status = 'approved');

-- Allow admin to manage all trainers (existing policy but let's ensure it covers all)
DROP POLICY IF EXISTS "Admins can manage trainers" ON public.trainers;
CREATE POLICY "Admins can manage trainers" 
ON public.trainers FOR ALL 
USING (is_admin());

-- Trainer can update their own pending profile (before approval)
DROP POLICY IF EXISTS "Trainers can update own profile" ON public.trainers;
CREATE POLICY "Trainers can update own profile" 
ON public.trainers FOR UPDATE 
USING (user_id = auth.uid());

-- Policy for admins to update payments (for refunds)
CREATE POLICY "Admins can update payments" 
ON public.payments FOR UPDATE 
USING (is_admin());

-- Policy for admins to manage station categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.station_categories;
CREATE POLICY "Admins can manage categories" 
ON public.station_categories FOR ALL 
USING (is_admin());

-- Policy for admins to manage station subcategories
DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.station_subcategories;
CREATE POLICY "Admins can manage subcategories" 
ON public.station_subcategories FOR ALL 
USING (is_admin());

-- Policy for admins to manage stations
DROP POLICY IF EXISTS "Admins can manage stations" ON public.stations;
CREATE POLICY "Admins can manage stations" 
ON public.stations FOR ALL 
USING (is_admin());