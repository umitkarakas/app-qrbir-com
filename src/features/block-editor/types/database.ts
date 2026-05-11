export type Json = unknown;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'pro' | 'business';
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'pro' | 'business';
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'pro' | 'business';
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      sites: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          title: string;
          description: string | null;
          site_type: 'digital_menu' | 'digital_invitation' | 'bio_link';
          theme: Json;
          theme_id: string | null;
          settings: Json;
          favicon_url: string | null;
          og_image_url: string | null;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          title: string;
          description?: string | null;
          site_type: 'digital_menu' | 'digital_invitation' | 'bio_link';
          theme?: Json;
          theme_id?: string | null;
          settings?: Json;
          favicon_url?: string | null;
          og_image_url?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          site_type?: 'digital_menu' | 'digital_invitation' | 'bio_link';
          theme?: Json;
          theme_id?: string | null;
          settings?: Json;
          favicon_url?: string | null;
          og_image_url?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      blocks: {
        Row: {
          id: string;
          site_id: string;
          block_type: string;
          position: number;
          content: Json;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          block_type: string;
          position?: number;
          content?: Json;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          block_type?: string;
          position?: number;
          content?: Json;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          site_id: string;
          style: Json;
          short_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          style?: Json;
          short_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          style?: Json;
          short_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      page_views: {
        Row: {
          id: string;
          site_id: string;
          visitor_id: string | null;
          source: 'qr_code' | 'direct' | 'referral' | 'social' | null;
          referrer: string | null;
          user_agent: string | null;
          device_type: 'mobile' | 'tablet' | 'desktop' | null;
          browser: string | null;
          os: string | null;
          country: string | null;
          city: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          visitor_id?: string | null;
          source?: 'qr_code' | 'direct' | 'referral' | 'social' | null;
          referrer?: string | null;
          user_agent?: string | null;
          device_type?: 'mobile' | 'tablet' | 'desktop' | null;
          browser?: string | null;
          os?: string | null;
          country?: string | null;
          city?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          visitor_id?: string | null;
          source?: 'qr_code' | 'direct' | 'referral' | 'social' | null;
          referrer?: string | null;
          user_agent?: string | null;
          device_type?: 'mobile' | 'tablet' | 'desktop' | null;
          browser?: string | null;
          os?: string | null;
          country?: string | null;
          city?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
      };
      block_interactions: {
        Row: {
          id: string;
          site_id: string;
          block_id: string;
          interaction_type: 'click' | 'view' | 'submit' | 'download';
          visitor_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          block_id: string;
          interaction_type: 'click' | 'view' | 'submit' | 'download';
          visitor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          block_id?: string;
          interaction_type?: 'click' | 'view' | 'submit' | 'download';
          visitor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      form_submissions: {
        Row: {
          id: string;
          site_id: string;
          block_id: string;
          form_type: 'rsvp' | 'contact' | 'custom';
          data: Json;
          status: 'new' | 'read' | 'archived';
          visitor_email: string | null;
          visitor_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          block_id: string;
          form_type: 'rsvp' | 'contact' | 'custom';
          data: Json;
          status?: 'new' | 'read' | 'archived';
          visitor_email?: string | null;
          visitor_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          site_id?: string;
          block_id?: string;
          form_type?: 'rsvp' | 'contact' | 'custom';
          data?: Json;
          status?: 'new' | 'read' | 'archived';
          visitor_email?: string | null;
          visitor_name?: string | null;
          created_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          description: string | null;
          site_type: 'digital_menu' | 'digital_invitation' | 'bio_link';
          thumbnail_url: string | null;
          theme: Json;
          theme_id: string | null;
          blocks: Json;
          settings: Json;
          metadata: Json;
          preview_info: Json;
          source_site_id: string | null;
          is_premium: boolean;
          is_active: boolean;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          site_type: 'digital_menu' | 'digital_invitation' | 'bio_link';
          thumbnail_url?: string | null;
          theme: Json;
          theme_id?: string | null;
          blocks: Json;
          settings?: Json;
          metadata?: Json;
          preview_info?: Json;
          source_site_id?: string | null;
          is_premium?: boolean;
          is_active?: boolean;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          description?: string | null;
          site_type?: 'digital_menu' | 'digital_invitation' | 'bio_link';
          thumbnail_url?: string | null;
          theme?: Json;
          theme_id?: string | null;
          blocks?: Json;
          settings?: Json;
          metadata?: Json;
          preview_info?: Json;
          source_site_id?: string | null;
          is_premium?: boolean;
          is_active?: boolean;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          description: string;
          style: 'flat' | 'neo-brutalism' | 'glassmorphism';
          is_premium: boolean;
          is_active: boolean;
          config: Json;
          preview_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          style: 'flat' | 'neo-brutalism' | 'glassmorphism';
          is_premium?: boolean;
          is_active?: boolean;
          config: Json;
          preview_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          style?: 'flat' | 'neo-brutalism' | 'glassmorphism';
          is_premium?: boolean;
          is_active?: boolean;
          config?: Json;
          preview_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_site_analytics: {
        Args: {
          p_site_id: string;
          p_start_date: string;
          p_end_date: string;
        };
        Returns: {
          total_views: number;
          unique_visitors: number;
          qr_scans: number;
          direct_visits: number;
          mobile_views: number;
          desktop_views: number;
        }[];
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Site = Database['public']['Tables']['sites']['Row'];
export type Block = Database['public']['Tables']['blocks']['Row'];
export type QRCode = Database['public']['Tables']['qr_codes']['Row'];
export type PageView = Database['public']['Tables']['page_views']['Row'];
export type BlockInteraction = Database['public']['Tables']['block_interactions']['Row'];
export type FormSubmission = Database['public']['Tables']['form_submissions']['Row'];
export type Template = Database['public']['Tables']['templates']['Row'];
export type Theme = Database['public']['Tables']['themes']['Row'];

export type SiteType = 'digital_menu' | 'digital_invitation' | 'bio_link';
export type ThemeStyle = 'flat' | 'neo-brutalism' | 'glassmorphism';
