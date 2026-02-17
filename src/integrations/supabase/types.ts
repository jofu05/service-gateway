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
      ai_logs: {
        Row: {
          accepted: boolean | null
          created_at: string
          id: string
          input_meta: Json | null
          output_suggestions: Json | null
          step_id: string
          submission_id: string | null
          trigger: string
        }
        Insert: {
          accepted?: boolean | null
          created_at?: string
          id?: string
          input_meta?: Json | null
          output_suggestions?: Json | null
          step_id: string
          submission_id?: string | null
          trigger: string
        }
        Update: {
          accepted?: boolean | null
          created_at?: string
          id?: string
          input_meta?: Json | null
          output_suggestions?: Json | null
          step_id?: string
          submission_id?: string | null
          trigger?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          payload_json: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          payload_json?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          payload_json?: Json | null
        }
        Relationships: []
      }
      flow_versions: {
        Row: {
          ai_config_json: Json | null
          created_at: string
          created_by: string | null
          flow_id: string
          id: string
          mapping_json: Json | null
          status: Database["public"]["Enums"]["flow_status"]
          tree_json: Json | null
          version: number
        }
        Insert: {
          ai_config_json?: Json | null
          created_at?: string
          created_by?: string | null
          flow_id: string
          id?: string
          mapping_json?: Json | null
          status?: Database["public"]["Enums"]["flow_status"]
          tree_json?: Json | null
          version: number
        }
        Update: {
          ai_config_json?: Json | null
          created_at?: string
          created_by?: string | null
          flow_id?: string
          id?: string
          mapping_json?: Json | null
          status?: Database["public"]["Enums"]["flow_status"]
          tree_json?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "flow_versions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          current_version: number | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["flow_status"]
          target_type: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["flow_status"]
          target_type?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["flow_status"]
          target_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          correlation_id: string | null
          created_at: string
          endpoint: string | null
          id: string
          request_meta: Json | null
          response_meta: Json | null
          status: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          request_meta?: Json | null
          response_meta?: Json | null
          status?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          request_meta?: Json | null
          response_meta?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ad_groups: Json | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_groups?: Json | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_groups?: Json | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          answers_json: Json | null
          created_at: string
          flow_version_id: string | null
          id: string
          pob_status_cache: string | null
          pob_ticket_id: string | null
          runtime_context_json: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers_json?: Json | null
          created_at?: string
          flow_version_id?: string | null
          id?: string
          pob_status_cache?: string | null
          pob_ticket_id?: string | null
          runtime_context_json?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers_json?: Json | null
          created_at?: string
          flow_version_id?: string | null
          id?: string
          pob_status_cache?: string | null
          pob_ticket_id?: string | null
          runtime_context_json?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_flow_version_id_fkey"
            columns: ["flow_version_id"]
            isOneToOne: false
            referencedRelation: "flow_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "manager" | "editor" | "admin"
      flow_status: "draft" | "published" | "archived"
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
      app_role: ["user", "manager", "editor", "admin"],
      flow_status: ["draft", "published", "archived"],
    },
  },
} as const
