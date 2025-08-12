import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Star, ThumbsUp, ThumbsDown, RotateCcw, PenTool } from 'lucide-react-native';
import { apiService, ContentItem } from '@/services/apiService';
import SwipeableCard from '@/components/SwipeableCard';
import ReviewModal from '@/components/ReviewModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DiscoverScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [pan] = useState(new Animated.ValueXY());
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    loadRandomContent();
  }, []);

  const loadRandomContent = async () => {
    setLoading(true);
    try {
      // Load content from different sources
      const searches = [
        'popular movies',
        'best books',
        'trending music',
        'science',
        'technology',
        'history',
      ];
      
      const randomSearch = searches[Math.floor(Math.random() * searches.length)];
      const content = await apiService.searchAll(randomSearch);
      
      if (content.length > 0) {
        setCards(content);
        setCurrentIndex(0);
      } else {
        // Fallback to mock data if API fails
        setCards(getMockContent());
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setCards(getMockContent());
    } finally {
      setLoading(false);
    }
  };

  const getMockContent = (): ContentItem[] => [
    {
      id: '1',
      title: 'The Shawshank Redemption',
      description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      image: 'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
      category: 'Movies',
      source: 'tmdb',
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
      image: 'https://images.pexels.com/photos/2067569/pexels-photo-2067569.jpeg',
      category: 'Books',
      source: 'google_books',
    },
    {
      id: '3',
      title: 'Bohemian Rhapsody - Queen',
      description: 'An iconic rock opera that defied conventional song structure and became a timeless classic.',
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      category: 'Music',
      source: 'spotify',
    },
  ];

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentCard = cards[currentIndex];
    if (currentCard) {
      console.log(`Swiped ${direction} on ${currentCard.title}`);
      if (direction === 'right') {
        // Liked - could show quick rating or add to favorites
        triggerHaptic();
      }
    }
    nextCard();
  };

  const handleRate = (rating: number) => {
    const currentCard = cards[currentIndex];
    if (currentCard) {
      setSelectedContent(currentCard);
      setReviewModalVisible(true);
    }
  };

  const nextCard = () => {
    if (currentIndex >= cards.length - 1) {
      // Load more content when reaching the end
      loadRandomContent();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
  };

  const handleQuickRating = (rating: number) => {
    triggerHaptic();
    const currentCard = cards[currentIndex];
    if (currentCard) {
      setSelectedContent(currentCard);
      setReviewModalVisible(true);
    }
  };

  const handleWriteReview = () => {
    const currentCard = cards[currentIndex];
    if (currentCard) {
      setSelectedContent(currentCard);
      setReviewModalVisible(true);
    }
  };

  const handleReviewSubmitted = () => {
    Alert.alert('Success!', 'Your review has been submitted successfully!');
    nextCard();
  };

  const currentCard = cards[currentIndex];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading amazing content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No more content to discover!</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={loadRandomContent}>
            <Text style={styles.reloadText}>Load More</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Swipe to review amazing content</Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <SwipeableCard
          item={currentCard}
          onSwipe={handleSwipe}
          onRate={handleRate}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => handleSwipe('left')}>
          <ThumbsDown size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.reviewButton]}
          onPress={handleWriteReview}>
          <PenTool size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton]}
          onPress={() => {
            triggerHaptic();
            nextCard();
          }}>
          <RotateCcw size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right')}>
          <ThumbsUp size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Rating Quick Actions */}
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={styles.starButton}
            onPress={() => handleQuickRating(rating)}>
            <Star
              size={20}
              color="#FFD700"
              fill={rating <= 3 ? '#FFD700' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        contentItem={selectedContent}
        onReviewSubmitted={handleReviewSubmitted}
      />
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
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
    marginBottom: 20,
  },
  reloadButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  reloadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 20,
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dislikeButton: {
    backgroundColor: '#FF4444',
  },
  reviewButton: {
    backgroundColor: '#4ECDC4',
  },
  resetButton: {
    backgroundColor: '#666',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: '#00C851',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 15,
  },
  starButton: {
    padding: 8,
  },
});