export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      apps: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          tagline: string | null
          icon_url: string | null
          category: string | null
          status: string
          created_at: string
          updated_at: string
          developer_id: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          tagline?: string | null
          icon_url?: string | null
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          developer_id: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          tagline?: string | null
          icon_url?: string | null
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          developer_id?: string
        }
      }
      micro_apps: {
        Row: {
          id: string
          name: string
          description: string
          category: string | null
          app_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category?: string | null
          app_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string | null
          app_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      app_installations: {
        Row: {
          id: string
          app_id: string
          user_id: string
          installed_at: string
        }
        Insert: {
          id?: string
          app_id: string
          user_id: string
          installed_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          user_id?: string
          installed_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          app_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      developers: {
        Row: {
          id: string
          user_id: string
          company_name: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      auth_sessions: {
        Row: {
          id: string
          user_id: string
          token_version: number
          last_rotated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_version?: number
          last_rotated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_version?: number
          last_rotated_at?: string | null
          created_at?: string
          updated_at?: string
        }
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