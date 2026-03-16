
-- Create meetings table for Calendly/Zoom integration
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id text UNIQUE,
  teacher_email text,
  student_email text,
  meeting_time timestamp with time zone,
  meeting_status text NOT NULL DEFAULT 'scheduled',
  zoom_play_url text,
  zoom_download_url text,
  recording_status text NOT NULL DEFAULT 'pending',
  recording_created_at timestamp with time zone,
  recording_access_expires timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage all meetings"
  ON public.meetings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Students can view their own meetings (matched by email from profiles)
CREATE POLICY "Students can view own meetings"
  ON public.meetings FOR SELECT
  TO authenticated
  USING (
    student_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Teachers can view their own meetings (matched by email)
CREATE POLICY "Teachers can view own meetings"
  ON public.meetings FOR SELECT
  TO authenticated
  USING (
    teacher_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Block anonymous access
CREATE POLICY "Block anonymous access to meetings"
  ON public.meetings FOR SELECT
  TO anon
  USING (false);
