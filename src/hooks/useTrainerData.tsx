import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface TrainerAvailability {
  id: string;
  trainer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface TrainerBlockedDate {
  id: string;
  trainer_id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
}

// Trainers viewing their own profile can see all fields including email
const TRAINER_SELF_FIELDS = `
  id, name, email, bio, specialty, calendly_url, avatar_url, is_active, status,
  qualifications, years_experience, areas_of_expertise, session_types_offered,
  calendar_type, applied_at, user_id, created_at, updated_at
`;

export function useTrainerProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trainer-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("trainers")
        .select(TRAINER_SELF_FIELDS)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTrainerAvailability(trainerId?: string) {
  return useQuery({
    queryKey: ["trainer-availability", trainerId],
    queryFn: async () => {
      if (!trainerId) return [];

      const { data, error } = await supabase
        .from("trainer_availability")
        .select("*")
        .eq("trainer_id", trainerId)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;
      return data as TrainerAvailability[];
    },
    enabled: !!trainerId,
  });
}

export function useTrainerBlockedDates(trainerId?: string) {
  return useQuery({
    queryKey: ["trainer-blocked-dates", trainerId],
    queryFn: async () => {
      if (!trainerId) return [];

      const { data, error } = await supabase
        .from("trainer_blocked_dates")
        .select("*")
        .eq("trainer_id", trainerId)
        .order("blocked_date");

      if (error) throw error;
      return data as TrainerBlockedDate[];
    },
    enabled: !!trainerId,
  });
}

export function useAddAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (availability: Omit<TrainerAvailability, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("trainer_availability")
        .insert(availability)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainer-availability", variables.trainer_id] });
    },
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, trainerId }: { id: string; trainerId: string }) => {
      const { error } = await supabase
        .from("trainer_availability")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return trainerId;
    },
    onSuccess: (trainerId) => {
      queryClient.invalidateQueries({ queryKey: ["trainer-availability", trainerId] });
    },
  });
}

export function useAddBlockedDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedDate: Omit<TrainerBlockedDate, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("trainer_blocked_dates")
        .insert(blockedDate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainer-blocked-dates", variables.trainer_id] });
    },
  });
}

export function useDeleteBlockedDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, trainerId }: { id: string; trainerId: string }) => {
      const { error } = await supabase
        .from("trainer_blocked_dates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return trainerId;
    },
    onSuccess: (trainerId) => {
      queryClient.invalidateQueries({ queryKey: ["trainer-blocked-dates", trainerId] });
    },
  });
}

export function useTrainerBookings(trainerId?: string) {
  return useQuery({
    queryKey: ["trainer-bookings", trainerId],
    queryFn: async () => {
      if (!trainerId) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          candidate:profiles!bookings_candidate_id_fkey(id, full_name, email),
          booking_stations:booking_stations(
            id,
            station_order,
            station:stations(id, name, subcategory:station_subcategories(name, category:station_categories(name)))
          )
        `)
        .eq("trainer_id", trainerId)
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!trainerId,
  });
}
