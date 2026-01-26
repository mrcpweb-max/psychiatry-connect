-- Add trainer role to existing enum (must be committed before use)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'trainer';