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
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
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
      catalog_products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          cost_cop: number | null
          created_at: string
          description: string | null
          features: string[] | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_active: boolean
          is_featured: boolean
          is_offer: boolean
          long_description: string | null
          name: string
          original_price_cop: number | null
          original_price_usd: number | null
          pdf_urls: Json | null
          price_cop: number
          price_usd: number | null
          product_type: string
          sku: string | null
          slug: string
          sort_order: number
          specifications: Json | null
          stock: number
          updated_at: string
          video_urls: string[] | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          cost_cop?: number | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          is_offer?: boolean
          long_description?: string | null
          name: string
          original_price_cop?: number | null
          original_price_usd?: number | null
          pdf_urls?: Json | null
          price_cop?: number
          price_usd?: number | null
          product_type?: string
          sku?: string | null
          slug: string
          sort_order?: number
          specifications?: Json | null
          stock?: number
          updated_at?: string
          video_urls?: string[] | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          cost_cop?: number | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          is_offer?: boolean
          long_description?: string | null
          name?: string
          original_price_cop?: number | null
          original_price_usd?: number | null
          pdf_urls?: Json | null
          price_cop?: number
          price_usd?: number | null
          product_type?: string
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
      client_tickets: {
        Row: {
          admin_response: string | null
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
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
      leads_trials: {
        Row: {
          business_name: string
          business_type: string | null
          city: string | null
          contact_name: string
          created_at: string
          email: string
          id: string
          notes: string | null
          phone: string
          source: string | null
          status: string
          trial_ends_at: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          business_name: string
          business_type?: string | null
          city?: string | null
          contact_name: string
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          phone: string
          source?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          business_name?: string
          business_type?: string | null
          city?: string | null
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          phone?: string
          source?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      licenses: {
        Row: {
          business_name: string
          business_nit: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          created_by_reseller_id: string | null
          expires_at: string | null
          id: string
          license_key: string
          notes: string | null
          plan_type: string
          price_paid: number
          rut_url: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          business_name: string
          business_nit?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          created_by_reseller_id?: string | null
          expires_at?: string | null
          id?: string
          license_key?: string
          notes?: string | null
          plan_type: string
          price_paid?: number
          rut_url?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_name?: string
          business_nit?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          created_by_reseller_id?: string | null
          expires_at?: string | null
          id?: string
          license_key?: string
          notes?: string | null
          plan_type?: string
          price_paid?: number
          rut_url?: string | null
          start_date?: string
          status?: string
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
        ]
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
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          created_at: string
          description: string
          id: string
          priority: string
          reseller_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          reseller_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          reseller_id?: string
          status?: string
          subject?: string
          updated_at?: string
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
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
