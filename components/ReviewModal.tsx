import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Star, Send, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ContentItem } from '@/services/apiService';
import { reviewService } from '@/services/reviewService';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  contentItem: ContentItem | null;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  visible,
  onClose,
  contentItem,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
    triggerHaptic();
  };

  const handleSubmit = async () => {
    if (!contentItem) return;

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Review Required', 'Please write a review before submitting.');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic();

    try {
      await reviewService.createReview(
        contentItem,
        rating,
        title.trim() || undefined,
        content.trim(),
        isSpoiler
      );

      Alert.alert('Success', 'Your review has been submitted!');
      resetForm();
      onClose();
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setContent('');
    setIsSpoiler(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!contentItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#1a1a1a']}
          style={styles.gradient}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Write Review</Text>
            <TouchableOpacity
              style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}>
              <Send size={20} color={rating === 0 ? '#666' : '#FF6B6B'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Content Info */}
            <BlurView intensity={15} style={styles.contentInfo}>
              <View style={styles.contentHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{contentItem.category}</Text>
                </View>
                <Text style={styles.sourceText}>via {contentItem.source}</Text>
              </View>
              <Text style={styles.contentTitle}>{contentItem.title}</Text>
              <Text style={styles.contentDescription} numberOfLines={3}>
                {contentItem.description}
              </Text>
            </BlurView>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starButton}
                    onPress={() => handleRatingPress(star)}>
                    <Star
                      size={32}
                      color="#FFD700"
                      fill={star <= rating ? '#FFD700' : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && '⭐ Terrible'}
                  {rating === 2 && '⭐⭐ Poor'}
                  {rating === 3 && '⭐⭐⭐ Average'}
                  {rating === 4 && '⭐⭐⭐⭐ Good'}
                  {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                </Text>
              )}
            </View>

            {/* Title Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Review Title (Optional)</Text>
              <BlurView intensity={10} style={styles.inputContainer}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Give your review a catchy title..."
                  placeholderTextColor="#888"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </BlurView>
            </View>

            {/* Review Content */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Review</Text>
              <BlurView intensity={10} style={styles.inputContainer}>
                <TextInput
                  style={styles.contentInput}
                  placeholder="Share your thoughts about this content..."
                  placeholderTextColor="#888"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={1000}
                />
              </BlurView>
              <Text style={styles.characterCount}>
                {content.length}/1000 characters
              </Text>
            </View>

            {/* Spoiler Toggle */}
            <View style={styles.section}>
              <View style={styles.spoilerContainer}>
                <View style={styles.spoilerInfo}>
                  <AlertTriangle size={20} color="#FF9500" />
                  <View style={styles.spoilerText}>
                    <Text style={styles.spoilerTitle}>Contains Spoilers</Text>
                    <Text style={styles.spoilerDescription}>
                      Toggle if your review reveals plot details
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isSpoiler}
                  onValueChange={setIsSpoiler}
                  trackColor={{ false: '#333', true: '#FF6B6B' }}
                  thumbColor={isSpoiler ? '#fff' : '#ccc'}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButtonLarge, rating === 0 && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}>
              <LinearGradient
                colors={rating === 0 ? ['#333', '#333'] : ['#FF6B6B', '#4ECDC4']}
                style={styles.submitGradient}>
                <Text style={[styles.submitText, rating === 0 && styles.submitTextDisabled]}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  submitButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  sourceText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  titleInput: {
    fontSize: 16,
    color: '#fff',
    padding: 16,
    fontWeight: '500',
  },
  contentInput: {
    fontSize: 16,
    color: '#fff',
    padding: 16,
    minHeight: 120,
    fontWeight: '400',
  },
  characterCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 8,
  },
  spoilerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  spoilerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spoilerText: {
    marginLeft: 12,
    flex: 1,
  },
  spoilerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  spoilerDescription: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  submitButtonLarge: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  submitTextDisabled: {
    color: '#666',
  },
  bottomPadding: {
    height: 40,
  },
});