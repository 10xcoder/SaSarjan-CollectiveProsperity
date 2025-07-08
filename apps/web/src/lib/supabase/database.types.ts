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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          wallet_balance: number
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          preferred_language: string
          location: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          wallet_balance?: number
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          preferred_language?: string
          location?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          wallet_balance?: number
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          preferred_language?: string
          location?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      developers: {
        Row: {
          id: string
          user_id: string
          company_name: string | null
          company_website: string | null
          tax_id: string | null
          bank_details: Json | null
          commission_rate: number
          payout_threshold: number
          total_earnings: number
          total_paid_out: number
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name?: string | null
          company_website?: string | null
          tax_id?: string | null
          bank_details?: Json | null
          commission_rate?: number
          payout_threshold?: number
          total_earnings?: number
          total_paid_out?: number
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string | null
          company_website?: string | null
          tax_id?: string | null
          bank_details?: Json | null
          commission_rate?: number
          payout_threshold?: number
          total_earnings?: number
          total_paid_out?: number
          verified_at?: string | null
          created_at?: string
        }
      }
      apps: {
        Row: {
          id: string
          developer_id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          category: Database["public"]["Enums"]["app_category"]
          status: Database["public"]["Enums"]["app_status"]
          icon_url: string | null
          screenshots: Json
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          price: number | null
          currency: string
          trial_days: number
          free_content_rules: Json
          paid_content_rules: Json
          version: string
          min_app_version: string | null
          size_bytes: number | null
          supported_languages: string[]
          translations: Json
          geo_restrictions: Json | null
          total_installs: number
          active_installs: number
          average_rating: number
          total_reviews: number
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          developer_id: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          category: Database["public"]["Enums"]["app_category"]
          status?: Database["public"]["Enums"]["app_status"]
          icon_url?: string | null
          screenshots?: Json
          pricing_model: Database["public"]["Enums"]["pricing_model"]
          price?: number | null
          currency?: string
          trial_days?: number
          free_content_rules?: Json
          paid_content_rules?: Json
          version?: string
          min_app_version?: string | null
          size_bytes?: number | null
          supported_languages?: string[]
          translations?: Json
          geo_restrictions?: Json | null
          total_installs?: number
          active_installs?: number
          average_rating?: number
          total_reviews?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          developer_id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          category?: Database["public"]["Enums"]["app_category"]
          status?: Database["public"]["Enums"]["app_status"]
          icon_url?: string | null
          screenshots?: Json
          pricing_model?: Database["public"]["Enums"]["pricing_model"]
          price?: number | null
          currency?: string
          trial_days?: number
          free_content_rules?: Json
          paid_content_rules?: Json
          version?: string
          min_app_version?: string | null
          size_bytes?: number | null
          supported_languages?: string[]
          translations?: Json
          geo_restrictions?: Json | null
          total_installs?: number
          active_installs?: number
          average_rating?: number
          total_reviews?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          category: Database["public"]["Enums"]["tag_category"]
          description: string | null
          parent_id: string | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category: Database["public"]["Enums"]["tag_category"]
          description?: string | null
          parent_id?: string | null
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: Database["public"]["Enums"]["tag_category"]
          description?: string | null
          parent_id?: string | null
          usage_count?: number
          created_at?: string
        }
      }
      app_tags: {
        Row: {
          id: string
          app_id: string
          tag_id: string
          relevance_score: number
          auto_tagged: boolean
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          tag_id: string
          relevance_score?: number
          auto_tagged?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          tag_id?: string
          relevance_score?: number
          auto_tagged?: boolean
          created_at?: string
        }
      }
      user_app_installations: {
        Row: {
          id: string
          user_id: string
          app_id: string
          installed_at: string
          last_used_at: string | null
          enabled_modules: string[]
          settings: Json
        }
        Insert: {
          id?: string
          user_id: string
          app_id: string
          installed_at?: string
          last_used_at?: string | null
          enabled_modules?: string[]
          settings?: Json
        }
        Update: {
          id?: string
          user_id?: string
          app_id?: string
          installed_at?: string
          last_used_at?: string | null
          enabled_modules?: string[]
          settings?: Json
        }
      }
      personalization_profiles: {
        Row: {
          id: string
          user_id: string
          interests: string[]
          skills: string[]
          goals: string[]
          preferred_categories: Database["public"]["Enums"]["app_category"][]
          engagement_patterns: Json
          ml_embeddings: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interests?: string[]
          skills?: string[]
          goals?: string[]
          preferred_categories?: Database["public"]["Enums"]["app_category"][]
          engagement_patterns?: Json
          ml_embeddings?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interests?: string[]
          skills?: string[]
          goals?: string[]
          preferred_categories?: Database["public"]["Enums"]["app_category"][]
          engagement_patterns?: Json
          ml_embeddings?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      external_apps: {
        Row: {
          id: string
          name: string
          url: string
          platform: Database["public"]["Enums"]["platform_type"]
          discovery_source: string
          discovery_method: string
          discovered_at: string
          submitted_by: string | null
          access_type: Database["public"]["Enums"]["access_type"]
          requires_account: boolean
          curation_status: Database["public"]["Enums"]["curation_status"]
          curation_score: number | null
          impact_score: number | null
          total_reviews: number
          total_stories: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          platform: Database["public"]["Enums"]["platform_type"]
          discovery_source: string
          discovery_method: string
          discovered_at?: string
          submitted_by?: string | null
          access_type: Database["public"]["Enums"]["access_type"]
          requires_account?: boolean
          curation_status?: Database["public"]["Enums"]["curation_status"]
          curation_score?: number | null
          impact_score?: number | null
          total_reviews?: number
          total_stories?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          discovery_source?: string
          discovery_method?: string
          discovered_at?: string
          submitted_by?: string | null
          access_type?: Database["public"]["Enums"]["access_type"]
          requires_account?: boolean
          curation_status?: Database["public"]["Enums"]["curation_status"]
          curation_score?: number | null
          impact_score?: number | null
          total_reviews?: number
          total_stories?: number
          created_at?: string
          updated_at?: string
        }
      }
      success_stories: {
        Row: {
          id: string
          external_app_id: string | null
          internal_app_id: string | null
          author_id: string
          title: string
          challenge: string
          solution: string
          outcome: string
          people_helped: number
          problems_solved: string[]
          resources_saved: Json
          connections_created: number
          verified: boolean
          verified_by: string | null
          verified_at: string | null
          evidence: Json
          helpful_count: number
          inspiring_count: number
          share_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          external_app_id?: string | null
          internal_app_id?: string | null
          author_id: string
          title: string
          challenge: string
          solution: string
          outcome: string
          people_helped?: number
          problems_solved?: string[]
          resources_saved?: Json
          connections_created?: number
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          evidence?: Json
          helpful_count?: number
          inspiring_count?: number
          share_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          external_app_id?: string | null
          internal_app_id?: string | null
          author_id?: string
          title?: string
          challenge?: string
          solution?: string
          outcome?: string
          people_helped?: number
          problems_solved?: string[]
          resources_saved?: Json
          connections_created?: number
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          evidence?: Json
          helpful_count?: number
          inspiring_count?: number
          share_count?: number
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
      user_role: "customer" | "developer" | "admin"
      kyc_status: "pending" | "verified" | "rejected"
      app_status: "draft" | "submitted" | "in_review" | "approved" | "rejected" | "suspended"
      pricing_model: "free" | "freemium" | "paid" | "subscription"
      app_category: 
        | "personal_transformation"
        | "organizational_excellence" 
        | "community_resilience"
        | "ecological_regeneration"
        | "economic_empowerment"
        | "knowledge_commons"
        | "social_innovation"
        | "cultural_expression"
      tag_category: 
        | "technical" 
        | "content-type" 
        | "audience" 
        | "platform" 
        | "feature" 
        | "genre" 
        | "topic" 
        | "other"
      platform_type: 
        | "web" 
        | "ios" 
        | "android" 
        | "windows" 
        | "mac" 
        | "linux" 
        | "cross-platform"
      access_type: "free" | "freemium" | "paid" | "donation"
      curation_status: "pending" | "reviewing" | "approved" | "rejected" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"])[TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
    ? (Database["public"]["Tables"])[PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof (Database["public"]["Enums"])
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]]["Enums"])
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicEnumNameOrOptions["schema"]]["Enums"])[EnumName]
  : PublicEnumNameOrOptions extends keyof (Database["public"]["Enums"])
    ? (Database["public"]["Enums"])[PublicEnumNameOrOptions]
    : never