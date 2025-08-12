import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Plus, PenTool, Camera, Mic, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface FloatingActionButtonProps {
  onReviewPress: () => void;
  onCameraPress: () => void;
  onVoicePress: () => void;
}

export default function FloatingActionButton({
  onReviewPress,
  onCameraPress,
  onVoicePress,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const toggleExpanded = () => {
    triggerHaptic();
    const toValue = isExpanded ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(rotateAnimation, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleActionPress = (action: () => void) => {
    triggerHaptic();
    action();
    toggleExpanded();
  };

  const rotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const actions = [
    {
      icon: PenTool,
      label: 'Write Review',
      color: '#FF6B6B',
      onPress: () => handleActionPress(onReviewPress),
    },
    {
      icon: Camera,
      label: 'Photo Review',
      color: '#4ECDC4',
      onPress: () => handleActionPress(onCameraPress),
    },
    {
      icon: Mic,
      label: 'Voice Review',
      color: '#45B7D1',
      onPress: () => handleActionPress(onVoicePress),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      {actions.map((action, index) => (
        <Animated.View
          key={action.label}
          style={[
            styles.actionButton,
            {
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -(60 * (index + 1))],
                  }),
                },
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}>
          <TouchableOpacity
            style={styles.actionButtonTouchable}
            onPress={action.onPress}>
            <BlurView intensity={20} style={styles.actionButtonBlur}>
              <LinearGradient
                colors={[action.color, `${action.color}80`]}
                style={styles.actionButtonGradient}>
                <action.icon size={20} color="#fff" />
              </LinearGradient>
            </BlurView>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleExpanded}
        activeOpacity={0.8}>
        <BlurView intensity={30} style={styles.fabBlur}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.fabGradient}>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              {isExpanded ? (
                <X size={24} color="#fff" />
              ) : (
                <Plus size={24} color="#fff" />
              )}
            </Animated.View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonTouchable: {
    alignItems: 'center',
  },
  actionButtonBlur: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  fab: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabBlur: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});