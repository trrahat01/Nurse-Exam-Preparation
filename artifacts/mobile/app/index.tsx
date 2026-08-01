import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/authStore';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: '#0891B2' }]}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/icon.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>BPSC Nurse Prep</Text>
        <Text style={styles.subtitle}>Senior Staff Nurse Exam Preparation</Text>
      </View>

      <View style={styles.featuresSection}>
        <FeatureItem icon="book-open-variant" text="Practice Questions" />
        <FeatureItem icon="clock-outline" text="Timed Mock Exams" />
        <FeatureItem icon="chart-line" text="Performance Analytics" />
        <FeatureItem icon="bookmark-outline" text="Bookmark & Review" />
      </View>

      <View style={[styles.buttonSection, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </Pressable>

        <Pressable style={styles.guestButton} onPress={() => {
          useAuthStore.getState().continueAsGuest();
          router.replace('/(tabs)');
        }}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#fff" />
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons name={icon as any} size={22} color="#BAE6FD" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  topSection: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  logoContainer: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  logoImage: { width: 80, height: 80 },
  title: { color: '#fff', fontSize: 32, fontFamily: 'Inter_700Bold' },
  subtitle: { color: '#BAE6FD', fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  featuresSection: { gap: 16, marginBottom: 40 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureText: { color: '#E0F2FE', fontSize: 15, fontFamily: 'Inter_400Regular' },
  buttonSection: { gap: 12 },
  primaryButton: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    padding: 18, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryButtonText: { color: '#0C4A6E', fontSize: 17, fontFamily: 'Inter_700Bold' },
  guestButton: {
    flexDirection: 'row', borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    padding: 16, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  guestButtonText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});