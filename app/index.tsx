import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/AuthScreen';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={styles.loading} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});