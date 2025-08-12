import { supabase } from '@/lib/supabase';
import { apiService, ContentItem } from './apiService';

export interface Review {
  id: string;
  user_id: string;
  content_item_id: string;
  rating: number;
  title?: string;
  content?: string;
  is_spoiler: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url?: string;
    level: number;
  };
  content_items?: {
    title: string;
    description: string;
    image_url: string;
    category_id: string;
    categories?: {
      name: string;
      icon: string;
      color: string;
    };
  };
}

export interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  like_count: number;
  created_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url?: string;
    level: number;
  };
}

class ReviewService {
  // Create or get content item from external API data
  async createOrGetContentItem(contentData: ContentItem): Promise<string> {
    try {
      // First, try to find existing content item
      const { data: existingItem, error: findError } = await supabase
        .from('content_items')
        .select('id')
        .eq('external_id', contentData.id)
        .eq('api_source', contentData.source)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existingItem) {
        return existingItem.id;
      }

      // Get category ID
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', contentData.category)
        .single();

      if (categoryError) {
        throw categoryError;
      }

      // Create new content item
      const { data: newItem, error: createError } = await supabase
        .from('content_items')
        .insert({
          external_id: contentData.id,
          category_id: category.id,
          title: contentData.title,
          description: contentData.description,
          image_url: contentData.image,
          additional_data: contentData.additionalData || {},
          api_source: contentData.source,
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }

      return newItem.id;
    } catch (error) {
      console.error('Error creating/getting content item:', error);
      throw error;
    }
  }

  // Create a new review
  async createReview(
    contentData: ContentItem,
    rating: number,
    title?: string,
    content?: string,
    isSpoiler: boolean = false
  ): Promise<Review> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create or get content item
      const contentItemId = await this.createOrGetContentItem(contentData);

      // Create review
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          content_item_id: contentItemId,
          rating,
          title,
          content,
          is_spoiler: isSpoiler,
        })
        .select(`
          *,
          profiles (username, display_name, avatar_url, level),
          content_items (
            title,
            description,
            image_url,
            category_id,
            categories (name, icon, color)
          )
        `)
        .single();

      if (reviewError) {
        throw reviewError;
      }

      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Get reviews for a specific content item
  async getReviewsForContent(contentItemId: string, limit: number = 20): Promise<Review[]> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (username, display_name, avatar_url, level),
          content_items (
            title,
            description,
            image_url,
            category_id,
            categories (name, icon, color)
          )
        `)
        .eq('content_item_id', contentItemId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return reviews || [];
    } catch (error) {
      console.error('Error fetching reviews for content:', error);
      return [];
    }
  }

  // Get user's reviews
  async getUserReviews(userId: string, limit: number = 20): Promise<Review[]> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (username, display_name, avatar_url, level),
          content_items (
            title,
            description,
            image_url,
            category_id,
            categories (name, icon, color)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return reviews || [];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }

  // Get recent reviews for social feed
  async getRecentReviews(limit: number = 20): Promise<Review[]> {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (username, display_name, avatar_url, level),
          content_items (
            title,
            description,
            image_url,
            category_id,
            categories (name, icon, color)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return reviews || [];
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
      return [];
    }
  }

  // Like/unlike a review
  async toggleReviewLike(reviewId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('review_likes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('review_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          throw deleteError;
        }

        return false; // Unliked
      } else {
        // Like
        const { error: insertError } = await supabase
          .from('review_likes')
          .insert({
            review_id: reviewId,
            user_id: user.id,
          });

        if (insertError) {
          throw insertError;
        }

        return true; // Liked
      }
    } catch (error) {
      console.error('Error toggling review like:', error);
      throw error;
    }
  }

  // Add comment to review
  async addComment(reviewId: string, content: string): Promise<Comment> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          content,
        })
        .select(`
          *,
          profiles (username, display_name, avatar_url, level)
        `)
        .single();

      if (commentError) {
        throw commentError;
      }

      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get comments for a review
  async getReviewComments(reviewId: string, limit: number = 50): Promise<Comment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (username, display_name, avatar_url, level)
        `)
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      return comments || [];
    } catch (error) {
      console.error('Error fetching review comments:', error);
      return [];
    }
  }

  // Delete review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Update review
  async updateReview(
    reviewId: string,
    updates: {
      rating?: number;
      title?: string;
      content?: string;
      is_spoiler?: boolean;
    }
  ): Promise<Review> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: review, error: updateError } = await supabase
        .from('reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select(`
          *,
          profiles (username, display_name, avatar_url, level),
          content_items (
            title,
            description,
            image_url,
            category_id,
            categories (name, icon, color)
          )
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      return review;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();