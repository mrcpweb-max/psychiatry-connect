import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Trainer {
  id: string;
  name: string;
  email: string | null;
  bio: string | null;
  specialty: string | null;
  calendly_url: string | null;
  avatar_url: string | null;
  is_active: boolean;
  status: "pending" | "approved" | "rejected" | null;
  qualifications: string | null;
  years_experience: number | null;
  areas_of_expertise: string[] | null;
  session_types_offered: string[] | null;
  calendar_type: string | null;
  applied_at: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// Public trainer fields - excludes email for privacy
const PUBLIC_TRAINER_FIELDS = `
  id, name, bio, specialty, calendly_url, avatar_url, is_active, status,
  qualifications, years_experience, areas_of_expertise, session_types_offered,
  calendar_type, applied_at, user_id, created_at, updated_at
`;

export function useTrainers(activeOnly = true) {
  return useQuery({
    queryKey: ["trainers", { activeOnly }],
    queryFn: async () => {
      let query = supabase
        .from("trainers")
        .select(PUBLIC_TRAINER_FIELDS)
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true).eq("status", "approved");
      }

      const { data, error } = await query;
      if (error) throw error;
      // Email will be null for public queries
      return (data || []).map(d => ({ ...d, email: null })) as Trainer[];
    },
  });
}

export function useTrainer(id: string | undefined) {
  return useQuery({
    queryKey: ["trainer", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("trainers")
        .select(PUBLIC_TRAINER_FIELDS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      // Email will be null for public queries
      return data ? { ...data, email: null } as Trainer : null;
    },
    enabled: !!id,
  });
}

export function useCreateTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trainer: Omit<Trainer, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("trainers")
        .insert(trainer as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
  });
}

export function useUpdateTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Trainer> & { id: string }) => {
      const { data, error } = await supabase
        .from("trainers")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
  });
}
