import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Meeting {
  id: string;
  meeting_id: string | null;
  teacher_email: string | null;
  student_email: string | null;
  meeting_time: string | null;
  meeting_status: string;
  zoom_play_url: string | null;
  zoom_download_url: string | null;
  recording_status: string;
  recording_created_at: string | null;
  recording_access_expires: string | null;
  created_at: string;
}

export function useStudentMeetings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-meetings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_time", { ascending: false });

      if (error) throw error;
      return (data as unknown as Meeting[]) || [];
    },
  });
}

export function useTeacherMeetings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["teacher-meetings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_time", { ascending: false });

      if (error) throw error;
      return (data as unknown as Meeting[]) || [];
    },
  });
}

export function useAdminMeetings() {
  return useQuery({
    queryKey: ["admin-meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_time", { ascending: false });

      if (error) throw error;
      return (data as unknown as Meeting[]) || [];
    },
  });
}

export function useExtendMeetingExpiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ meetingId, hours }: { meetingId: string; hours: number }) => {
      // Get current expiry
      const { data: meeting, error: fetchError } = await supabase
        .from("meetings")
        .select("recording_access_expires")
        .eq("id", meetingId)
        .single();

      if (fetchError) throw fetchError;

      const currentExpiry = meeting?.recording_access_expires
        ? new Date(meeting.recording_access_expires)
        : new Date();
      const newExpiry = new Date(currentExpiry.getTime() + hours * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("meetings")
        .update({ recording_access_expires: newExpiry.toISOString() })
        .eq("id", meetingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-meetings"] });
    },
  });
}

export function useStreamRecording() {
  return useMutation({
    mutationFn: async (meetingId: string) => {
      const { data, error } = await supabase.functions.invoke("stream-recording", {
        body: { meeting_id: meetingId },
      });
      if (error) throw error;
      return data as { play_url: string; meeting_time: string; expires_at: string };
    },
  });
}
