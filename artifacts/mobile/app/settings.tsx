import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { clearQuestionHistory } from '@/src/lib/queries';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest, signOut } = useAuthStore();

  const handleResetSeen = () => {
    Alert.alert(
      'Reset Seen Questions',
      'This will allow previously seen questions to appear again in your exams. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearQuestionHistory();
            Alert.alert('Done', 'Question history has been reset. You may now see previously answered questions again.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="account-outline" size={22} color="#0891B2" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{isGuest ? 'Guest User' : user?.email || 'Not signed in'}</Text>
              <Text style={styles.rowSub}>{isGuest ? 'Using app as guest' : 'Signed in'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Tools</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={handleResetSeen}>
            <MaterialCommunityIcons name="refresh" size={22} color="#D97706" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Reset Seen Questions</Text>
              <Text style={styles.rowSub}>Allow old questions to appear again</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => Alert.alert('Notifications', 'Notification settings coming soon. Stay tuned for updates!')}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#64748B" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Notifications</Text>
              <Text style={styles.rowSub}>Get reminders for daily practice</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => Alert.alert('Dark Mode', 'Dark mode support coming soon. Please check for app updates!')}>
            <MaterialCommunityIcons name="theme-light-dark" size={22} color="#64748B" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Dark Mode</Text>
              <Text style={styles.rowSub}>Coming in next update</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => Alert.alert('About Nurse Exam Preparation', 'Nurse Exam Preparation v1.0.0\n\nAll-in-one nursing exam preparation app\n\n40,000+ MCQs covering all nursing subjects\n\nDeveloped for nursing professionals preparing for BPSC, BNC, BSc Nursing, Diploma, and all nursing exams in Bangladesh.\n\nFeatures: 40,000+ MCQs, Mock Tests, Performance Analytics, Offline Support, Smart Review')}>
            <MaterialCommunityIcons name="information-outline" size={22} color="#64748B" />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>About</Text>
              <Text style={styles.rowSub}>Version 1.0.0</Text>
            </View>
            <Text style={styles.rowValue}>v1.0.0</Text>
          </Pressable>
        </View>
      </View>

      {!isGuest && (
        <Pressable style={styles.logoutBtn} onPress={() => { signOut(); router.replace('/'); }}>
          <MaterialCommunityIcons name="logout" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  section: { marginBottom: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_500Medium', color: '#0C1A2E' },
  rowSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 2 },
  rowValue: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 54 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#fff' },
  logoutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#DC2626' },
});
