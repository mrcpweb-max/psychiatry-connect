
-- Table for trainer session offerings
CREATE TABLE public.trainer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  session_mode text NOT NULL CHECK (session_mode IN ('one_on_one', 'group')),
  session_type text NOT NULL CHECK (session_type IN ('mock', 'learning')),
  group_size integer DEFAULT NULL,
  stations integer NOT NULL DEFAULT 1,
  duration_minutes integer NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'GBP',
  description text DEFAULT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, session_mode, session_type, stations, group_size)
);

-- RLS
ALTER TABLE public.trainer_sessions ENABLE ROW LEVEL SECURITY;

-- Trainers can view their own sessions
CREATE POLICY "Trainers can view own sessions"
ON public.trainer_sessions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trainers
    WHERE trainers.id = trainer_sessions.trainer_id
    AND trainers.user_id = auth.uid()
  )
);

-- Trainers can insert own sessions
CREATE POLICY "Trainers can insert own sessions"
ON public.trainer_sessions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trainers
    WHERE trainers.id = trainer_sessions.trainer_id
    AND trainers.user_id = auth.uid()
  )
);

-- Trainers can update own sessions
CREATE POLICY "Trainers can update own sessions"
ON public.trainer_sessions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trainers
    WHERE trainers.id = trainer_sessions.trainer_id
    AND trainers.user_id = auth.uid()
  )
);

-- Trainers can delete own sessions
CREATE POLICY "Trainers can delete own sessions"
ON public.trainer_sessions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trainers
    WHERE trainers.id = trainer_sessions.trainer_id
    AND trainers.user_id = auth.uid()
  )
);

-- Admins full access
CREATE POLICY "Admins can manage all trainer sessions"
ON public.trainer_sessions FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Public can view active sessions (for booking page)
CREATE POLICY "Anyone can view active trainer sessions"
ON public.trainer_sessions FOR SELECT
USING (is_active = true);

-- Updated_at trigger
CREATE TRIGGER update_trainer_sessions_updated_at
  BEFORE UPDATE ON public.trainer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
