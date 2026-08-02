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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assist_access_modes: {
        Row: {
          description: string
          icon: string
          id: string
          is_active: boolean
          label: string
          mode_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          description: string
          icon?: string
          id?: string
          is_active?: boolean
          label: string
          mode_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          label?: string
          mode_key?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      assist_agents: {
        Row: {
          agent_code: string
          created_at: string
          display_name: string
          id: string
          specialisation: string
          status: string
        }
        Insert: {
          agent_code: string
          created_at?: string
          display_name: string
          id?: string
          specialisation?: string
          status?: string
        }
        Update: {
          agent_code?: string
          created_at?: string
          display_name?: string
          id?: string
          specialisation?: string
          status?: string
        }
        Relationships: []
      }
      assist_ai_suggestions: {
        Row: {
          confidence: number
          created_at: string
          id: string
          message: string
          session_id: string | null
          status: string
          suggestion_code: string
          suggestion_type: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          message: string
          session_id?: string | null
          status?: string
          suggestion_code: string
          suggestion_type?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          message?: string
          session_id?: string | null
          status?: string
          suggestion_code?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assist_ai_suggestions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assist_approvals: {
        Row: {
          agent_id: string | null
          approval_code: string
          assist_type: string
          awaiting_role: string
          decided_at: string | null
          decision_note: string | null
          end_user_id: string | null
          expires_at: string
          id: string
          scope: string
          session_id: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          agent_id?: string | null
          approval_code: string
          assist_type?: string
          awaiting_role?: string
          decided_at?: string | null
          decision_note?: string | null
          end_user_id?: string | null
          expires_at?: string
          id?: string
          scope?: string
          session_id?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          agent_id?: string | null
          approval_code?: string
          assist_type?: string
          awaiting_role?: string
          decided_at?: string | null
          decision_note?: string | null
          end_user_id?: string | null
          expires_at?: string
          id?: string
          scope?: string
          session_id?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assist_approvals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "assist_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assist_approvals_end_user_id_fkey"
            columns: ["end_user_id"]
            isOneToOne: false
            referencedRelation: "assist_end_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assist_approvals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assist_chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_translation: boolean
          sender: string
          session_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_translation?: boolean
          sender: string
          session_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_translation?: boolean
          sender?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assist_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assist_control_state: {
        Row: {
          auto_translate: boolean
          control_mode: string
          cursor_control: boolean
          id: string
          is_paused: boolean
          keyboard_control: boolean
          microphone_enabled: boolean
          resolution_lock: boolean
          session_id: string | null
          speaker_enabled: boolean
          updated_at: string
          voice_active: boolean
          window_specific: boolean
        }
        Insert: {
          auto_translate?: boolean
          control_mode?: string
          cursor_control?: boolean
          id?: string
          is_paused?: boolean
          keyboard_control?: boolean
          microphone_enabled?: boolean
          resolution_lock?: boolean
          session_id?: string | null
          speaker_enabled?: boolean
          updated_at?: string
          voice_active?: boolean
          window_specific?: boolean
        }
        Update: {
          auto_translate?: boolean
          control_mode?: string
          cursor_control?: boolean
          id?: string
          is_paused?: boolean
          keyboard_control?: boolean
          microphone_enabled?: boolean
          resolution_lock?: boolean
          session_id?: string | null
          speaker_enabled?: boolean
          updated_at?: string
          voice_active?: boolean
          window_specific?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "assist_control_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assist_emergency_stops: {
        Row: {
          created_at: string
          id: string
          reason: string
          session_code: string
          stop_code: string
          stop_type: string
          stopped_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          session_code: string
          stop_code: string
          stop_type?: string
          stopped_by?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          session_code?: string
          stop_code?: string
          stop_type?: string
          stopped_by?: string
        }
        Relationships: []
      }
      assist_end_users: {
        Row: {
          active_window: string | null
          created_at: string
          device: string
          id: string
          operating_system: string
          role: string
          user_code: string
        }
        Insert: {
          active_window?: string | null
          created_at?: string
          device?: string
          id?: string
          operating_system?: string
          role?: string
          user_code: string
        }
        Update: {
          active_window?: string | null
          created_at?: string
          device?: string
          id?: string
          operating_system?: string
          role?: string
          user_code?: string
        }
        Relationships: []
      }
      assist_file_transfers: {
        Row: {
          auto_delete: boolean
          created_at: string
          direction: string
          file_name: string
          id: string
          one_time_access: boolean
          progress: number
          session_id: string | null
          size_bytes: number
          status: string
          transfer_code: string
        }
        Insert: {
          auto_delete?: boolean
          created_at?: string
          direction: string
          file_name: string
          id?: string
          one_time_access?: boolean
          progress?: number
          session_id?: string | null
          size_bytes?: number
          status?: string
          transfer_code: string
        }
        Update: {
          auto_delete?: boolean
          created_at?: string
          direction?: string
          file_name?: string
          id?: string
          one_time_access?: boolean
          progress?: number
          session_id?: string | null
          size_bytes?: number
          status?: string
          transfer_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "assist_file_transfers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assist_privacy_controls: {
        Row: {
          control_key: string
          description: string
          enabled: boolean
          icon: string
          id: string
          is_critical: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          control_key: string
          description: string
          enabled?: boolean
          icon?: string
          id?: string
          is_critical?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          control_key?: string
          description?: string
          enabled?: boolean
          icon?: string
          id?: string
          is_critical?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      assist_session_requests: {
        Row: {
          ai_assist_enabled: boolean
          assist_type: string
          created_at: string
          end_user_id: string | null
          id: string
          priority: string
          purpose: string
          request_code: string
          requested_duration_minutes: number
          requested_scope: string
          review_note: string | null
          reviewed_at: string | null
          status: string
        }
        Insert: {
          ai_assist_enabled?: boolean
          assist_type?: string
          created_at?: string
          end_user_id?: string | null
          id?: string
          priority?: string
          purpose: string
          request_code: string
          requested_duration_minutes?: number
          requested_scope?: string
          review_note?: string | null
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          ai_assist_enabled?: boolean
          assist_type?: string
          created_at?: string
          end_user_id?: string | null
          id?: string
          priority?: string
          purpose?: string
          request_code?: string
          requested_duration_minutes?: number
          requested_scope?: string
          review_note?: string | null
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "assist_session_requests_end_user_id_fkey"
            columns: ["end_user_id"]
            isOneToOne: false
            referencedRelation: "assist_end_users"
            referencedColumns: ["id"]
          },
        ]
      }
      assist_session_windows: {
        Row: {
          id: string
          is_visible: boolean
          session_id: string | null
          sort_order: number
          title: string
        }
        Insert: {
          id?: string
          is_visible?: boolean
          session_id?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          id?: string
          is_visible?: boolean
          session_id?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assist_session_windows_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assist_sessions: {
        Row: {
          access_mode: string
          actions_count: number
          agent_id: string | null
          ai_involved: boolean
          ai_score: number
          assist_type: string
          created_at: string
          end_reason: string | null
          end_user_id: string | null
          ended_at: string | null
          frame_rate: number
          id: string
          latency_ms: number
          permissions: string[]
          purpose: string | null
          resolution: string
          restrictions: string[]
          risk_level: string
          session_code: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_mode?: string
          actions_count?: number
          agent_id?: string | null
          ai_involved?: boolean
          ai_score?: number
          assist_type?: string
          created_at?: string
          end_reason?: string | null
          end_user_id?: string | null
          ended_at?: string | null
          frame_rate?: number
          id?: string
          latency_ms?: number
          permissions?: string[]
          purpose?: string | null
          resolution?: string
          restrictions?: string[]
          risk_level?: string
          session_code: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_mode?: string
          actions_count?: number
          agent_id?: string | null
          ai_involved?: boolean
          ai_score?: number
          assist_type?: string
          created_at?: string
          end_reason?: string | null
          end_user_id?: string | null
          ended_at?: string | null
          frame_rate?: number
          id?: string
          latency_ms?: number
          permissions?: string[]
          purpose?: string | null
          resolution?: string
          restrictions?: string[]
          risk_level?: string
          session_code?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assist_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "assist_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assist_sessions_end_user_id_fkey"
            columns: ["end_user_id"]
            isOneToOne: false
            referencedRelation: "assist_end_users"
            referencedColumns: ["id"]
          },
        ]
      }
      assist_settings: {
        Row: {
          control_type: string
          id: string
          is_locked: boolean
          label: string
          section: string
          setting_key: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          control_type: string
          id?: string
          is_locked?: boolean
          label: string
          section: string
          setting_key: string
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          control_type?: string
          id?: string
          is_locked?: boolean
          label?: string
          section?: string
          setting_key?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
