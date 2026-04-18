import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UpdateTrainerProfileData {
  trainerId: string;
  name?: string;
  bio?: string;
  specialty?: string;
  calendly_url?: string;
  qualifications?: string;
  years_experience?: number;
  areas_of_expertise?: string[];
  session_types_offered?: string[];
  calendar_type?: string;
}

export function useUpdateTrainerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trainerId, ...updates }: UpdateTrainerProfileData) => {
      const { data, error } = await supabase
        .from("trainers")
        .update(updates)
        .eq("id", trainerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-profile"] });
    },
  });
}
