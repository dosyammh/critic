import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Search, Filter, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { apiService, ContentItem } from '@/services/apiService';
import ReviewModal from '@/components/ReviewModal';

const categories = [
  { name: 'All', color: '#FF6B6B', icon: '🌟' },
  { name: 'Movies', color: '#4ECDC4', icon: '🎬' },
  { name: 'Books', color: '#45B7D1', icon: '📚' },
  { name: 'Music', color: '#96CEB4', icon: '🎵' },
  { name: 'Articles', color: '#FECA57', icon: '📰' },
  { name: 'TV Shows', color: '#FF9FF3', icon: '📺' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    triggerHaptic();
    
    try {
      const category = selectedCategory === 'All' ? undefined : selectedCategory;
      const results = await apiService.searchAll(searchQuery.trim(), category);
      setSearchResults(results);
      
      if (results.length === 0) {
        Alert.alert('No Results', 'No content found for your search. Try different keywords.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search content. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    triggerHaptic();
    
    // Re-search if there's a query and results
    if (searchQuery.trim() && hasSearched) {
      handleSearch();
    }
  };

  const handleResultPress = (item: ContentItem) => {
    setSelectedContent(item);
    setReviewModalVisible(true);
    triggerHaptic();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Movies': return '🎬';
      case 'Books': return '📚';
      case 'Music': return '🎵';
      case 'TV Shows': return '📺';
      case 'Articles': return '📰';
      default: return '🌟';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.gradient}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Search</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Find content to review</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <BlurView intensity={20} style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search movies, books, music..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {isSearching && (
                <View style={styles.searchingIndicator}>
                  <Sparkles size={16} color="#FF6B6B" />
                </View>
              )}
            </View>
          </BlurView>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.name && styles.categoryChipActive,
                ]}
                onPress={() => selectCategory(category.name)}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.categoryTextActive,
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Results */}
        <ScrollView style={styles.resultsContainer}>
          {!hasSearched ? (
            <View style={styles.emptyState}>
              <Search size={64} color="#666" />
              <Text style={styles.emptyTitle}>Discover Amazing Content</Text>
              <Text style={styles.emptyDescription}>
                Search for movies, books, music, articles, and more to start reviewing!
              </Text>
            </View>
          ) : isSearching ? (
            <View style={styles.loadingState}>
              <Sparkles size={32} color="#FF6B6B" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptyDescription}>
                Try different keywords or select a different category
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Search Results</Text>
                <Text style={styles.resultsCount}>{searchResults.length} items</Text>
              </View>

              {searchResults.map((item) => (
                <TouchableOpacity 
                  key={`${item.source}-${item.id}`} 
                  style={styles.resultItem}
                  onPress={() => handleResultPress(item)}>
                  <BlurView intensity={15} style={styles.resultContent}>
                    <View style={styles.resultImagePlaceholder}>
                      <Text style={styles.resultImageText}>
                        {getCategoryIcon(item.category)}
                      </Text>
                    </View>
                    <View style={styles.resultText}>
                      <Text style={styles.resultTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.resultDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <View style={styles.resultMeta}>
                        <Text style={styles.resultCategory}>{item.category}</Text>
                        <Text style={styles.resultSource}>via {item.source}</Text>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>

        {/* Review Modal */}
        <ReviewModal
          visible={reviewModalVisible}
          onClose={() => setReviewModalVisible(false)}
          contentItem={selectedContent}
          onReviewSubmitted={() => {
            Alert.alert('Success!', 'Your review has been submitted!');
          }}
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
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
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
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  searchingIndicator: {
    marginLeft: 8,
  },
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  categoryScroll: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
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
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  resultsCount: {
    fontSize: 14,
    color: '#888',
  },
  resultItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultContent: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  resultImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resultImageText: {
    fontSize: 24,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCategory: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  resultSource: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});