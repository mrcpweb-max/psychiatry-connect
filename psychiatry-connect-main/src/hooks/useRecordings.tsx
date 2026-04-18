import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Recording {
  id: string;
  booking_id: string;
  recording_url: string;
  expiry_date: string;
  status: "active" | "expired" | "revoked";
  created_at: string;
  updated_at: string;
}

export function useRecordings() {
  return useQuery({
    queryKey: ["recordings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recordings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Recording[];
    },
  });
}

export function useUserRecordings() {
  return useQuery({
    queryKey: ["user-recordings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("recordings")
        .select(`
          *,
          booking:bookings(
            id,
            session_type,
            session_mode,
            stations,
            scheduled_at,
            trainer:trainers(name)
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useRevokeRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordingId: string) => {
      const { data, error } = await supabase
        .from("recordings")
        .update({ status: "revoked" })
        .eq("id", recordingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordings"] });
      queryClient.invalidateQueries({ queryKey: ["user-recordings"] });
    },
  });
}

export function useAppSettings() {
  return useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*");

      if (error) throw error;

      const settings: Record<string, any> = {};
      data.forEach((s: any) => {
        settings[s.key] = s.value;
      });

      return settings;
    },
  });
}
