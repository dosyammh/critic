import { createClient } from '@supabase/supabase-js';

// Validate and provide proper fallback values
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTk1NzM0NTIwMH0.Hw6L0TUW7XmvdntGFBzSOjvK_5x1b9gQLulRuOXU_Ug';

// Validate URL format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid Supabase URL format. Must start with http:// or https://');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string;
          avatar_url: string;
          xp_points: number;
          level: number;
          review_count: number;
          follower_count: number;
          following_count: number;
          current_streak: number;
          longest_streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string;
          bio?: string;
          avatar_url?: string;
          xp_points?: number;
          level?: number;
          review_count?: number;
          follower_count?: number;
          following_count?: number;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          bio?: string;
          avatar_url?: string;
          xp_points?: number;
          level?: number;
          review_count?: number;
          follower_count?: number;
          following_count?: number;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          description: string;
          created_at: string;
        };
      };
      content_items: {
        Row: {
          id: string;
          external_id: string;
          category_id: string;
          title: string;
          description: string;
          image_url: string;
          additional_data: any;
          api_source: string;
          created_at: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          content_item_id: string;
          rating: number;
          title: string;
          content: string;
          is_spoiler: boolean;
          like_count: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};