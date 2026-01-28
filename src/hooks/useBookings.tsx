import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

export type SessionMode = "one_on_one" | "group";
export type SessionType = "mock" | "learning";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

// Validation schema for group participants
const participantSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
});

const groupParticipantsSchema = z.array(participantSchema).max(20, "Maximum 20 participants allowed");

export interface GroupParticipant {
  name: string;
  email: string;
}

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
  group_participants: GroupParticipant[] | null;
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
  group_participants?: GroupParticipant[];
  notes?: string;
  recording_consent?: boolean;
}

// Helper to safely parse group_participants from Json
function parseGroupParticipants(data: Json | null): GroupParticipant[] | null {
  if (!data || !Array.isArray(data)) return null;
  try {
    return data.map(item => {
      if (typeof item === 'object' && item !== null && 'name' in item && 'email' in item) {
        return { name: String(item.name), email: String(item.email) };
      }
      return null;
    }).filter((p): p is GroupParticipant => p !== null);
  } catch {
    return null;
  }
}

// Helper to transform database response to Booking type
function transformBookingData(dbData: any): Booking {
  return {
    ...dbData,
    group_participants: parseGroupParticipants(dbData.group_participants),
  };
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
      return (data || []).map(transformBookingData) as Booking[];
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
      return (data || []).map(transformBookingData) as Booking[];
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (booking: CreateBookingData) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Validate group participants if present
      let validatedParticipants: Json | null = null;
      if (booking.group_participants && booking.group_participants.length > 0) {
        try {
          const parsed = groupParticipantsSchema.parse(booking.group_participants);
          // Convert to Json-compatible format
          validatedParticipants = parsed.map(p => ({ name: p.name, email: p.email })) as Json;
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            throw new Error(`Invalid participant data: ${validationError.errors.map(e => e.message).join(", ")}`);
          }
          throw validationError;
        }
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          trainer_id: booking.trainer_id,
          session_mode: booking.session_mode,
          session_type: booking.session_type,
          stations: booking.stations,
          group_size: booking.group_size,
          group_participants: validatedParticipants,
          notes: booking.notes?.trim().slice(0, 1000) || null,
          recording_consent: booking.recording_consent ?? false,
          candidate_id: user.id,
          status: "pending" as const,
        })
        .select(`
          *,
          trainer:trainers(id, name, specialty, calendly_url)
        `)
        .single();

      if (error) throw error;
      return transformBookingData(data) as Booking;
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
      // Convert group_participants to Json-compatible format if present
      const dbUpdates: Record<string, unknown> = { ...updates };
      if (updates.group_participants !== undefined) {
        dbUpdates.group_participants = updates.group_participants 
          ? updates.group_participants.map(p => ({ name: p.name, email: p.email }))
          : null;
      }
      
      const { data, error } = await supabase
        .from("bookings")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return transformBookingData(data);
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
        .update({ status: "cancelled" as const })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return transformBookingData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
