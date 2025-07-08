export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          permissions: string[] | null
          status: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: string | null
          permissions?: string[] | null
          status?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string | null
          permissions?: string[] | null
          status?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          app_id: string | null
          event_type: string
          event_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          app_id?: string | null
          event_type: string
          event_data?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          app_id?: string | null
          event_type?: string
          event_data?: any
          created_at?: string
        }
      }
      app_installations: {
        Row: {
          id: string
          user_id: string
          app_id: string
          installed_at: string
          status: string | null
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          app_id: string
          installed_at?: string
          status?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          app_id?: string
          installed_at?: string
          status?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      app_tags: {
        Row: {
          id: string
          app_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      apps: {
        Row: {
          id: string
          name: string
          slug: string
          tagline: string | null
          description: string | null
          category: string | null
          status: string | null
          icon_url: string | null
          banner_url: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          tagline?: string | null
          description?: string | null
          category?: string | null
          status?: string | null
          icon_url?: string | null
          banner_url?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          tagline?: string | null
          description?: string | null
          category?: string | null
          status?: string | null
          icon_url?: string | null
          banner_url?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      micro_apps: {
        Row: {
          id: string
          app_id: string
          name: string
          slug: string
          description: string | null
          category: string | null
          status: string | null
          icon_url: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          app_id: string
          name: string
          slug: string
          description?: string | null
          category?: string | null
          status?: string | null
          icon_url?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: string | null
          status?: string | null
          icon_url?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          type: string | null
          status: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message?: string | null
          type?: string | null
          status?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string | null
          type?: string | null
          status?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      prosperity_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          app_id: string
          rating: number
          comment: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          app_id: string
          rating: number
          comment?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          app_id?: string
          rating?: number
          comment?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          color: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          wallet_id: string
          amount: number
          currency: string | null
          type: string
          status: string | null
          description: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_id: string
          amount: number
          currency?: string | null
          type: string
          status?: string | null
          description?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_id?: string
          amount?: number
          currency?: string | null
          type?: string
          status?: string | null
          description?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          location: string | null
          age_group: string | null
          profession: string | null
          bio: string | null
          preferences: any
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          location?: string | null
          age_group?: string | null
          profession?: string | null
          bio?: string | null
          preferences?: any
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          location?: string | null
          age_group?: string | null
          profession?: string | null
          bio?: string | null
          preferences?: any
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          currency: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          currency?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          currency?: string | null
          status?: string | null
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
  }
}