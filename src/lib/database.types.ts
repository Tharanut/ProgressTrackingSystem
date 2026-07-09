export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: Database["public"]["Enums"]["activity_action"];
          changed_at: string;
          changed_by: string | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          new_value: Json | null;
          old_value: Json | null;
        };
        Insert: {
          action: Database["public"]["Enums"]["activity_action"];
          changed_at?: string;
          changed_by?: string | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
        };
        Update: {
          action?: Database["public"]["Enums"]["activity_action"];
          changed_at?: string;
          changed_by?: string | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      attachments: {
        Row: {
          file_name: string;
          file_url: string;
          id: string;
          project_id: string | null;
          task_id: string | null;
          uploaded_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          file_name: string;
          file_url: string;
          id?: string;
          project_id?: string | null;
          task_id?: string | null;
          uploaded_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          file_name?: string;
          file_url?: string;
          id?: string;
          project_id?: string | null;
          task_id?: string | null;
          uploaded_at?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attachments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cost_logs: {
        Row: {
          cost_rate_per_day: number;
          created_at: string;
          id: string;
          man_day: number;
          project_id: string;
          task_id: string | null;
          time_log_id: string | null;
          total_cost: number;
          user_id: string | null;
        };
        Insert: {
          cost_rate_per_day?: number;
          created_at?: string;
          id?: string;
          man_day?: number;
          project_id: string;
          task_id?: string | null;
          time_log_id?: string | null;
          total_cost?: number;
          user_id?: string | null;
        };
        Update: {
          cost_rate_per_day?: number;
          created_at?: string;
          id?: string;
          man_day?: number;
          project_id?: string;
          task_id?: string | null;
          time_log_id?: string | null;
          total_cost?: number;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cost_logs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cost_logs_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cost_logs_time_log_id_fkey";
            columns: ["time_log_id"];
            isOneToOne: true;
            referencedRelation: "time_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cost_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: {
          created_at: string;
          department_code: string;
          department_name: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          department_code: string;
          department_name: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          department_code?: string;
          department_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          cost_rate_per_day: number;
          created_at: string;
          department_id: string | null;
          email: string | null;
          employee_code: string | null;
          full_name: string;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["user_role"];
          username: string;
        };
        Insert: {
          cost_rate_per_day?: number;
          created_at?: string;
          department_id?: string | null;
          email?: string | null;
          employee_code?: string | null;
          full_name: string;
          id: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["user_role"];
          username: string;
        };
        Update: {
          cost_rate_per_day?: number;
          created_at?: string;
          department_id?: string | null;
          email?: string | null;
          employee_code?: string | null;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["user_role"];
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          actual_man_day: number;
          id: string;
          planned_man_day: number;
          project_id: string;
          project_role: string | null;
          responsibility: string | null;
          user_id: string;
        };
        Insert: {
          actual_man_day?: number;
          id?: string;
          planned_man_day?: number;
          project_id: string;
          project_role?: string | null;
          responsibility?: string | null;
          user_id: string;
        };
        Update: {
          actual_man_day?: number;
          id?: string;
          planned_man_day?: number;
          project_id?: string;
          project_role?: string | null;
          responsibility?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          actual_cost: number;
          actual_end_date: string | null;
          actual_man_day: number;
          actual_start_date: string | null;
          created_at: string;
          department_id: string | null;
          description: string | null;
          id: string;
          planned_cost: number;
          planned_end_date: string | null;
          planned_man_day: number;
          planned_start_date: string | null;
          priority: Database["public"]["Enums"]["priority_level"];
          progress_percent: number;
          project_code: string;
          project_name: string;
          project_owner_id: string | null;
          status: Database["public"]["Enums"]["project_status"];
        };
        Insert: {
          actual_cost?: number;
          actual_end_date?: string | null;
          actual_man_day?: number;
          actual_start_date?: string | null;
          created_at?: string;
          department_id?: string | null;
          description?: string | null;
          id?: string;
          planned_cost?: number;
          planned_end_date?: string | null;
          planned_man_day?: number;
          planned_start_date?: string | null;
          priority?: Database["public"]["Enums"]["priority_level"];
          progress_percent?: number;
          project_code: string;
          project_name: string;
          project_owner_id?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
        };
        Update: {
          actual_cost?: number;
          actual_end_date?: string | null;
          actual_man_day?: number;
          actual_start_date?: string | null;
          created_at?: string;
          department_id?: string | null;
          description?: string | null;
          id?: string;
          planned_cost?: number;
          planned_end_date?: string | null;
          planned_man_day?: number;
          planned_start_date?: string | null;
          priority?: Database["public"]["Enums"]["priority_level"];
          progress_percent?: number;
          project_code?: string;
          project_name?: string;
          project_owner_id?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
        };
        Relationships: [
          {
            foreignKeyName: "projects_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_project_owner_id_fkey";
            columns: ["project_owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          actual_end_date: string | null;
          actual_hour: number;
          actual_man_day: number;
          actual_start_date: string | null;
          assigned_to: string | null;
          created_at: string;
          id: string;
          planned_end_date: string | null;
          planned_hour: number;
          planned_man_day: number;
          planned_start_date: string | null;
          progress_percent: number;
          project_id: string;
          remark: string | null;
          status: Database["public"]["Enums"]["task_status"];
          task_description: string | null;
          task_name: string;
        };
        Insert: {
          actual_end_date?: string | null;
          actual_hour?: number;
          actual_man_day?: number;
          actual_start_date?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          id?: string;
          planned_end_date?: string | null;
          planned_hour?: number;
          planned_man_day?: number;
          planned_start_date?: string | null;
          progress_percent?: number;
          project_id: string;
          remark?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          task_description?: string | null;
          task_name: string;
        };
        Update: {
          actual_end_date?: string | null;
          actual_hour?: number;
          actual_man_day?: number;
          actual_start_date?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          id?: string;
          planned_end_date?: string | null;
          planned_hour?: number;
          planned_man_day?: number;
          planned_start_date?: string | null;
          progress_percent?: number;
          project_id?: string;
          remark?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          task_description?: string | null;
          task_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      time_logs: {
        Row: {
          created_at: string;
          id: string;
          issue_blocker: string | null;
          project_id: string;
          task_id: string | null;
          user_id: string;
          work_date: string;
          work_detail: string | null;
          work_hour: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          issue_blocker?: string | null;
          project_id: string;
          task_id?: string | null;
          user_id: string;
          work_date: string;
          work_detail?: string | null;
          work_hour: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          issue_blocker?: string | null;
          project_id?: string;
          task_id?: string | null;
          user_id?: string;
          work_date?: string;
          work_detail?: string | null;
          work_hour?: number;
        };
        Relationships: [
          {
            foreignKeyName: "time_logs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "time_logs_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "time_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_app_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      recalc_cost_log_for_time_log: {
        Args: { p_time_log_id: string };
        Returns: undefined;
      };
      recalc_member_actuals: {
        Args: { p_project_id: string; p_user_id: string };
        Returns: undefined;
      };
      recalc_project_actuals: {
        Args: { p_project_id: string };
        Returns: undefined;
      };
      recalc_task_actuals: { Args: { p_task_id: string }; Returns: undefined };
    };
    Enums: {
      activity_action: "create" | "update" | "delete";
      priority_level: "high" | "medium" | "low";
      project_status:
        "planning" | "in_progress" | "completed" | "delayed" | "on_hold" | "cancelled";
      task_status: "pending" | "in_progress" | "done" | "delayed";
      user_role: "admin" | "pm" | "member" | "management" | "viewer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      activity_action: ["create", "update", "delete"],
      priority_level: ["high", "medium", "low"],
      project_status: ["planning", "in_progress", "completed", "delayed", "on_hold", "cancelled"],
      task_status: ["pending", "in_progress", "done", "delayed"],
      user_role: ["admin", "pm", "member", "management", "viewer"],
    },
  },
} as const;
