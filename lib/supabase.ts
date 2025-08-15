import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTc2OTIwMCwiZXhwIjoxOTU3MzQ1MjAwfQ.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

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