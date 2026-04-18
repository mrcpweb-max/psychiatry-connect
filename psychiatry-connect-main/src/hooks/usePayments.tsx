import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Payment {
  id: string;
  candidate_id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "refunded" | "failed";
  provider_ref: string | null;
  session_mode: "one_on_one" | "group";
  session_type: "mock" | "learning";
  stations: number;
  group_size: number | null;
  group_participants: any;
  refund_amount: number | null;
  refund_reason: string | null;
  refunded_at: string | null;
  refunded_by: string | null;
  created_at: string;
  updated_at: string;
  candidate?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

export function useAllPayments() {
  return useQuery({
    queryKey: ["all-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          candidate:profiles!payments_candidate_id_fkey(id, full_name, email)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      paymentId, 
      refundPercentage, 
      reason 
    }: { 
      paymentId: string; 
      refundPercentage: 50 | 100; 
      reason: string;
    }) => {
      // First get the payment to calculate refund amount
      const { data: payment, error: fetchError } = await supabase
        .from("payments")
        .select("amount")
        .eq("id", paymentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const refundAmount = (payment.amount * refundPercentage) / 100;
      
      const { data, error } = await supabase
        .from("payments")
        .update({
          status: "refunded",
          refund_amount: refundAmount,
          refund_reason: reason,
          refunded_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-payments"] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: Payment["status"] }) => {
      const { data, error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", paymentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-payments"] });
    },
  });
}