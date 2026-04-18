
-- Block anonymous access to sensitive tables
-- Note: These use RESTRICTIVE policies so they layer on top of existing PERMISSIVE ones

-- profiles: block anonymous access
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- contact_submissions: block anonymous SELECT for anon (insert already restricted by RLS check)
CREATE POLICY "Block anonymous read access to contact_submissions"
ON public.contact_submissions
FOR SELECT
TO anon
USING (false);

-- payments: block anonymous access
CREATE POLICY "Block anonymous access to payments"
ON public.payments
FOR SELECT
TO anon
USING (false);

-- bookings: block anonymous access
CREATE POLICY "Block anonymous access to bookings"
ON public.bookings
FOR SELECT
TO anon
USING (false);

-- recordings: block anonymous access
CREATE POLICY "Block anonymous access to recordings"
ON public.recordings
FOR SELECT
TO anon
USING (false);

-- user_roles: block anonymous access
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles
FOR SELECT
TO anon
USING (false);

-- scheduling_tokens: block anonymous access
CREATE POLICY "Block anonymous access to scheduling_tokens"
ON public.scheduling_tokens
FOR SELECT
TO anon
USING (false);

-- booking_stations: block anonymous access
CREATE POLICY "Block anonymous access to booking_stations"
ON public.booking_stations
FOR SELECT
TO anon
USING (false);

-- admin_logs: block anonymous access
CREATE POLICY "Block anonymous access to admin_logs"
ON public.admin_logs
FOR SELECT
TO anon
USING (false);
