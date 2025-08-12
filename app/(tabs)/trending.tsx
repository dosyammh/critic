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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { TrendingUp, Flame, Award, Calendar, Eye } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface TrendingItem {
  id: string;
  title: string;
  category: string;
  reviewCount: number;
  averageRating: number;
  trend: 'up' | 'hot' | 'new';
  image: string;
}

const mockTrendingData: TrendingItem[] = [
  {
    id: '1',
    title: 'Oppenheimer',
    category: 'Movies',
    reviewCount: 2847,
    averageRating: 4.6,
    trend: 'hot',
    image: 'https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg',
  },
  {
    id: '2',
    title: 'Lessons in Chemistry',
    category: 'Books',
    reviewCount: 1205,
    averageRating: 4.3,
    trend: 'up',
    image: 'https://images.pexels.com/photos/2067569/pexels-photo-2067569.jpeg',
  },
  {
    id: '3',
    title: 'Flowers - Miley Cyrus',
    category: 'Music',
    reviewCount: 892,
    averageRating: 3.8,
    trend: 'new',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
  },
];

export default function TrendingScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const scrollY = useRef(new Animated.Value(0)).current;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'hot':
        return <Flame size={16} color="#FF4444" />;
      case 'up':
        return <TrendingUp size={16} color="#00C851" />;
      case 'new':
        return <Award size={16} color="#FFD700" />;
      default:
        return null;
    }
  };

  const periods = ['Today', 'This Week', 'This Month', 'All Time'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.gradient}>
        
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, -20],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Trending</Text>
            <Text style={styles.headerSubtitle}>What's hot right now</Text>
          </View>
          
          {/* Time Period Selector */}
          <View style={styles.periodSelector}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.periodScroll}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodChip,
                    selectedPeriod === period && styles.periodChipActive,
                  ]}
                  onPress={() => {
                    setSelectedPeriod(period);
                    triggerHaptic();
                  }}>
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === period && styles.periodTextActive,
                    ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        {/* Trending Content */}
        <Animated.ScrollView
          style={styles.content}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}>
          
          {/* Featured Trending Item */}
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>🔥 Most Discussed</Text>
            <TouchableOpacity style={styles.featuredCard}>
              <BlurView intensity={25} style={styles.featuredContent}>
                <LinearGradient
                  colors={['rgba(255, 107, 107, 0.3)', 'rgba(255, 107, 107, 0.1)']}
                  style={styles.featuredGradient}>
                  <View style={styles.featuredHeader}>
                    <View style={styles.trendBadge}>
                      <Flame size={14} color="#FF4444" />
                      <Text style={styles.trendBadgeText}>HOT</Text>
                    </View>
                    <Text style={styles.featuredCategory}>Movies</Text>
                  </View>
                  
                  <Text style={styles.featuredTitle}>Oppenheimer</Text>
                  <Text style={styles.featuredDescription}>
                    The biographical thriller about the atomic bomb creator is sparking intense debates...
                  </Text>
                  
                  <View style={styles.featuredStats}>
                    <View style={styles.statItem}>
                      <Eye size={14} color="#888" />
                      <Text style={styles.statText}>2.8k reviews</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statRating}>4.6 ⭐</Text>
                    </View>
                  </View>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Trending List */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            {mockTrendingData.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.trendingItem}
                onPress={triggerHaptic}>
                <BlurView intensity={15} style={styles.itemContent}>
                  <View style={styles.itemRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  
                  <View style={styles.itemImagePlaceholder}>
                    <Text style={styles.itemImageEmoji}>
                      {item.category === 'Movies' ? '🎬' : 
                       item.category === 'Books' ? '📚' : '🎵'}
                    </Text>
                  </View>
                  
                  <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {getTrendIcon(item.trend)}
                    </View>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <View style={styles.itemStats}>
                      <Text style={styles.itemStat}>
                        {item.reviewCount.toLocaleString()} reviews
                      </Text>
                      <Text style={styles.itemRating}>
                        {item.averageRating.toFixed(1)} ⭐
                      </Text>
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weekly Highlights */}
          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>Weekly Highlights</Text>
            <View style={styles.highlightGrid}>
              {['Most Controversial', 'Best New Discovery', 'Critics Choice'].map((highlight, index) => (
                <TouchableOpacity key={highlight} style={styles.highlightCard}>
                  <BlurView intensity={20} style={styles.highlightContent}>
                    <View style={styles.highlightIcon}>
                      <Text style={styles.highlightEmoji}>
                        {index === 0 ? '💥' : index === 1 ? '💎' : '🏆'}
                      </Text>
                    </View>
                    <Text style={styles.highlightTitle}>{highlight}</Text>
                    <Text style={styles.highlightSubtitle}>Tap to explore</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    marginBottom: 20,
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
  periodSelector: {
    marginBottom: 10,
  },
  periodScroll: {
    paddingRight: 20,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  periodChipActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
  },
  periodTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  featuredGradient: {
    padding: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF4444',
  },
  featuredCategory: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  statRating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
  },
  listSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  trendingItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  itemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemImageEmoji: {
    fontSize: 20,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  itemCategory: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemStat: {
    fontSize: 12,
    color: '#ccc',
  },
  itemRating: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  highlightsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  highlightGrid: {
    gap: 12,
  },
  highlightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  highlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  highlightIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  highlightEmoji: {
    fontSize: 24,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  highlightSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});