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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      alerts: {
        Row: {
          acknowledged: boolean | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          severity: string
          source: string | null
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          severity?: string
          source?: string | null
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          severity?: string
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      api_connections: {
        Row: {
          api_key: string | null
          api_secret: string | null
          category: string
          created_at: string
          display_name: string
          enabled: boolean
          extra_config: Json | null
          id: string
          last_tested_at: string | null
          provider: string
          rate_limit_per_min: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          category: string
          created_at?: string
          display_name: string
          enabled?: boolean
          extra_config?: Json | null
          id?: string
          last_tested_at?: string | null
          provider: string
          rate_limit_per_min?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          category?: string
          created_at?: string
          display_name?: string
          enabled?: boolean
          extra_config?: Json | null
          id?: string
          last_tested_at?: string | null
          provider?: string
          rate_limit_per_min?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          aspired_position: Database["public"]["Enums"]["aspired_position"]
          bio: string | null
          campaign_slogan: string | null
          campaign_topics: string[] | null
          constituency: string | null
          county: string | null
          created_at: string
          full_name: string
          id: string
          onboarded: boolean
          party: string | null
          social_handles: Json | null
          updated_at: string
          user_id: string
          ward: string | null
          website: string | null
        }
        Insert: {
          aspired_position: Database["public"]["Enums"]["aspired_position"]
          bio?: string | null
          campaign_slogan?: string | null
          campaign_topics?: string[] | null
          constituency?: string | null
          county?: string | null
          created_at?: string
          full_name: string
          id?: string
          onboarded?: boolean
          party?: string | null
          social_handles?: Json | null
          updated_at?: string
          user_id: string
          ward?: string | null
          website?: string | null
        }
        Update: {
          aspired_position?: Database["public"]["Enums"]["aspired_position"]
          bio?: string | null
          campaign_slogan?: string | null
          campaign_topics?: string[] | null
          constituency?: string | null
          county?: string | null
          created_at?: string
          full_name?: string
          id?: string
          onboarded?: boolean
          party?: string | null
          social_handles?: Json | null
          updated_at?: string
          user_id?: string
          ward?: string | null
          website?: string | null
        }
        Relationships: []
      }
      job_runs: {
        Row: {
          finished_at: string | null
          id: string
          job: string
          message: string | null
          started_at: string
          status: string
        }
        Insert: {
          finished_at?: string | null
          id?: string
          job: string
          message?: string | null
          started_at?: string
          status?: string
        }
        Update: {
          finished_at?: string | null
          id?: string
          job?: string
          message?: string | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      module_settings: {
        Row: {
          ai_model: string | null
          config: Json | null
          display_name: string
          enabled: boolean
          id: string
          module_key: string
          updated_at: string
        }
        Insert: {
          ai_model?: string | null
          config?: Json | null
          display_name: string
          enabled?: boolean
          id?: string
          module_key: string
          updated_at?: string
        }
        Update: {
          ai_model?: string | null
          config?: Json | null
          display_name?: string
          enabled?: boolean
          id?: string
          module_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          id: string
          level: string
          message: string
          metadata: Json | null
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          message: string
          metadata?: Json | null
          source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
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
      turnout_results: {
        Row: {
          county: string
          election: string
          fetched_at: string
          id: string
          published_on: string | null
          registered_voters: number | null
          scope: string
          source_title: string
          source_url: string
          turnout_pct: number | null
          verification_note: string | null
          verified: boolean
          votes_cast: number | null
        }
        Insert: {
          county?: string
          election: string
          fetched_at?: string
          id?: string
          published_on?: string | null
          registered_voters?: number | null
          scope: string
          source_title: string
          source_url: string
          turnout_pct?: number | null
          verification_note?: string | null
          verified?: boolean
          votes_cast?: number | null
        }
        Update: {
          county?: string
          election?: string
          fetched_at?: string
          id?: string
          published_on?: string | null
          registered_voters?: number | null
          scope?: string
          source_title?: string
          source_url?: string
          turnout_pct?: number | null
          verification_note?: string | null
          verified?: boolean
          votes_cast?: number | null
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          resource: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          resource?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          resource?: string | null
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "admin" | "analyst" | "viewer"
      aspired_position:
        | "president"
        | "deputy_president"
        | "governor"
        | "senator"
        | "woman_representative"
        | "mp"
        | "mca"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "analyst", "viewer"],
      aspired_position: [
        "president",
        "deputy_president",
        "governor",
        "senator",
        "woman_representative",
        "mp",
        "mca",
      ],
    },
  },
} as const
