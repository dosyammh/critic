import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Star, Heart, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeableCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    source: string;
  };
  onSwipe: (direction: 'left' | 'right', rating?: number) => void;
  onRate: (rating: number) => void;
}

export default function SwipeableCard({ item, onSwipe, onRate }: SwipeableCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [showRating, setShowRating] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      triggerHaptic();
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const swipeThreshold = screenWidth * 0.25;

      if (Math.abs(dx) > swipeThreshold) {
        const direction = dx > 0 ? 'right' : 'left';
        
        Animated.parallel([
          Animated.timing(pan, {
            toValue: { 
              x: direction === 'right' ? screenWidth : -screenWidth, 
              y: dy 
            },
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(() => {
          onSwipe(direction);
          resetCard();
        });
      } else if (dy < -100) {
        // Swipe up to show rating
        setShowRating(true);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      } else {
        // Snap back to center
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const resetCard = () => {
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
    setShowRating(false);
  };

  const handleRating = (rating: number) => {
    triggerHaptic();
    onRate(rating);
    setShowRating(false);
    resetCard();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            {
              rotate: pan.x.interpolate({
                inputRange: [-screenWidth, 0, screenWidth],
                outputRange: ['-30deg', '0deg', '30deg'],
                extrapolate: 'clamp',
              }),
            },
          ],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}>
      
      <ImageBackground source={{ uri: item.image }} style={styles.cardImage}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.cardGradient}>
          
          {/* Swipe Indicators */}
          <Animated.View
            style={[
              styles.swipeIndicator,
              styles.leftIndicator,
              {
                opacity: pan.x.interpolate({
                  inputRange: [-150, -50, 0],
                  outputRange: [1, 0.5, 0],
                  extrapolate: 'clamp',
                }),
              },
            ]}>
            <X size={32} color="#fff" />
            <Text style={styles.swipeText}>NOPE</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.swipeIndicator,
              styles.rightIndicator,
              {
                opacity: pan.x.interpolate({
                  inputRange: [0, 50, 150],
                  outputRange: [0, 0.5, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}>
            <Heart size={32} color="#fff" />
            <Text style={styles.swipeText}>LOVE</Text>
          </Animated.View>

          {/* Card Content */}
          <BlurView intensity={20} style={styles.cardContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={3}>
              {item.description}
            </Text>
            
            <View style={styles.sourceIndicator}>
              <Text style={styles.sourceText}>via {item.source}</Text>
            </View>

            {/* Rating Overlay */}
            {showRating && (
              <BlurView intensity={30} style={styles.ratingOverlay}>
                <Text style={styles.ratingTitle}>Rate this content</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={styles.starButton}
                      onPress={() => handleRating(rating)}>
                      <Star
                        size={32}
                        color="#FFD700"
                        fill="#FFD700"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.cancelRating}
                  onPress={() => setShowRating(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </BlurView>
            )}
          </BlurView>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth - 40,
    height: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  leftIndicator: {
    left: 30,
    transform: [{ rotate: '-15deg' }],
  },
  rightIndicator: {
    right: 30,
    transform: [{ rotate: '15deg' }],
  },
  swipeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
  },
  cardContent: {
    padding: 24,
    paddingTop: 40,
    position: 'relative',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 34,
  },
  cardDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
  sourceIndicator: {
    alignSelf: 'flex-end',
  },
  sourceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  ratingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  starButton: {
    padding: 8,
  },
  cancelRating: {
    padding: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
});