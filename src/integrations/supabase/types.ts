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
      ai_conversations: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          is_lead_captured: boolean
          message_count: number
          session_id: string
          source_page: string | null
          updated_at: string
          user_id: string | null
          user_role: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          is_lead_captured?: boolean
          message_count?: number
          session_id: string
          source_page?: string | null
          updated_at?: string
          user_id?: string | null
          user_role?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          is_lead_captured?: boolean
          message_count?: number
          session_id?: string
          source_page?: string | null
          updated_at?: string
          user_id?: string | null
          user_role?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string
          entry_type: string
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          entry_type?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          entry_type?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_message_feedback: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          is_positive: boolean
          message_id: string
          user_comment: string | null
          user_role: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          is_positive: boolean
          message_id: string
          user_comment?: string | null
          user_role?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          is_positive?: boolean
          message_id?: string
          user_comment?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_message_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_message_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ai_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          corrected_at: string | null
          corrected_by: string | null
          corrected_content: string | null
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          corrected_at?: string | null
          corrected_by?: string | null
          corrected_content?: string | null
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          corrected_at?: string | null
          corrected_by?: string | null
          corrected_content?: string | null
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_scraping_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          entries_created: number | null
          error_message: string | null
          id: string
          pages_scraped: number | null
          started_at: string | null
          status: string
          url: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          entries_created?: number | null
          error_message?: string | null
          id?: string
          pages_scraped?: number | null
          started_at?: string | null
          status?: string
          url: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          entries_created?: number | null
          error_message?: string | null
          id?: string
          pages_scraped?: number | null
          started_at?: string | null
          status?: string
          url?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      approved_email_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_active: boolean
          is_default: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          business_name: string
          city: string | null
          created_at: string
          email: string | null
          id: string
          nit: string | null
          owner_user_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name: string
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nit?: string | null
          owner_user_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nit?: string | null
          owner_user_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      catalog_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      catalog_product_modules: {
        Row: {
          created_at: string
          id: string
          module_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_product_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "plan_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_product_modules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          availability: string | null
          brand_id: string | null
          brand_name: string | null
          category_id: string | null
          condition: string | null
          cost_cop: number | null
          created_at: string
          custom_label_0: string | null
          custom_label_1: string | null
          description: string | null
          features: string[] | null
          gallery_urls: string[] | null
          google_product_category: string | null
          gtin: string | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean
          is_featured: boolean
          is_offer: boolean
          long_description: string | null
          meta_description: string | null
          meta_title: string | null
          mpn: string | null
          name: string
          original_price_cop: number | null
          original_price_usd: number | null
          pdf_urls: Json | null
          price_cop: number
          price_usd: number | null
          product_type: string
          shipping_weight_kg: number | null
          sku: string | null
          slug: string
          sort_order: number
          specifications: Json | null
          stock: number
          updated_at: string
          video_urls: string[] | null
        }
        Insert: {
          availability?: string | null
          brand_id?: string | null
          brand_name?: string | null
          category_id?: string | null
          condition?: string | null
          cost_cop?: number | null
          created_at?: string
          custom_label_0?: string | null
          custom_label_1?: string | null
          description?: string | null
          features?: string[] | null
          gallery_urls?: string[] | null
          google_product_category?: string | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          is_offer?: boolean
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          mpn?: string | null
          name: string
          original_price_cop?: number | null
          original_price_usd?: number | null
          pdf_urls?: Json | null
          price_cop?: number
          price_usd?: number | null
          product_type?: string
          shipping_weight_kg?: number | null
          sku?: string | null
          slug: string
          sort_order?: number
          specifications?: Json | null
          stock?: number
          updated_at?: string
          video_urls?: string[] | null
        }
        Update: {
          availability?: string | null
          brand_id?: string | null
          brand_name?: string | null
          category_id?: string | null
          condition?: string | null
          cost_cop?: number | null
          created_at?: string
          custom_label_0?: string | null
          custom_label_1?: string | null
          description?: string | null
          features?: string[] | null
          gallery_urls?: string[] | null
          google_product_category?: string | null
          gtin?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          is_offer?: boolean
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          mpn?: string | null
          name?: string
          original_price_cop?: number | null
          original_price_usd?: number | null
          pdf_urls?: Json | null
          price_cop?: number
          price_usd?: number | null
          product_type?: string
          shipping_weight_kg?: number | null
          sku?: string | null
          slug?: string
          sort_order?: number
          specifications?: Json | null
          stock?: number
          updated_at?: string
          video_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "catalog_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_orders: {
        Row: {
          camara_comercio_url: string
          cedula_url: string
          created_at: string
          email: string
          full_name: string
          id: string
          nit: string
          notes: string | null
          phone: string
          plan: string
          price_cop: number
          rut_url: string
          soporte_pago_url: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          camara_comercio_url: string
          cedula_url: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          nit: string
          notes?: string | null
          phone: string
          plan: string
          price_cop: number
          rut_url: string
          soporte_pago_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          camara_comercio_url?: string
          cedula_url?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          nit?: string
          notes?: string | null
          phone?: string
          plan?: string
          price_cop?: number
          rut_url?: string
          soporte_pago_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          page_label: string
          page_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          page_label: string
          page_path: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          page_label?: string
          page_path?: string
        }
        Relationships: []
      }
      client_downloads: {
        Row: {
          category: string
          created_at: string
          description: string | null
          download_url: string
          file_type: string
          icon: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          download_url: string
          file_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          download_url?: string
          file_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_pos_sessions: {
        Row: {
          consent_given: boolean
          created_at: string
          id: string
          last_success_at: string
          pos_password_encrypted: string
          pos_store: string
          pos_username: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_given?: boolean
          created_at?: string
          id?: string
          last_success_at?: string
          pos_password_encrypted: string
          pos_store: string
          pos_username: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_given?: boolean
          created_at?: string
          id?: string
          last_success_at?: string
          pos_password_encrypted?: string
          pos_store?: string
          pos_username?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_tickets: {
        Row: {
          admin_response: string | null
          attachment_url: string | null
          created_at: string
          description: string
          id: string
          module: string | null
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
          video_url: string | null
          whatsapp: string | null
        }
        Insert: {
          admin_response?: string | null
          attachment_url?: string | null
          created_at?: string
          description: string
          id?: string
          module?: string | null
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
          video_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          admin_response?: string | null
          attachment_url?: string | null
          created_at?: string
          description?: string
          id?: string
          module?: string | null
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      contact_activities: {
        Row: {
          activity_type: string
          contact_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
        }
        Insert: {
          activity_type?: string
          contact_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
        }
        Update: {
          activity_type?: string
          contact_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          business_name: string | null
          business_type: string | null
          captured_by_ai: boolean
          city: string | null
          contact_type: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_read: boolean
          lead_id: string | null
          lead_score: number
          license_id: string | null
          notes: string | null
          phone: string | null
          pipeline_stage: string
          reseller_id: string | null
          source: string
          tags: string[] | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          captured_by_ai?: boolean
          city?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_read?: boolean
          lead_id?: string | null
          lead_score?: number
          license_id?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          reseller_id?: string | null
          source?: string
          tags?: string[] | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          captured_by_ai?: boolean
          city?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_read?: boolean
          lead_id?: string | null
          lead_score?: number
          license_id?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          reseller_id?: string | null
          source?: string
          tags?: string[] | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_trials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          business_id: string | null
          contract_type: string
          created_at: string
          expires_at: string | null
          id: string
          notes: string | null
          pdf_url: string | null
          signed_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          contract_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          pdf_url?: string | null
          signed_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          contract_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          pdf_url?: string | null
          signed_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      dian_articles: {
        Row: {
          cluster: string
          created_at: string
          cta_text: string
          cta_whatsapp_message: string
          faqs: Json
          h1: string
          hero_badge: string
          hero_icon: string
          hero_subtitle: string
          id: string
          is_published: boolean
          keyword: string
          meta_description: string
          meta_title: string
          pain_vs_solution: Json | null
          related_links: Json
          sections: Json
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          cluster?: string
          created_at?: string
          cta_text?: string
          cta_whatsapp_message?: string
          faqs?: Json
          h1: string
          hero_badge?: string
          hero_icon?: string
          hero_subtitle?: string
          id?: string
          is_published?: boolean
          keyword?: string
          meta_description?: string
          meta_title?: string
          pain_vs_solution?: Json | null
          related_links?: Json
          sections?: Json
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          cluster?: string
          created_at?: string
          cta_text?: string
          cta_whatsapp_message?: string
          faqs?: Json
          h1?: string
          hero_badge?: string
          hero_icon?: string
          hero_subtitle?: string
          id?: string
          is_published?: boolean
          keyword?: string
          meta_description?: string
          meta_title?: string
          pain_vs_solution?: Json | null
          related_links?: Json
          sections?: Json
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          discount_type: string
          discount_value: number
          discounted_price_cop: number
          expires_at: string
          id: string
          is_active: boolean
          lead_id: string | null
          original_price_cop: number
          plan_key: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          discounted_price_cop?: number
          expires_at: string
          id?: string
          is_active?: boolean
          lead_id?: string | null
          original_price_cop?: number
          plan_key: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          discounted_price_cop?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          lead_id?: string | null
          original_price_cop?: number
          plan_key?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_coupons_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_trials"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          page_slug: string | null
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_slug?: string | null
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_slug?: string | null
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      google_calendar_configs: {
        Row: {
          calendar_id: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_user_tokens: {
        Row: {
          access_token_encrypted: string
          created_at: string
          google_email: string | null
          id: string
          refresh_token_encrypted: string
          scopes: string[]
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string
          google_email?: string | null
          id?: string
          refresh_token_encrypted: string
          scopes?: string[]
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string
          google_email?: string | null
          id?: string
          refresh_token_encrypted?: string
          scopes?: string[]
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads_trials: {
        Row: {
          activation_completed_at: string | null
          activation_token: string | null
          assigned_email: string | null
          business_name: string
          business_type: string | null
          city: string | null
          contact_name: string
          converted_at: string | null
          country: string | null
          coupon_id: string | null
          created_at: string
          daily_sales: string | null
          email: string
          employee_count: string | null
          id: string
          ideal_pos_features: string | null
          knows_inventory: boolean | null
          main_pain: string | null
          notes: string | null
          phone: string
          pos_company: string | null
          pos_password: string | null
          pos_username: string | null
          requested_by_reseller_id: string | null
          short_name: string | null
          source: string | null
          status: string
          trial_ends_at: string | null
          updated_at: string
          urgency: string | null
          uses_software: boolean | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          activation_completed_at?: string | null
          activation_token?: string | null
          assigned_email?: string | null
          business_name: string
          business_type?: string | null
          city?: string | null
          contact_name: string
          converted_at?: string | null
          country?: string | null
          coupon_id?: string | null
          created_at?: string
          daily_sales?: string | null
          email: string
          employee_count?: string | null
          id?: string
          ideal_pos_features?: string | null
          knows_inventory?: boolean | null
          main_pain?: string | null
          notes?: string | null
          phone: string
          pos_company?: string | null
          pos_password?: string | null
          pos_username?: string | null
          requested_by_reseller_id?: string | null
          short_name?: string | null
          source?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          urgency?: string | null
          uses_software?: boolean | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          activation_completed_at?: string | null
          activation_token?: string | null
          assigned_email?: string | null
          business_name?: string
          business_type?: string | null
          city?: string | null
          contact_name?: string
          converted_at?: string | null
          country?: string | null
          coupon_id?: string | null
          created_at?: string
          daily_sales?: string | null
          email?: string
          employee_count?: string | null
          id?: string
          ideal_pos_features?: string | null
          knows_inventory?: boolean | null
          main_pain?: string | null
          notes?: string | null
          phone?: string
          pos_company?: string | null
          pos_password?: string | null
          pos_username?: string | null
          requested_by_reseller_id?: string | null
          short_name?: string | null
          source?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          urgency?: string | null
          uses_software?: boolean | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_trials_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "discount_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_trials_requested_by_reseller_id_fkey"
            columns: ["requested_by_reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      license_pos_users: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          last_verified_at: string | null
          license_id: string
          notes: string | null
          pos_password_encrypted: string
          pos_role: string
          pos_store: string
          pos_username: string
          registered_by: string | null
          updated_at: string
          user_email: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          license_id: string
          notes?: string | null
          pos_password_encrypted: string
          pos_role?: string
          pos_store: string
          pos_username: string
          registered_by?: string | null
          updated_at?: string
          user_email?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          license_id?: string
          notes?: string | null
          pos_password_encrypted?: string
          pos_role?: string
          pos_store?: string
          pos_username?: string
          registered_by?: string | null
          updated_at?: string
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_pos_users_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      license_pricing: {
        Row: {
          created_at: string
          facilpos_product_url: string | null
          id: string
          image_url: string | null
          implementation_price_cop: number
          is_annual: boolean
          last_synced_at: string | null
          official_price_cop: number
          plan_description: string | null
          plan_key: string
          plan_label: string
          selling_price_cop: number
          sort_order: number
          support_monthly_cop: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          facilpos_product_url?: string | null
          id?: string
          image_url?: string | null
          implementation_price_cop?: number
          is_annual?: boolean
          last_synced_at?: string | null
          official_price_cop?: number
          plan_description?: string | null
          plan_key: string
          plan_label: string
          selling_price_cop?: number
          sort_order?: number
          support_monthly_cop?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          facilpos_product_url?: string | null
          id?: string
          image_url?: string | null
          implementation_price_cop?: number
          is_annual?: boolean
          last_synced_at?: string | null
          official_price_cop?: number
          plan_description?: string | null
          plan_key?: string
          plan_label?: string
          selling_price_cop?: number
          sort_order?: number
          support_monthly_cop?: number
          updated_at?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          activation_requested_at: string | null
          business_name: string
          business_nit: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          created_by_reseller_id: string | null
          expires_at: string | null
          id: string
          lead_id: string | null
          license_key: string
          notes: string | null
          payment_proof_url: string | null
          plan_type: string
          price_paid: number
          provider_notes: string | null
          rut_url: string | null
          start_date: string
          status: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          activation_requested_at?: string | null
          business_name: string
          business_nit?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          created_by_reseller_id?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          license_key?: string
          notes?: string | null
          payment_proof_url?: string | null
          plan_type: string
          price_paid?: number
          provider_notes?: string | null
          rut_url?: string | null
          start_date?: string
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          activation_requested_at?: string | null
          business_name?: string
          business_nit?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          created_by_reseller_id?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string | null
          license_key?: string
          notes?: string | null
          payment_proof_url?: string | null
          plan_type?: string
          price_paid?: number
          provider_notes?: string | null
          rut_url?: string | null
          start_date?: string
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_created_by_reseller_id_fkey"
            columns: ["created_by_reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_trials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      misc_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          items: string[]
          label: string
          list_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          items?: string[]
          label: string
          list_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          items?: string[]
          label?: string
          list_key?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string
          href: string
          id: string
          is_active: boolean
          is_external: boolean
          label: string
          parent_id: string | null
          position: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          id?: string
          is_active?: boolean
          is_external?: boolean
          label: string
          parent_id?: string | null
          position?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          is_active?: boolean
          is_external?: boolean
          label?: string
          parent_id?: string | null
          position?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nav_items"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          type: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          type?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          type?: string
          used?: boolean
        }
        Relationships: []
      }
      page_seo_settings: {
        Row: {
          canonical_url: string | null
          changefreq: string | null
          created_at: string
          id: string
          json_ld: Json | null
          meta_description: string | null
          meta_title: string | null
          noindex: boolean | null
          notes: string | null
          og_image: string | null
          og_type: string | null
          page_label: string
          page_path: string
          priority: number | null
          robots: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          changefreq?: string | null
          created_at?: string
          id?: string
          json_ld?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean | null
          notes?: string | null
          og_image?: string | null
          og_type?: string | null
          page_label?: string
          page_path: string
          priority?: number | null
          robots?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          changefreq?: string | null
          created_at?: string
          id?: string
          json_ld?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean | null
          notes?: string | null
          og_image?: string | null
          og_type?: string | null
          page_label?: string
          page_path?: string
          priority?: number | null
          robots?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          certificate_order_id: string | null
          created_at: string
          id: string
          license_id: string | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          reference: string | null
          status: string
        }
        Insert: {
          amount: number
          certificate_order_id?: string | null
          created_at?: string
          id?: string
          license_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
        }
        Update: {
          amount?: number
          certificate_order_id?: string | null
          created_at?: string
          id?: string
          license_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_certificate_order_id_fkey"
            columns: ["certificate_order_id"]
            isOneToOne: false
            referencedRelation: "certificate_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_modules: {
        Row: {
          allowed_plan_keys: string[]
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          is_free: boolean
          is_included_in_plans: string[]
          max_cajas: Json | null
          max_usuarios: Json | null
          name: string
          price_cop: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          allowed_plan_keys?: string[]
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_free?: boolean
          is_included_in_plans?: string[]
          max_cajas?: Json | null
          max_usuarios?: Json | null
          name: string
          price_cop?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          allowed_plan_keys?: string[]
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_free?: boolean
          is_included_in_plans?: string[]
          max_cajas?: Json | null
          max_usuarios?: Json | null
          name?: string
          price_cop?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          product_id: string | null
          product_name: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          product_name: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          product_name?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_applications: {
        Row: {
          city: string
          created_at: string
          email: string
          experience_summary: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string
          pipeline_stage: string
          status: string
          updated_at: string
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          city: string
          created_at?: string
          email: string
          experience_summary?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          pipeline_stage?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          email?: string
          experience_summary?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          pipeline_stage?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      reseller_commission_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          period: string
          reseller_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          period: string
          reseller_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          period?: string
          reseller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_commission_payments_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_commissions: {
        Row: {
          commission_type: string
          commission_value: number
          created_at: string
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number | null
          product_type: string
          reseller_id: string
          updated_at: string
        }
        Insert: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          product_type: string
          reseller_id: string
          updated_at?: string
        }
        Update: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number | null
          product_type?: string
          reseller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_commissions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_funnel_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_url: string | null
          reseller_email: string
          reseller_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_url?: string | null
          reseller_email: string
          reseller_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_url?: string | null
          reseller_email?: string
          reseller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reseller_funnel_events_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_modules: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          module_key: string
          reseller_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          module_key: string
          reseller_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          module_key?: string
          reseller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_modules_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_tickets: {
        Row: {
          admin_response: string | null
          attachment_url: string | null
          created_at: string
          description: string
          id: string
          module: string | null
          priority: string
          reseller_id: string
          status: string
          subject: string
          updated_at: string
          video_url: string | null
          whatsapp: string | null
        }
        Insert: {
          admin_response?: string | null
          attachment_url?: string | null
          created_at?: string
          description: string
          id?: string
          module?: string | null
          priority?: string
          reseller_id: string
          status?: string
          subject: string
          updated_at?: string
          video_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          admin_response?: string | null
          attachment_url?: string | null
          created_at?: string
          description?: string
          id?: string
          module?: string | null
          priority?: string
          reseller_id?: string
          status?: string
          subject?: string
          updated_at?: string
          video_url?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reseller_tickets_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_trainings: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          sort_order: number | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          setting_group: string
          setting_key: string
          setting_value: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_group: string
          setting_key: string
          setting_value?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_group?: string
          setting_key?: string
          setting_value?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          business_name: string
          business_type: string
          challenge: string | null
          city: string | null
          contact_name: string | null
          contact_role: string | null
          created_at: string
          id: string
          image_url: string | null
          instagram_url: string | null
          is_featured: boolean
          is_published: boolean
          logo_url: string | null
          metrics: Json | null
          quote: string | null
          results: string | null
          slug: string
          social_links: Json | null
          solution: string | null
          sort_order: number
          tags: string[] | null
          tiktok_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          website_url: string | null
        }
        Insert: {
          business_name: string
          business_type: string
          challenge?: string | null
          city?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          logo_url?: string | null
          metrics?: Json | null
          quote?: string | null
          results?: string | null
          slug: string
          social_links?: Json | null
          solution?: string | null
          sort_order?: number
          tags?: string[] | null
          tiktok_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          website_url?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string
          challenge?: string | null
          city?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          logo_url?: string | null
          metrics?: Json | null
          quote?: string | null
          results?: string | null
          slug?: string
          social_links?: Json | null
          solution?: string | null
          sort_order?: number
          tags?: string[] | null
          tiktok_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          city: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          supplier_type: string
          updated_at: string
          website: string | null
          whatsapp_support: string | null
        }
        Insert: {
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          supplier_type?: string
          updated_at?: string
          website?: string | null
          whatsapp_support?: string | null
        }
        Update: {
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          supplier_type?: string
          updated_at?: string
          website?: string | null
          whatsapp_support?: string | null
        }
        Relationships: []
      }
      support_subscriptions: {
        Row: {
          billing_anchor_day: number | null
          business_id: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_method: string | null
          plan: string
          price_cop: number
          status: string
          target_audience: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_anchor_day?: number | null
          business_id?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan?: string
          price_cop?: number
          status?: string
          target_audience?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_anchor_day?: number | null
          business_id?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_method?: string | null
          plan?: string
          price_cop?: number
          status?: string
          target_audience?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          sender_id: string
          sender_role: string
          ticket_id: string
          ticket_source: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          sender_id: string
          sender_role?: string
          ticket_id: string
          ticket_source?: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_role?: string
          ticket_id?: string
          ticket_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "client_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_scripts: {
        Row: {
          code: string
          created_at: string
          id: string
          is_enabled: boolean
          name: string
          noscript_code: string | null
          placement: string
          script_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          name: string
          noscript_code?: string | null
          placement?: string
          script_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          name?: string
          noscript_code?: string | null
          placement?: string
          script_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      training_videos: {
        Row: {
          approval_status: string
          category: string
          created_at: string
          duration: string | null
          id: string
          is_active: boolean
          is_main: boolean
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
          video_type: string
          video_url: string
          view_count: number
          visible_to_customer: boolean
          visible_to_reseller: boolean
        }
        Insert: {
          approval_status?: string
          category?: string
          created_at?: string
          duration?: string | null
          id?: string
          is_active?: boolean
          is_main?: boolean
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
          video_type?: string
          video_url: string
          view_count?: number
          visible_to_customer?: boolean
          visible_to_reseller?: boolean
        }
        Update: {
          approval_status?: string
          category?: string
          created_at?: string
          duration?: string | null
          id?: string
          is_active?: boolean
          is_main?: boolean
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
          video_type?: string
          video_url?: string
          view_count?: number
          visible_to_customer?: boolean
          visible_to_reseller?: boolean
        }
        Relationships: []
      }
      user_access_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          portal: string
          user_email: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          portal: string
          user_email?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          portal?: string
          user_email?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      user_access_summary: {
        Row: {
          first_access_at: string | null
          id: string
          last_access_at: string | null
          last_portal: string | null
          total_access_count: number
          total_chatbot_interactions: number
          total_demos_requested: number
          total_licenses_activated: number
          total_tickets_created: number
          total_videos_watched: number
          updated_at: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          first_access_at?: string | null
          id?: string
          last_access_at?: string | null
          last_portal?: string | null
          total_access_count?: number
          total_chatbot_interactions?: number
          total_demos_requested?: number
          total_licenses_activated?: number
          total_tickets_created?: number
          total_videos_watched?: number
          updated_at?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          first_access_at?: string | null
          id?: string
          last_access_at?: string | null
          last_portal?: string | null
          total_access_count?: number
          total_chatbot_interactions?: number
          total_demos_requested?: number
          total_licenses_activated?: number
          total_tickets_created?: number
          total_videos_watched?: number
          updated_at?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
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
      whatsapp_notification_log: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          message_sent: string | null
          metadata: Json | null
          provider_name: string
          recipient_phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          message_sent?: string | null
          metadata?: Json | null
          provider_name: string
          recipient_phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          message_sent?: string | null
          metadata?: Json | null
          provider_name?: string
          recipient_phone?: string | null
          status?: string
        }
        Relationships: []
      }
      whatsapp_providers: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          notes: string | null
          provider_type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          notes?: string | null
          provider_type?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          notes?: string | null
          provider_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          created_at: string
          emoji: string
          event_label: string
          event_type: string
          id: string
          is_active: boolean
          notes: string | null
          provider_name: string | null
          sort_order: number
          template_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          event_label: string
          event_type: string
          id?: string
          is_active?: boolean
          notes?: string | null
          provider_name?: string | null
          sort_order?: number
          template_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          event_label?: string
          event_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          provider_name?: string | null
          sort_order?: number
          template_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      wompi_transactions: {
        Row: {
          amount_cents: number
          cart_quote_id: string | null
          certificate_order_id: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          payment_method: string | null
          reference: string
          status: string
          updated_at: string
          wompi_id: string | null
          wompi_response: Json
        }
        Insert: {
          amount_cents: number
          cart_quote_id?: string | null
          certificate_order_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          metadata?: Json
          payment_method?: string | null
          reference: string
          status?: string
          updated_at?: string
          wompi_id?: string | null
          wompi_response?: Json
        }
        Update: {
          amount_cents?: number
          cart_quote_id?: string | null
          certificate_order_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          metadata?: Json
          payment_method?: string | null
          reference?: string
          status?: string
          updated_at?: string
          wompi_id?: string | null
          wompi_response?: Json
        }
        Relationships: [
          {
            foreignKeyName: "wompi_transactions_certificate_order_id_fkey"
            columns: ["certificate_order_id"]
            isOneToOne: false
            referencedRelation: "certificate_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_pos_user: { Args: { _id: string }; Returns: undefined }
      get_all_pos_users: {
        Args: never
        Returns: {
          business_name: string
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          last_verified_at: string
          license_id: string
          license_key: string
          notes: string
          pos_password: string
          pos_role: string
          pos_store: string
          pos_username: string
          user_email: string
        }[]
      }
      get_client_pos_sessions: {
        Args: { _user_id: string }
        Returns: {
          id: string
          last_success_at: string
          pos_password: string
          pos_store: string
          pos_username: string
        }[]
      }
      get_google_tokens: {
        Args: { _user_id: string }
        Returns: {
          access_token: string
          google_email: string
          refresh_token: string
          scopes: string[]
          token_expires_at: string
        }[]
      }
      get_pos_users_for_license: {
        Args: { _license_id: string }
        Returns: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          last_verified_at: string
          license_id: string
          notes: string
          pos_password: string
          pos_role: string
          pos_store: string
          pos_username: string
          user_email: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_video_view: { Args: { video_id: string }; Returns: undefined }
      insert_pos_user: {
        Args: {
          _display_name?: string
          _license_id: string
          _notes?: string
          _pos_password: string
          _pos_role?: string
          _pos_store: string
          _pos_username: string
          _registered_by?: string
          _user_email?: string
        }
        Returns: string
      }
      link_reseller_on_login: {
        Args: { _user_email: string; _user_id: string }
        Returns: Json
      }
      update_pos_user: {
        Args: {
          _display_name?: string
          _id: string
          _is_active?: boolean
          _notes?: string
          _pos_password?: string
          _pos_role?: string
          _pos_store?: string
          _pos_username?: string
          _user_email?: string
        }
        Returns: undefined
      }
      upsert_client_pos_session: {
        Args: {
          _pos_password: string
          _pos_store: string
          _pos_username: string
          _user_id: string
        }
        Returns: string
      }
      upsert_google_tokens: {
        Args: {
          _access_token: string
          _expires_at: string
          _google_email?: string
          _refresh_token: string
          _scopes: string[]
          _user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "reseller"
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
      app_role: ["admin", "customer", "reseller"],
    },
  },
} as const
