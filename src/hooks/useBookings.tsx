import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type SessionMode = "one_on_one" | "group";
export type SessionType = "mock" | "learning";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  candidate_id: string;
  trainer_id: string;
  payment_id: string | null;
  scheduling_token_id: string | null;
  session_mode: SessionMode;
  session_type: SessionType;
  stations: number;
  group_size: number | null;
  group_participants: any | null;
  scheduled_at: string | null;
  calendly_event_uri: string | null;
  status: BookingStatus;
  notes: string | null;
  recording_consent: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  trainer?: {
    id: string;
    name: string;
    specialty: string | null;
    calendly_url: string | null;
  };
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

export interface CreateBookingData {
  trainer_id: string;
  session_mode: SessionMode;
  session_type: SessionType;
  stations: number;
  group_size?: number;
  group_participants?: any;
  notes?: string;
  recording_consent?: boolean;
}

export function useUserBookings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookings", "user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          trainer:trainers(id, name, specialty, calendly_url)
        `)
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user?.id,
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          trainer:trainers(id, name, specialty, calendly_url),
          profile:profiles(id, full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (booking: CreateBookingData) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          ...booking,
          candidate_id: user.id,
          status: "pending",
        })
        .select(`
          *,
          trainer:trainers(id, name, specialty, calendly_url)
        `)
        .single();

      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Booking> & { id: string }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
