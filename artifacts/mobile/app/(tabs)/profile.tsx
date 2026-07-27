import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { useExamStore } from '@/src/store/examStore';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest, signOut } = useAuthStore();
  const { savedResults } = useExamStore();

  const name = user?.user_metadata?.full_name ?? (isGuest ? 'Guest User' : 'Student');
  const email = user?.email ?? '';
  const initials = name.split(' ').map((part: string) => part[0]).join('').toUpperCase().slice(0, 2);

  const totalExams = savedResults.length;
  const avgScore = totalExams > 0 ? Math.round(savedResults.reduce((s, r) => s + r.percentage, 0) / totalExams) : 0;
  const bestScore = totalExams > 0 ? Math.max(...savedResults.map(r => r.percentage)) : 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: '#0891B2' }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || 'ST'}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
        {isGuest && (
          <Pressable style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>Sign in to save progress</Text>
          </Pressable>
        )}
      </View>

      {!isGuest && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalExams}</Text>
            <Text style={styles.statLbl}>Tests Taken</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{avgScore}%</Text>
            <Text style={styles.statLbl}>Avg Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{bestScore}%</Text>
            <Text style={styles.statLbl}>Best Score</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.section}>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="account-circle-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>Edit Profile</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => router.push('/auth/forgot-password')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>Change Password</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => router.push('/bookmarks')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="bookmark-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>Bookmarked Questions</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.section}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>App Version</Text>
            </View>
            <Text style={styles.menuValue}>1.0.0</Text>
          </View>
        </View>

        {!isGuest && (
          <Pressable style={styles.signOutBtn} onPress={() => { signOut(); router.replace('/'); }}>
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        )}

        {isGuest && (
          <View style={styles.authButtons}>
            <Pressable style={styles.authBtn} onPress={() => router.push('/auth/login')}>
              <Text style={styles.authBtnText}>Sign In</Text>
            </Pressable>
            <Pressable style={[styles.authBtn, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]} onPress={() => router.push('/auth/register')}>
              <Text style={[styles.authBtnText, { color: '#0C1A2E' }]}>Create Account</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 6 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { color: '#fff', fontSize: 28, fontFamily: 'Inter_700Bold' },
  name: { color: '#fff', fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 4 },
  email: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular' },
  loginBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 6 },
  loginBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', margin: 16, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statVal: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  statLbl: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  content: { padding: 16, gap: 8 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748B', letterSpacing: 0.5, marginTop: 8, marginLeft: 4 },
  section: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#0C1A2E' },
  menuValue: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 48 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' },
  signOutText: { color: '#EF4444', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  authButtons: { gap: 10, marginTop: 8 },
  authBtn: { borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: '#0891B2' },
  authBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
