import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schema for contact form submissions
const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().max(255, "Subject must be less than 255 characters").optional(),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be less than 5000 characters"),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

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
      // Validate input before sending to server
      const validatedData = contactSubmissionSchema.parse(submission);
      
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert({
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject || null,
          message: validatedData.message,
        })
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
