import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Heart, MessageCircle, Share, MoveHorizontal as MoreHorizontal, UserPlus, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { reviewService, Review } from '@/services/reviewService';
import CommentsModal from '@/components/CommentsModal';
import { useEffect } from 'react';

export default function SocialScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedReviewTitle, setSelectedReviewTitle] = useState<string>('');
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecentReviews();
  }, []);

  const loadRecentReviews = async () => {
    setLoading(true);
    try {
      const recentReviews = await reviewService.getRecentReviews(20);
      setReviews(recentReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLike = async (reviewId: string) => {
    triggerHaptic();
    
    try {
      const isLiked = await reviewService.toggleReviewLike(reviewId);
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? {
              ...review,
              like_count: isLiked ? review.like_count + 1 : review.like_count - 1,
            }
          : review
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleComments = (reviewId: string, reviewTitle: string) => {
    setSelectedReviewId(reviewId);
    setSelectedReviewTitle(reviewTitle);
    setCommentsModalVisible(true);
    triggerHaptic();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={styles.star}>
        {i < rating ? '⭐' : '☆'}
      </Text>
    ));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading social feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.gradient}>
        
        {/* Floating Header */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, -10],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Social</Text>
            <TouchableOpacity style={styles.addFriendsButton}>
              <UserPlus size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>See what your friends are reviewing</Text>
        </Animated.View>

        {/* Stories-style Activity Bar */}
        <View style={styles.storiesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesScroll}>
            
            {/* Your Story */}
            <TouchableOpacity style={styles.storyItem}>
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.storyBorder}>
                <View style={styles.storyAvatar}>
                  <Text style={styles.storyAvatarText}>📸</Text>
                </View>
              </LinearGradient>
              <Text style={styles.storyLabel}>Your Story</Text>
            </TouchableOpacity>

            {/* Friend Stories */}
            {['Alex', 'Jamie', 'Sam', 'Taylor', 'Casey'].map((name, index) => (
              <TouchableOpacity key={name} style={styles.storyItem}>
                <View style={[
                  styles.storyBorder,
                  { backgroundColor: index % 2 === 0 ? '#4ECDC4' : '#45B7D1' }
                ]}>
                  <View style={styles.storyAvatar}>
                    <Text style={styles.storyAvatarText}>
                      {['🎨', '🎭', '🎪', '🎨', '🎯'][index]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.storyLabel}>{name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Social Feed */}
        <Animated.ScrollView
          style={styles.feed}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}>
          
          {reviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Heart size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptyDescription}>
                Start following other critics to see their reviews here!
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
            <View key={review.id} style={styles.postContainer}>
              <BlurView intensity={15} style={styles.post}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatar}>
                        {review.profiles?.display_name?.charAt(0) || '?'}
                      </Text>
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{review.profiles?.level || 1}</Text>
                      </View>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>
                        {review.profiles?.display_name || 'Unknown User'}
                      </Text>
                      <Text style={styles.userHandle}>
                        @{review.profiles?.username || 'unknown'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.postMeta}>
                    <Text style={styles.timeAgo}>
                      {formatTimeAgo(review.created_at)}
                    </Text>
                    <TouchableOpacity style={styles.moreButton}>
                      <MoreHorizontal size={16} color="#888" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Review Content */}
                <View style={styles.reviewContent}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewTitle}>
                      {review.content_items?.title || 'Unknown Content'}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {review.content_items?.categories?.name || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.ratingContainer}>
                    {renderStars(review.rating)}
                    <Text style={styles.ratingText}>{review.rating}/5</Text>
                  </View>
                  
                  {review.title && (
                    <Text style={styles.reviewTitleText}>{review.title}</Text>
                  )}
                  {review.content && (
                    <Text style={styles.reviewText}>{review.content}</Text>
                  )}
                </View>

                {/* Engagement Actions */}
                <View style={styles.engagementContainer}>
                  <TouchableOpacity
                    style={styles.engagementButton}
                    onPress={() => handleLike(review.id)}>
                    <Heart
                      size={20}
                      color="#888"
                      fill="transparent"
                    />
                    <Text style={styles.engagementText}>
                      {review.like_count}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.engagementButton}
                    onPress={() => handleComments(
                      review.id, 
                      review.title || review.content_items?.title || 'Review'
                    )}>
                    <MessageCircle size={20} color="#888" />
                    <Text style={styles.engagementText}>{review.comment_count}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.engagementButton}>
                    <Share size={20} color="#888" />
                    <Text style={styles.engagementText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.boostButton}>
                    <Zap size={16} color="#FFD700" />
                    <Text style={styles.boostText}>Boost</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          ))
          )}
        </Animated.ScrollView>

        {/* Comments Modal */}
        <CommentsModal
          visible={commentsModalVisible}
          onClose={() => setCommentsModalVisible(false)}
          reviewId={selectedReviewId}
          reviewTitle={selectedReviewTitle}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  addFriendsButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  storiesContainer: {
    paddingVertical: 20,
  },
  storiesScroll: {
    paddingHorizontal: 20,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  storyBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarText: {
    fontSize: 24,
  },
  storyLabel: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  feed: {
    flex: 1,
  },
  postContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  post: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
    width: 50,
    height: 50,
    textAlign: 'center',
    lineHeight: 50,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 25,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  userHandle: {
    fontSize: 14,
    color: '#888',
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  moreButton: {
    padding: 4,
  },
  reviewContent: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(76, 205, 196, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
    marginLeft: 8,
  },
  reviewTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  engagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  engagementTextActive: {
    color: '#FF6B6B',
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  boostText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },
});