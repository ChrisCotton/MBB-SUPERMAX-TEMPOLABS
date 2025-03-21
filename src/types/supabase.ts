export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          hourly_rate: number
          id: string
          name: string
          tasks_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hourly_rate: number
          id?: string
          name: string
          tasks_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hourly_rate?: number
          id?: string
          name?: string
          tasks_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      goal_milestones: {
        Row: {
          completion_date: string | null
          created_at: string
          description: string | null
          goal_id: string
          id: string
          is_completed: boolean | null
          reward: string | null
          target_value: number
          title: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          is_completed?: boolean | null
          reward?: string | null
          target_value: number
          title: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          is_completed?: boolean | null
          reward?: string | null
          target_value?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category_id: string | null
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_completed: boolean | null
          progress_percentage: number | null
          reward: string | null
          start_date: string
          target_date: string
          target_value: number
          time_frame: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          progress_percentage?: number | null
          reward?: string | null
          start_date?: string
          target_date: string
          target_value: number
          time_frame: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          progress_percentage?: number | null
          reward?: string | null
          start_date?: string
          target_date?: string
          target_value?: number
          time_frame?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string | null
          id: string
          title: string
          transcription: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
          transcription?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          transcription?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mental_bank_balances: {
        Row: {
          created_at: string | null
          current_balance: number
          daily_growth: number
          id: string
          progress_percentage: number
          target_balance: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_balance: number
          daily_growth: number
          id?: string
          progress_percentage: number
          target_balance: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_balance?: number
          daily_growth?: number
          id?: string
          progress_percentage?: number
          target_balance?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number
          hourly_rate: number
          id: string
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          category_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours: number
          hourly_rate: number
          id?: string
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          category_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number
          hourly_rate?: number
          id?: string
          priority?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          achievement_alerts: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          daily_goal: number | null
          dark_mode: boolean | null
          email_notifications: boolean | null
          id: string
          name: string | null
          target_balance: number | null
          updated_at: string
          user_id: string
          weekly_reports: boolean | null
        }
        Insert: {
          achievement_alerts?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_goal?: number | null
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          name?: string | null
          target_balance?: number | null
          updated_at?: string
          user_id: string
          weekly_reports?: boolean | null
        }
        Update: {
          achievement_alerts?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_goal?: number | null
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          name?: string | null
          target_balance?: number | null
          updated_at?: string
          user_id?: string
          weekly_reports?: boolean | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_config: Json | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_config?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_config?: Json | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
