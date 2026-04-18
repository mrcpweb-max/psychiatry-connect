import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrainerSession {
  id: string;
  trainer_id: string;
  session_mode: "one_on_one" | "group";
  session_type: "mock" | "learning";
  group_size: number | null;
  stations: number;
  duration_minutes: number;
  price: number;
  currency: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TrainerSessionInsert = Omit<TrainerSession, "id" | "created_at" | "updated_at">;

export function useTrainerSessions(trainerId?: string) {
  return useQuery({
    queryKey: ["trainer-sessions", trainerId],
    queryFn: async () => {
      if (!trainerId) return [];
      const { data, error } = await supabase
        .from("trainer_sessions" as any)
        .select("*")
        .eq("trainer_id", trainerId)
        .order("session_mode")
        .order("session_type")
        .order("stations");

      if (error) throw error;
      return data as unknown as TrainerSession[];
    },
    enabled: !!trainerId,
  });
}

export function useCreateTrainerSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: TrainerSessionInsert) => {
      const { data, error } = await supabase
        .from("trainer_sessions" as any)
        .insert(session as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as TrainerSession;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainer-sessions", variables.trainer_id] });
    },
  });
}

export function useUpdateTrainerSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, trainerId, ...updates }: Partial<TrainerSession> & { id: string; trainerId: string }) => {
      const { data, error } = await supabase
        .from("trainer_sessions" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { data, trainerId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["trainer-sessions", result.trainerId] });
    },
  });
}

export function useDeleteTrainerSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, trainerId }: { id: string; trainerId: string }) => {
      const { error } = await supabase
        .from("trainer_sessions" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return trainerId;
    },
    onSuccess: (trainerId) => {
      queryClient.invalidateQueries({ queryKey: ["trainer-sessions", trainerId] });
    },
  });
}
