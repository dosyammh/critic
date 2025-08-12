import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !username)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    triggerHaptic();

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, username);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        Alert.alert('Error', result.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#2a1a2a']}
        style={styles.gradient}>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>Critic</Text>
            <Text style={styles.tagline}>
              {isSignUp ? 'Join the community of critics' : 'Welcome back, critic'}
            </Text>
          </View>

          {/* Auth Form */}
          <BlurView intensity={20} style={styles.formContainer}>
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Mail size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* Username Input (Sign Up Only) */}
              {isSignUp && (
                <View style={styles.inputContainer}>
                  <User size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#888"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                </View>
              )}

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Lock size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#888" />
                  ) : (
                    <Eye size={20} color="#888" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAuth}
                disabled={loading}>
                <LinearGradient
                  colors={['#FF6B6B', '#4ECDC4']}
                  style={styles.submitGradient}>
                  <Text style={styles.submitText}>
                    {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Toggle Auth Mode */}
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  triggerHaptic();
                }}>
                <Text style={styles.toggleText}>
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Features Preview */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What awaits you</Text>
            <View style={styles.featuresGrid}>
              {[
                { icon: '🎬', title: 'Discover', desc: 'Movies, books & more' },
                { icon: '⭐', title: 'Review', desc: 'Share your thoughts' },
                { icon: '🏆', title: 'Compete', desc: 'Climb the leaderboards' },
                { icon: '👥', title: 'Connect', desc: 'Follow fellow critics' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 32,
  },
  form: {
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 16,
    fontWeight: '500',
  },
  passwordInput: {
    paddingRight: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
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
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});