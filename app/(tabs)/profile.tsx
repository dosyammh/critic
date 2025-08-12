import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { User, Settings, Trophy, Heart, BookOpen, Star } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }}
            style={styles.avatar}
          />
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>15</Text>
          </View>
        </View>
        
        <Text style={styles.displayName}>Alex Johnson</Text>
        <Text style={styles.username}>@alexcritic</Text>
        <Text style={styles.bio}>Movie enthusiast • Book lover • Music critic</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>127</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2.4K</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>892</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsList}>
          <View style={styles.achievementCard}>
            <Trophy color="#FFD700" size={24} />
            <Text style={styles.achievementText}>Movie Buff</Text>
          </View>
          <View style={styles.achievementCard}>
            <Star color="#FF6B6B" size={24} />
            <Text style={styles.achievementText}>Top Reviewer</Text>
          </View>
          <View style={styles.achievementCard}>
            <Heart color="#FF69B4" size={24} />
            <Text style={styles.achievementText}>Social Star</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <BookOpen color="#666" size={20} />
          <Text style={styles.menuText}>My Reviews</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Heart color="#666" size={20} />
          <Text style={styles.menuText}>Liked Reviews</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Settings color="#666" size={20} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  levelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  achievementsList: {
    flexDirection: 'row',
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  achievementText: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 16,
  },
});