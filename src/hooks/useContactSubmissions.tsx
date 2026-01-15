import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useContactSubmissions() {
  return useQuery({
    queryKey: ["contact_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContactSubmission[];
    },
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (submission: { name: string; email: string; subject?: string; message: string }) => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert(submission)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useMarkContactRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .update({ is_read: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_submissions"] });
    },
  });
}
