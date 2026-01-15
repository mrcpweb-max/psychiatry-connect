-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'candidate');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'refunded', 'failed');

-- Create enum for session mode
CREATE TYPE public.session_mode AS ENUM ('one_on_one', 'group');

-- Create enum for session type
CREATE TYPE public.session_type AS ENUM ('mock', 'learning');

-- =====================
-- BASE TABLES
-- =====================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trainers table
CREATE TABLE public.trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  bio TEXT,
  specialty TEXT,
  calendly_url TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- MEMBERSHIP TABLES
-- =====================

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'candidate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- =====================
-- HELPER FUNCTIONS
-- =====================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Check if current user is candidate
CREATE OR REPLACE FUNCTION public.is_candidate()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'candidate'
  )
$$;

-- Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = user_uuid
  LIMIT 1
$$;

-- =====================
-- TRANSACTION TABLES
-- =====================

-- Payments table (structure ready, integration later)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  status payment_status NOT NULL DEFAULT 'pending',
  provider_ref TEXT,
  session_mode session_mode NOT NULL,
  session_type session_type NOT NULL,
  stations INTEGER NOT NULL DEFAULT 1,
  group_size INTEGER DEFAULT 1,
  group_participants JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scheduling tokens table
CREATE TABLE public.scheduling_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id),
  scheduling_token_id UUID REFERENCES public.scheduling_tokens(id),
  session_mode session_mode NOT NULL,
  session_type session_type NOT NULL,
  stations INTEGER NOT NULL DEFAULT 1,
  group_size INTEGER DEFAULT 1,
  group_participants JSONB,
  scheduled_at TIMESTAMPTZ,
  calendly_event_uri TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- AUDIT TABLES
-- =====================

-- Admin logs table
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- ENABLE RLS
-- =====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduling_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS POLICIES
-- =====================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- Trainers policies (public read, admin manage)
CREATE POLICY "Anyone can view active trainers" ON public.trainers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all trainers" ON public.trainers
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage trainers" ON public.trainers
  FOR ALL USING (public.is_admin());

-- Bookings policies
CREATE POLICY "Candidates can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Candidates can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = candidate_id);

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (public.is_admin());

-- Payments policies
CREATE POLICY "Candidates can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_admin());

-- Scheduling tokens policies
CREATE POLICY "Candidates can view own valid tokens" ON public.scheduling_tokens
  FOR SELECT USING (
    auth.uid() = candidate_id 
    AND used_at IS NULL 
    AND expires_at > now()
  );

CREATE POLICY "Admins can view all tokens" ON public.scheduling_tokens
  FOR SELECT USING (public.is_admin());

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view submissions" ON public.contact_submissions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update submissions" ON public.contact_submissions
  FOR UPDATE USING (public.is_admin());

-- Admin logs policies
CREATE POLICY "Admins can view logs" ON public.admin_logs
  FOR SELECT USING (public.is_admin());

-- INSERT restricted to service_role only (no policy = blocked for authenticated users)

-- =====================
-- TRIGGERS
-- =====================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trainers_updated_at
  BEFORE UPDATE ON public.trainers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email
  );
  
  -- Assign default candidate role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'candidate');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_bookings_candidate ON public.bookings(candidate_id);
CREATE INDEX idx_bookings_trainer ON public.bookings(trainer_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_payments_candidate ON public.payments(candidate_id);
CREATE INDEX idx_scheduling_tokens_candidate ON public.scheduling_tokens(candidate_id);
CREATE INDEX idx_scheduling_tokens_token ON public.scheduling_tokens(token);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_admin_logs_admin ON public.admin_logs(admin_id);