import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Send, Heart, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { reviewService, Comment } from '@/services/reviewService';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  reviewId: string | null;
  reviewTitle?: string;
}

export default function CommentsModal({
  visible,
  onClose,
  reviewId,
  reviewTitle,
}: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    if (visible && reviewId) {
      loadComments();
    }
  }, [visible, reviewId]);

  const loadComments = async () => {
    if (!reviewId) return;

    setIsLoading(true);
    try {
      const fetchedComments = await reviewService.getReviewComments(reviewId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!reviewId || !newComment.trim()) return;

    setIsSubmitting(true);
    triggerHaptic();

    try {
      const comment = await reviewService.addComment(reviewId, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#1a1a1a']}
          style={styles.gradient}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Comments</Text>
              {reviewTitle && (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {reviewTitle}
                </Text>
              )}
            </View>
            <View style={styles.headerRight}>
              <MessageCircle size={20} color="#888" />
              <Text style={styles.commentCount}>{comments.length}</Text>
            </View>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading comments...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MessageCircle size={48} color="#666" />
                <Text style={styles.emptyTitle}>No comments yet</Text>
                <Text style={styles.emptyDescription}>
                  Be the first to share your thoughts!
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <BlurView key={comment.id} intensity={10} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <View style={styles.userInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {comment.profiles?.display_name?.charAt(0) || '?'}
                        </Text>
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>
                          {comment.profiles?.display_name || 'Unknown User'}
                        </Text>
                        <Text style={styles.userHandle}>
                          @{comment.profiles?.username || 'unknown'}
                        </Text>
                      </View>
                      {comment.profiles?.level && (
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelText}>{comment.profiles.level}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.timeAgo}>
                      {formatTimeAgo(comment.created_at)}
                    </Text>
                  </View>
                  
                  <Text style={styles.commentContent}>{comment.content}</Text>
                  
                  <View style={styles.commentActions}>
                    <TouchableOpacity style={styles.likeButton}>
                      <Heart size={16} color="#888" />
                      <Text style={styles.likeCount}>{comment.like_count}</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              ))
            )}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Comment Input */}
          <BlurView intensity={20} style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#888"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}>
                <Send 
                  size={20} 
                  color={(!newComment.trim() || isSubmitting) ? '#666' : '#FF6B6B'} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.characterCount}>
              {newComment.length}/500
            </Text>
          </BlurView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentCount: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  commentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userHandle: {
    fontSize: 12,
    color: '#888',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
  },
  commentContent: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCount: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  characterCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  bottomPadding: {
    height: 20,
  },
});