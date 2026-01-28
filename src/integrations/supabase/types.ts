export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      booking_stations: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          station_id: string
          station_order: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          station_id: string
          station_order?: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          station_id?: string
          station_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_stations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_stations_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          calendly_event_uri: string | null
          candidate_id: string
          created_at: string
          group_participants: Json | null
          group_size: number | null
          id: string
          notes: string | null
          payment_id: string | null
          recording_consent: boolean | null
          scheduled_at: string | null
          scheduling_token_id: string | null
          session_mode: Database["public"]["Enums"]["session_mode"]
          session_type: Database["public"]["Enums"]["session_type"]
          stations: number
          status: Database["public"]["Enums"]["booking_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          calendly_event_uri?: string | null
          candidate_id: string
          created_at?: string
          group_participants?: Json | null
          group_size?: number | null
          id?: string
          notes?: string | null
          payment_id?: string | null
          recording_consent?: boolean | null
          scheduled_at?: string | null
          scheduling_token_id?: string | null
          session_mode: Database["public"]["Enums"]["session_mode"]
          session_type: Database["public"]["Enums"]["session_type"]
          stations?: number
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          calendly_event_uri?: string | null
          candidate_id?: string
          created_at?: string
          group_participants?: Json | null
          group_size?: number | null
          id?: string
          notes?: string | null
          payment_id?: string | null
          recording_consent?: boolean | null
          scheduled_at?: string | null
          scheduling_token_id?: string | null
          session_mode?: Database["public"]["Enums"]["session_mode"]
          session_type?: Database["public"]["Enums"]["session_type"]
          stations?: number
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_scheduling_token_id_fkey"
            columns: ["scheduling_token_id"]
            isOneToOne: false
            referencedRelation: "scheduling_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          candidate_id: string
          created_at: string
          currency: string
          group_participants: Json | null
          group_size: number | null
          id: string
          provider_ref: string | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          refunded_by: string | null
          session_mode: Database["public"]["Enums"]["session_mode"]
          session_type: Database["public"]["Enums"]["session_type"]
          stations: number
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          candidate_id: string
          created_at?: string
          currency?: string
          group_participants?: Json | null
          group_size?: number | null
          id?: string
          provider_ref?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          refunded_by?: string | null
          session_mode: Database["public"]["Enums"]["session_mode"]
          session_type: Database["public"]["Enums"]["session_type"]
          stations?: number
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          candidate_id?: string
          created_at?: string
          currency?: string
          group_participants?: Json | null
          group_size?: number | null
          id?: string
          provider_ref?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          refunded_by?: string | null
          session_mode?: Database["public"]["Enums"]["session_mode"]
          session_type?: Database["public"]["Enums"]["session_type"]
          stations?: number
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_refunded_by_fkey"
            columns: ["refunded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recordings: {
        Row: {
          booking_id: string
          created_at: string
          expiry_date: string
          id: string
          recording_url: string
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          expiry_date: string
          id?: string
          recording_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          expiry_date?: string
          id?: string
          recording_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_tokens: {
        Row: {
          candidate_id: string
          created_at: string
          expires_at: string
          id: string
          payment_id: string | null
          token: string
          trainer_id: string
          used_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          expires_at: string
          id?: string
          payment_id?: string | null
          token: string
          trainer_id: string
          used_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          payment_id?: string | null
          token?: string
          trainer_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_tokens_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduling_tokens_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduling_tokens_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduling_tokens_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      station_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      station_subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "station_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "station_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          subcategory_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subcategory_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subcategory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stations_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "station_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_availability_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_availability_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
          trainer_id: string
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
          trainer_id: string
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_blocked_dates_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_blocked_dates_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          applied_at: string | null
          areas_of_expertise: string[] | null
          avatar_url: string | null
          bio: string | null
          calendar_type: string | null
          calendly_url: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          qualifications: string | null
          session_types_offered: string[] | null
          specialty: string | null
          status: Database["public"]["Enums"]["trainer_status"] | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          applied_at?: string | null
          areas_of_expertise?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          calendar_type?: string | null
          calendly_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          qualifications?: string | null
          session_types_offered?: string[] | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["trainer_status"] | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          applied_at?: string | null
          areas_of_expertise?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          calendar_type?: string | null
          calendly_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          qualifications?: string | null
          session_types_offered?: string[] | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["trainer_status"] | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      trainers_public: {
        Row: {
          applied_at: string | null
          areas_of_expertise: string[] | null
          avatar_url: string | null
          bio: string | null
          calendar_type: string | null
          calendly_url: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          qualifications: string | null
          session_types_offered: string[] | null
          specialty: string | null
          status: Database["public"]["Enums"]["trainer_status"] | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          applied_at?: string | null
          areas_of_expertise?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          calendar_type?: string | null
          calendly_url?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          qualifications?: string | null
          session_types_offered?: string[] | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["trainer_status"] | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          applied_at?: string | null
          areas_of_expertise?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          calendar_type?: string | null
          calendly_url?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          qualifications?: string | null
          session_types_offered?: string[] | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["trainer_status"] | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_candidate: { Args: never; Returns: boolean }
      is_trainer: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "candidate" | "trainer"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      payment_status: "pending" | "completed" | "refunded" | "failed"
      session_mode: "one_on_one" | "group"
      session_type: "mock" | "learning"
      trainer_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "candidate", "trainer"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      payment_status: ["pending", "completed", "refunded", "failed"],
      session_mode: ["one_on_one", "group"],
      session_type: ["mock", "learning"],
      trainer_status: ["pending", "approved", "rejected"],
    },
  },
} as const
