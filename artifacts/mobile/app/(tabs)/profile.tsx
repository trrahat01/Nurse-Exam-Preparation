import React, { useState } from 'react';
import {
  Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { useMockResults } from '@/lib/queries';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { user, signOut, isGuest } = useAuth();
  const { data: results } = useMockResults(user?.id);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const name = user?.user_metadata?.full_name ?? (isGuest ? 'Guest User' : 'Student');
  const email = user?.email ?? (isGuest ? 'guest@bpsc.app' : '');
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalExams = results?.length ?? 0;
  const avgScore = totalExams > 0
    ? Math.round((results ?? []).reduce((s, r) => s + r.percentage, 0) / totalExams)
    : 0;
  const bestScore = totalExams > 0 ? Math.max(...(results ?? []).map(r => r.percentage)) : 0;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar header */}
      <LinearGradient
        colors={['#0C4A6E', '#0891B2']}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || 'ST'}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
        {isGuest && (
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginBtnText}>Sign in to save progress</Text>
          </Pressable>
        )}
      </LinearGradient>

      {/* Stats */}
      {!isGuest && (
        <View style={styles.statsRow}>
          {[
            { label: 'Tests Taken', value: totalExams },
            { label: 'Avg Score', value: `${avgScore}%` },
            { label: 'Best Score', value: `${bestScore}%` },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      )}

      <View style={styles.content}>
        {/* Account settings */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem
            icon="account-circle-outline"
            label="Edit Profile"
            onPress={() => {}}
            colors={colors}
          />
          <Divider colors={colors} />
          <MenuItem
            icon="lock-outline"
            label="Change Password"
            onPress={() => router.push('/auth/forgot-password')}
            colors={colors}
          />
          <Divider colors={colors} />
          <MenuItem
            icon="bookmark-outline"
            label="Bookmarked Questions"
            onPress={() => router.push('/bookmarks')}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PREFERENCES</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="theme-light-dark" size={20} color={colors.primary} />
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>Appearance</Text>
            </View>
            <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>
              {colorScheme === 'dark' ? 'Dark' : 'Light'}
            </Text>
          </View>
          <Divider colors={colors} />
          <MenuItem
            icon="bell-outline"
            label="Notifications"
            onPress={() => {}}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="information-outline" label="App Version 1.0.0" onPress={() => {}} colors={colors} />
          <Divider colors={colors} />
          <MenuItem icon="shield-check-outline" label="Privacy Policy" onPress={() => {}} colors={colors} />
          <Divider colors={colors} />
          <MenuItem icon="file-document-outline" label="Terms of Service" onPress={() => {}} colors={colors} />
        </View>

        {!isGuest && (
          <Pressable
            style={[styles.signOutBtn, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}
            onPress={handleSignOut}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        )}

        {isGuest && (
          <View style={styles.authButtons}>
            <Pressable
              style={[styles.authBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={[styles.authBtnText, { color: colors.primaryForeground }]}>Sign In</Text>
            </Pressable>
            <Pressable
              style={[styles.authBtn, { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={[styles.authBtnText, { color: colors.foreground }]}>Create Account</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress, colors }: any) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress} android_ripple={{ color: colors.border }}>
      <View style={styles.menuLeft}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { alignItems: 'center', paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 6 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { color: '#fff', fontSize: 28, fontFamily: 'Inter_700Bold' },
  name: { color: '#fff', fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 4 },
  email: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular' },
  loginBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 6 },
  loginBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', margin: 16, borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statVal: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLbl: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statDivider: { width: 1 },
  content: { padding: 16, gap: 8 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, marginTop: 8, marginLeft: 4 },
  section: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  menuValue: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  divider: { height: 1, marginLeft: 48 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1 },
  signOutText: { color: '#EF4444', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  authButtons: { gap: 10, marginTop: 8 },
  authBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  authBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
