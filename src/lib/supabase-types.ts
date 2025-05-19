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
      google_calendar_settings: {
        Row: {
          access_token: string | null
          auto_sync_new_tasks: boolean
          created_at: string | null
          id: string
          is_connected: boolean
          refresh_token: string | null
          selected_calendar_id: string | null
          sync_completed_tasks: boolean
          sync_high_priority_only: boolean
          token_expiry: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          auto_sync_new_tasks?: boolean
          created_at?: string | null
          id?: string
          is_connected?: boolean
          refresh_token?: string | null
          selected_calendar_id?: string | null
          sync_completed_tasks?: boolean
          sync_high_priority_only?: boolean
          token_expiry?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          auto_sync_new_tasks?: boolean
          created_at?: string | null
          id?: string
          is_connected?: boolean
          refresh_token?: string | null
          selected_calendar_id?: string | null
          sync_completed_tasks?: boolean
          sync_high_priority_only?: boolean
          token_expiry?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      task_calendar_events: {
        Row: {
          calendar_id: string
          created_at: string | null
          event_id: string
          id: string
          last_synced: string | null
          task_id: string
        }
        Insert: {
          calendar_id: string
          created_at?: string | null
          event_id: string
          id?: string
          last_synced?: string | null
          task_id: string
        }
        Update: {
          calendar_id?: string
          created_at?: string | null
          event_id?: string
          id?: string
          last_synced?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_calendar_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_session_start_time: string | null
          daily_balance: number | null
          description: string | null
          due_date: string | null
          estimated_hours: number
          hourly_rate: number
          id: string
          in_progress: boolean | null
          priority: string | null
          title: string
          user_id: string
        }
        Insert: {
          category_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_session_start_time?: string | null
          daily_balance?: number | null
          description?: string | null
          due_date?: string | null
          estimated_hours: number
          hourly_rate: number
          id?: string
          in_progress?: boolean | null
          priority?: string | null
          title: string
          user_id: string
        }
        Update: {
          category_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_session_start_time?: string | null
          daily_balance?: number | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number
          hourly_rate?: number
          id?: string
          in_progress?: boolean | null
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
      time_entries: {
        Row: {
          created_at: string | null
          duration: number | null
          end_time: string | null
          id: string
          is_running: boolean | null
          start_time: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          is_running?: boolean | null
          start_time: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          is_running?: boolean | null
          start_time?: string
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
          display_name: string | null
          email: string | null
          email_notifications: boolean | null
          first_name: string | null
          id: string
          initial_balance: number | null
          last_name: string | null
          name: string | null
          notification_daily_updates: boolean | null
          notification_goal_achievement: boolean | null
          notification_task_reminders: boolean | null
          phone: string | null
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
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          initial_balance?: number | null
          last_name?: string | null
          name?: string | null
          notification_daily_updates?: boolean | null
          notification_goal_achievement?: boolean | null
          notification_task_reminders?: boolean | null
          phone?: string | null
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
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          initial_balance?: number | null
          last_name?: string | null
          name?: string | null
          notification_daily_updates?: boolean | null
          notification_goal_achievement?: boolean | null
          notification_task_reminders?: boolean | null
          phone?: string | null
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
      vision_boards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          title?: string | null
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
      increment: {
        Args: { row_id: string; increment_amount: number; column_name: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
