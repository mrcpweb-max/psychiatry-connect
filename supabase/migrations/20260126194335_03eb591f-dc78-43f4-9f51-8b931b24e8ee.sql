-- Station Categories
CREATE TABLE public.station_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Station Subcategories
CREATE TABLE public.station_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.station_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(category_id, name)
);

-- Stations
CREATE TABLE public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID REFERENCES public.station_subcategories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(subcategory_id, name)
);

-- Booking Stations (junction table)
CREATE TABLE public.booking_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES public.stations(id) ON DELETE RESTRICT NOT NULL,
  station_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Trainer Availability
CREATE TABLE public.trainer_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(trainer_id, day_of_week, start_time)
);

-- Trainer Blocked Dates
CREATE TABLE public.trainer_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(trainer_id, blocked_date)
);

-- Recordings
CREATE TABLE public.recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  recording_url TEXT NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- App Settings (for recording config)
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add user_id to trainers for login
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Add recording_consent to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS recording_consent BOOLEAN DEFAULT false;

-- Create is_trainer function
CREATE OR REPLACE FUNCTION public.is_trainer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'trainer'
  )
$$;

-- Enable RLS on all new tables
ALTER TABLE public.station_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Station Categories RLS (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.station_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.station_categories FOR ALL USING (is_admin());

-- Station Subcategories RLS
CREATE POLICY "Anyone can view subcategories" ON public.station_subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can manage subcategories" ON public.station_subcategories FOR ALL USING (is_admin());

-- Stations RLS
CREATE POLICY "Anyone can view active stations" ON public.stations FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all stations" ON public.stations FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage stations" ON public.stations FOR ALL USING (is_admin());

-- Booking Stations RLS
CREATE POLICY "Candidates can view own booking stations" ON public.booking_stations FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_id AND bookings.candidate_id = auth.uid()));
CREATE POLICY "Candidates can insert own booking stations" ON public.booking_stations FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_id AND bookings.candidate_id = auth.uid()));
CREATE POLICY "Trainers can view assigned booking stations" ON public.booking_stations FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.bookings b JOIN public.trainers t ON b.trainer_id = t.id WHERE b.id = booking_id AND t.user_id = auth.uid()));
CREATE POLICY "Admins can manage booking stations" ON public.booking_stations FOR ALL USING (is_admin());

-- Trainer Availability RLS
CREATE POLICY "Anyone can view trainer availability" ON public.trainer_availability FOR SELECT USING (true);
CREATE POLICY "Trainers can manage own availability" ON public.trainer_availability FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.trainers WHERE id = trainer_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all availability" ON public.trainer_availability FOR ALL USING (is_admin());

-- Trainer Blocked Dates RLS
CREATE POLICY "Anyone can view blocked dates" ON public.trainer_blocked_dates FOR SELECT USING (true);
CREATE POLICY "Trainers can manage own blocked dates" ON public.trainer_blocked_dates FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.trainers WHERE id = trainer_id AND user_id = auth.uid()));
CREATE POLICY "Admins can manage all blocked dates" ON public.trainer_blocked_dates FOR ALL USING (is_admin());

-- Recordings RLS
CREATE POLICY "Candidates can view own active recordings" ON public.recordings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_id AND bookings.candidate_id = auth.uid()) AND status = 'active' AND expiry_date > now());
CREATE POLICY "Trainers can view assigned session recordings" ON public.recordings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.bookings b JOIN public.trainers t ON b.trainer_id = t.id WHERE b.id = booking_id AND t.user_id = auth.uid()));
CREATE POLICY "Admins can manage all recordings" ON public.recordings FOR ALL USING (is_admin());

-- App Settings RLS
CREATE POLICY "Anyone can view settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL USING (is_admin());

-- Triggers for updated_at
CREATE TRIGGER update_recordings_updated_at BEFORE UPDATE ON public.recordings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trainers policy for trainers to view their own profile
CREATE POLICY "Trainers can view own profile" ON public.trainers FOR SELECT 
  USING (user_id = auth.uid());
CREATE POLICY "Trainers can update own profile" ON public.trainers FOR UPDATE 
  USING (user_id = auth.uid());

-- Bookings policy for trainers
CREATE POLICY "Trainers can view assigned bookings" ON public.bookings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.trainers WHERE id = trainer_id AND user_id = auth.uid()));