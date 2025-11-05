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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_deal_scores: {
        Row: {
          ad_id: number
          calc_at: string
          deviation_pct: number | null
          fair_value: number | null
          id: number
          notes: string | null
          profit_estimate: number | null
          rarity_index: number | null
          score: number | null
        }
        Insert: {
          ad_id: number
          calc_at?: string
          deviation_pct?: number | null
          fair_value?: number | null
          id?: number
          notes?: string | null
          profit_estimate?: number | null
          rarity_index?: number | null
          score?: number | null
        }
        Update: {
          ad_id?: number
          calc_at?: string
          deviation_pct?: number | null
          fair_value?: number | null
          id?: number
          notes?: string | null
          profit_estimate?: number | null
          rarity_index?: number | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_deal_scores_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_prices: {
        Row: {
          ad_id: number
          id: number
          price: number
          price_drop: boolean | null
          seen_at: string
        }
        Insert: {
          ad_id: number
          id?: number
          price: number
          price_drop?: boolean | null
          seen_at?: string
        }
        Update: {
          ad_id?: number
          id?: number
          price?: number
          price_drop?: boolean | null
          seen_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_prices_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_status_history: {
        Row: {
          ad_id: number
          changed_at: string
          from_status: string | null
          id: number
          reason: string | null
          to_status: string
        }
        Insert: {
          ad_id: number
          changed_at?: string
          from_status?: string | null
          id?: number
          reason?: string | null
          to_status: string
        }
        Update: {
          ad_id?: number
          changed_at?: string
          from_status?: string | null
          id?: number
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_status_history_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_type: string | null
          category: string | null
          city: string | null
          condition: string | null
          content_hash: string | null
          delivery_possible: boolean | null
          description: string | null
          first_seen_at: string
          id: number
          last_seen_at: string
          list_hash: string | null
          location_raw: string | null
          model_confidence: number | null
          model_id: number | null
          platform: string
          platform_ad_id: string
          postal_code: string | null
          promo_tags: string[] | null
          published_at: string | null
          region: string | null
          secured_payment: boolean | null
          shipping_methods: string[] | null
          status: string
          subcategory: string | null
          title: string
          url: string
        }
        Insert: {
          ad_type?: string | null
          category?: string | null
          city?: string | null
          condition?: string | null
          content_hash?: string | null
          delivery_possible?: boolean | null
          description?: string | null
          first_seen_at?: string
          id?: number
          last_seen_at?: string
          list_hash?: string | null
          location_raw?: string | null
          model_confidence?: number | null
          model_id?: number | null
          platform?: string
          platform_ad_id: string
          postal_code?: string | null
          promo_tags?: string[] | null
          published_at?: string | null
          region?: string | null
          secured_payment?: boolean | null
          shipping_methods?: string[] | null
          status?: string
          subcategory?: string | null
          title: string
          url: string
        }
        Update: {
          ad_type?: string | null
          category?: string | null
          city?: string | null
          condition?: string | null
          content_hash?: string | null
          delivery_possible?: boolean | null
          description?: string | null
          first_seen_at?: string
          id?: number
          last_seen_at?: string
          list_hash?: string | null
          location_raw?: string | null
          model_confidence?: number | null
          model_id?: number | null
          platform?: string
          platform_ad_id?: string
          postal_code?: string | null
          promo_tags?: string[] | null
          published_at?: string | null
          region?: string | null
          secured_payment?: boolean | null
          shipping_methods?: string[] | null
          status?: string
          subcategory?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "hardware_models"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_logs: {
        Row: {
          created_at: string
          delta: number
          id: number
          job_id: number | null
          meta: Json | null
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: number
          job_id?: number | null
          meta?: Json | null
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: number
          job_id?: number | null
          meta?: Json | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_credit_logs_job_id"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      external_fetch_runs: {
        Row: {
          ended_at: string | null
          id: number
          payload_hash: string | null
          request_meta: Json | null
          response_meta: Json | null
          source_id: number
          started_at: string
          status: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: number
          payload_hash?: string | null
          request_meta?: Json | null
          response_meta?: Json | null
          source_id: number
          started_at?: string
          status?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: number
          payload_hash?: string | null
          request_meta?: Json | null
          response_meta?: Json | null
          source_id?: number
          started_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_fetch_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "external_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      external_model_specs: {
        Row: {
          fetched_at: string
          id: number
          model_id: number
          payload_json: Json | null
          source_id: number
        }
        Insert: {
          fetched_at?: string
          id?: number
          model_id: number
          payload_json?: Json | null
          source_id: number
        }
        Update: {
          fetched_at?: string
          id?: number
          model_id?: number
          payload_json?: Json | null
          source_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "external_model_specs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "hardware_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_model_specs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "external_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      external_series: {
        Row: {
          id: number
          series_key: string
          source_id: number
          ts: string
          value_json: Json | null
          value_numeric: number | null
        }
        Insert: {
          id?: number
          series_key: string
          source_id: number
          ts: string
          value_json?: Json | null
          value_numeric?: number | null
        }
        Update: {
          id?: number
          series_key?: string
          source_id?: number
          ts?: string
          value_json?: Json | null
          value_numeric?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "external_series_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "external_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      external_sources: {
        Row: {
          base_url: string | null
          created_at: string
          enabled: boolean | null
          id: number
          name: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string
          enabled?: boolean | null
          id?: number
          name: string
        }
        Update: {
          base_url?: string | null
          created_at?: string
          enabled?: boolean | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      hardware_categories: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      hardware_model_specs: {
        Row: {
          bus_width_bit: number | null
          chip: string | null
          id: number
          memory_type: string | null
          model_id: number
          outputs_count: number | null
          release_date: string | null
          specs_json: Json | null
          tdp_w: number | null
          updated_at: string
          vram_gb: number | null
        }
        Insert: {
          bus_width_bit?: number | null
          chip?: string | null
          id?: number
          memory_type?: string | null
          model_id: number
          outputs_count?: number | null
          release_date?: string | null
          specs_json?: Json | null
          tdp_w?: number | null
          updated_at?: string
          vram_gb?: number | null
        }
        Update: {
          bus_width_bit?: number | null
          chip?: string | null
          id?: number
          memory_type?: string | null
          model_id?: number
          outputs_count?: number | null
          release_date?: string | null
          specs_json?: Json | null
          tdp_w?: number | null
          updated_at?: string
          vram_gb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hardware_model_specs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: true
            referencedRelation: "hardware_models"
            referencedColumns: ["id"]
          },
        ]
      }
      hardware_models: {
        Row: {
          aliases: string[] | null
          brand: string
          category_id: number
          created_at: string
          family: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          aliases?: string[] | null
          brand: string
          category_id: number
          created_at?: string
          family?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          aliases?: string[] | null
          brand?: string
          category_id?: number
          created_at?: string
          family?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hardware_models_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "hardware_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_batches: {
        Row: {
          batch_seq: number
          id: number
          items_count: number
          job_id: number
          latency_ms: number | null
          notes: string | null
          received_at: string
        }
        Insert: {
          batch_seq: number
          id?: number
          items_count?: number
          job_id: number
          latency_ms?: number | null
          notes?: string | null
          received_at?: string
        }
        Update: {
          batch_seq?: number
          id?: number
          items_count?: number
          job_id?: number
          latency_ms?: number | null
          notes?: string | null
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingest_batches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_raw: {
        Row: {
          id: number
          item_seq: number
          job_id: number
          payload_json: Json
          received_at: string
        }
        Insert: {
          id?: number
          item_seq: number
          job_id: number
          payload_json: Json
          received_at?: string
        }
        Update: {
          id?: number
          item_seq?: number
          job_id?: number
          payload_json?: Json
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingest_raw_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_shards: {
        Row: {
          id: number
          job_id: number
          price_max: number | null
          price_min: number | null
          region_code: string | null
          shard_from: number | null
          shard_kind: string
          shard_to: number | null
        }
        Insert: {
          id?: number
          job_id: number
          price_max?: number | null
          price_min?: number | null
          region_code?: string | null
          shard_from?: number | null
          shard_kind: string
          shard_to?: number | null
        }
        Update: {
          id?: number
          job_id?: number
          price_max?: number | null
          price_min?: number | null
          region_code?: string | null
          shard_from?: number | null
          shard_kind?: string
          shard_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_shards_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ads_found: number | null
          created_at: string
          ended_at: string | null
          error_message: string | null
          filters_json: Json | null
          id: number
          keyword: string
          pages_scanned: number | null
          pages_target: number | null
          platform: string
          shard_strategy: string | null
          started_at: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          ads_found?: number | null
          created_at?: string
          ended_at?: string | null
          error_message?: string | null
          filters_json?: Json | null
          id?: number
          keyword: string
          pages_scanned?: number | null
          pages_target?: number | null
          platform?: string
          shard_strategy?: string | null
          started_at?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          ads_found?: number | null
          created_at?: string
          ended_at?: string | null
          error_message?: string | null
          filters_json?: Json | null
          id?: number
          keyword?: string
          pages_scanned?: number | null
          pages_target?: number | null
          platform?: string
          shard_strategy?: string | null
          started_at?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      model_daily_metrics: {
        Row: {
          ads_count: number | null
          date: string
          disappeared_ads: number | null
          fair_value_30d: number | null
          id: number
          median_days_to_sell: number | null
          model_id: number
          new_ads: number | null
          price_median: number | null
          price_p25: number | null
          price_p75: number | null
          updated_at: string
          var_30d_pct: number | null
          var_7d_pct: number | null
          var_90d_pct: number | null
        }
        Insert: {
          ads_count?: number | null
          date: string
          disappeared_ads?: number | null
          fair_value_30d?: number | null
          id?: number
          median_days_to_sell?: number | null
          model_id: number
          new_ads?: number | null
          price_median?: number | null
          price_p25?: number | null
          price_p75?: number | null
          updated_at?: string
          var_30d_pct?: number | null
          var_7d_pct?: number | null
          var_90d_pct?: number | null
        }
        Update: {
          ads_count?: number | null
          date?: string
          disappeared_ads?: number | null
          fair_value_30d?: number | null
          id?: number
          median_days_to_sell?: number | null
          model_id?: number
          new_ads?: number | null
          price_median?: number | null
          price_p25?: number | null
          price_p75?: number | null
          updated_at?: string
          var_30d_pct?: number | null
          var_7d_pct?: number | null
          var_90d_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "model_daily_metrics_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "hardware_models"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          discord_id: string | null
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          discord_id?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          discord_id?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scrape_policies: {
        Row: {
          id: number
          list_only_pages_max: number
          max_comm_jobs_per_day: number
          max_delay_item_ms: number
          max_delay_page_ms: number
          min_cooldown_minutes: number
          min_delay_item_ms: number
          min_delay_page_ms: number
          open_new_pages_max: number
          site: string
        }
        Insert: {
          id?: number
          list_only_pages_max?: number
          max_comm_jobs_per_day?: number
          max_delay_item_ms?: number
          max_delay_page_ms?: number
          min_cooldown_minutes?: number
          min_delay_item_ms?: number
          min_delay_page_ms?: number
          open_new_pages_max?: number
          site: string
        }
        Update: {
          id?: number
          list_only_pages_max?: number
          max_comm_jobs_per_day?: number
          max_delay_item_ms?: number
          max_delay_page_ms?: number
          min_cooldown_minutes?: number
          min_delay_item_ms?: number
          min_delay_page_ms?: number
          open_new_pages_max?: number
          site?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_months: number
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_months: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_months?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          context: Json | null
          created_at: string
          id: number
          level: string
          message: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: number
          level: string
          message: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: number
          level?: string
          message?: string
        }
        Relationships: []
      }
      user_action_logs: {
        Row: {
          action: string
          created_at: string
          id: number
          ip_address: unknown
          meta: Json | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          ip_address?: unknown
          meta?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          ip_address?: unknown
          meta?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_contributions: {
        Row: {
          ads_sent: number | null
          created_at: string
          credits_earned: number | null
          duration_sec: number | null
          ended_at: string | null
          id: number
          job_id: number
          pages_scanned: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          ads_sent?: number | null
          created_at?: string
          credits_earned?: number | null
          duration_sec?: number | null
          ended_at?: string | null
          id?: number
          job_id: number
          pages_scanned?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          ads_sent?: number | null
          created_at?: string
          credits_earned?: number | null
          duration_sec?: number | null
          ended_at?: string | null
          id?: number
          job_id?: number
          pages_scanned?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_contributions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_limits: {
        Row: {
          comm_jobs_used: number
          date: string
          id: number
          jobs_used: number
          user_id: string
        }
        Insert: {
          comm_jobs_used?: number
          date?: string
          id?: number
          jobs_used?: number
          user_id: string
        }
        Update: {
          comm_jobs_used?: number
          date?: string
          id?: number
          jobs_used?: number
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
      user_subscriptions: {
        Row: {
          billing_cycle: string | null
          checkout_ref: string | null
          created_at: string
          credits_remaining: number | null
          credits_reset_date: string | null
          expires_at: string | null
          id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          checkout_ref?: string | null
          created_at?: string
          credits_remaining?: number | null
          credits_reset_date?: string | null
          expires_at?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          checkout_ref?: string | null
          created_at?: string
          credits_remaining?: number | null
          credits_reset_date?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      reset_user_credits: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
