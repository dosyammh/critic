import { supabase } from '@/lib/supabase';

interface UserStats {
  xp_points: number;
  level: number;
  review_count: number;
  current_streak: number;
  longest_streak: number;
}

class GamificationService {
  // XP calculation based on different actions
  private XP_VALUES = {
    FIRST_REVIEW: 100,
    WRITE_REVIEW: 25,
    RECEIVE_LIKE: 5,
    DAILY_STREAK: 10,
    WEEKLY_STREAK: 50,
    FOLLOW_USER: 5,
    GET_FOLLOWER: 10,
  };

  // Level calculation (exponential growth)
  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private calculateXPForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }

  // Award XP for various actions
  async awardXP(userId: string, action: keyof typeof this.XP_VALUES, amount?: number) {
    try {
      const xpToAward = amount || this.XP_VALUES[action];
      
      // Get current user stats
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('xp_points, level, review_count')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newXP = profile.xp_points + xpToAward;
      const newLevel = this.calculateLevel(newXP);
      const leveledUp = newLevel > profile.level;

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          xp_points: newXP,
          level: newLevel,
          ...(action === 'WRITE_REVIEW' && { review_count: profile.review_count + 1 }),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Check for achievement unlocks
      await this.checkAchievements(userId);

      return {
        xpAwarded: xpToAward,
        newXP,
        newLevel,
        leveledUp,
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }

  // Update streak when user reviews
  async updateStreak(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const newStreak = profile.current_streak + 1;
      const newLongestStreak = Math.max(newStreak, profile.longest_streak);

      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
        })
        .eq('id', userId);

      // Award streak XP
      if (newStreak === 7) {
        await this.awardXP(userId, 'WEEKLY_STREAK');
      } else {
        await this.awardXP(userId, 'DAILY_STREAK');
      }

      return { currentStreak: newStreak, longestStreak: newLongestStreak };
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  // Check and unlock achievements
  async checkAchievements(userId: string) {
    try {
      // Get user stats
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get available achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');

      if (achievementsError) throw achievementsError;

      // Get user's current achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id, completed')
        .eq('user_id', userId);

      if (userAchievementsError) throw userAchievementsError;

      const completedAchievementIds = userAchievements
        .filter(ua => ua.completed)
        .map(ua => ua.achievement_id);

      // Check each achievement
      for (const achievement of achievements) {
        if (completedAchievementIds.includes(achievement.id)) continue;

        let shouldUnlock = false;
        let progress = 0;

        switch (achievement.requirement_type) {
          case 'review_count':
            progress = profile.review_count;
            shouldUnlock = profile.review_count >= achievement.requirement_value;
            break;
          case 'streak':
            progress = profile.current_streak;
            shouldUnlock = profile.current_streak >= achievement.requirement_value;
            break;
          case 'follower_count':
            progress = profile.follower_count;
            shouldUnlock = profile.follower_count >= achievement.requirement_value;
            break;
          case 'following_count':
            progress = profile.following_count;
            shouldUnlock = profile.following_count >= achievement.requirement_value;
            break;
        }

        // Update or create user achievement record
        await supabase
          .from('user_achievements')
          .upsert({
            user_id: userId,
            achievement_id: achievement.id,
            progress,
            completed: shouldUnlock,
            unlocked_at: shouldUnlock ? new Date().toISOString() : undefined,
          });

        // Award XP if unlocked
        if (shouldUnlock) {
          await this.awardXP(userId, 'WRITE_REVIEW', achievement.xp_reward);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Get user leaderboard position
  async getLeaderboardPosition(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, xp_points')
        .order('xp_points', { ascending: false });

      if (error) throw error;

      const position = data.findIndex(profile => profile.id === userId) + 1;
      return position;
    } catch (error) {
      console.error('Error getting leaderboard position:', error);
      return null;
    }
  }

  // Get trending content based on recent reviews
  async getTrendingContent(period: 'today' | 'week' | 'month' | 'all' = 'week') {
    try {
      let dateFilter = '';
      const now = new Date();
      
      switch (period) {
        case 'today':
          dateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case 'week':
          dateFilter = new Date(now.setDate(now.getDate() - 7)).toISOString();
          break;
        case 'month':
          dateFilter = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
          break;
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          content_item_id,
          content_items (
            title,
            description,
            image_url,
            api_source,
            categories (name)
          )
        `)
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by content item and calculate trending metrics
      const contentMap = new Map();
      
      data.forEach(review => {
        const contentId = review.content_item_id;
        if (!contentMap.has(contentId)) {
          contentMap.set(contentId, {
            ...review.content_items,
            reviewCount: 0,
            category: review.content_items.categories?.name || 'Unknown',
          });
        }
        contentMap.get(contentId).reviewCount++;
      });

      return Array.from(contentMap.values())
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 20);
    } catch (error) {
      console.error('Error getting trending content:', error);
      return [];
    }
  }
}

export const gamificationService = new GamificationService();