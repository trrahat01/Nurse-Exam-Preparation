import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';
import { getGamification, BADGES, computeCategoryStats, XP_PER_LEVEL, type GamificationState } from '@/src/lib/gamification';
import { getStreak } from '@/src/lib/streak';

interface LevelScreenData {
  gam: GamificationState;
  streakCurrent: number;
}

export default function LevelScreen() {
  const insets = useSafeAreaInsets();
  const { savedResults } = useExamStore();
  const [data, setData] = useState<LevelScreenData>({ gam: { xp: 0, level: 1, xpIntoLevel: 0, xpForNextLevel: XP_PER_LEVEL, progressPct: 0, earnedBadges: [] }, streakCurrent: 0 });

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const gam = await getGamification();
        const streak = await getStreak();
        setData({ gam, streakCurrent: streak.current });
      })();
    }, [])
  );

  const { gam, streakCurrent } = data;
  const earnedSet = new Set(gam.earnedBadges);
  const earned = BADGES.filter(b => earnedSet.has(b.id));
  const locked = BADGES.filter(b => !earnedSet.has(b.id));
  const leaderboard = computeCategoryStats(savedResults).slice(0, 8);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" />
        </Pressable>
        <Text style={styles.title}>Level & Badges</Text>
      </View>

      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View style={styles.levelCircle}>
            <Text style={styles.levelNum}>{gam.level}</Text>
            <Text style={styles.levelLbl}>LEVEL</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.xpTotal}>{gam.xp} XP</Text>
            <Text style={styles.xpSub}>{gam.xpIntoLevel} / {gam.xpForNextLevel} XP to level {gam.level + 1}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: (gam.progressPct + '%') as any }]} />
            </View>
          </View>
        </View>
        <View style={styles.streakHint}>
          <MaterialCommunityIcons name="fire" size={16} color="#F97316" />
          <Text style={styles.streakHintText}>Current streak: {streakCurrent} day(s). Reach 7 to unlock the On Fire badge!</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EARNED BADGES ({earned.length}/{BADGES.length})</Text>
        <View style={styles.badgeGrid}>
          {earned.map(b => (
            <View key={b.id} style={[styles.badge, { borderColor: b.color + '55', backgroundColor: b.color + '14' }]}>
              <MaterialCommunityIcons name={b.icon as any} size={26} color={b.color} />
              <Text style={styles.badgeName}>{b.name}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          ))}
          {earned.length === 0 && (
            <Text style={styles.emptyText}>No badges yet. Complete your first exam to earn one!</Text>
          )}
        </View>
      </View>

      {locked.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCKED BADGES</Text>
          <View style={styles.badgeGrid}>
            {locked.map(b => (
              <View key={b.id} style={[styles.badge, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', opacity: 0.7 }]}>
                <MaterialCommunityIcons name={(b.icon + '-outline') as any} size={26} color="#94A3B8" />
                <Text style={[styles.badgeName, { color: '#94A3B8' }]}>{b.name}</Text>
                <Text style={[styles.badgeDesc, { color: '#94A3B8' }]}>{b.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CATEGORY LEADERBOARD</Text>
        <View style={styles.leaderCard}>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>Complete exams to build your category leaderboard.</Text>
          ) : leaderboard.map((row, i) => (
            <View key={row.category} style={styles.leaderRow}>
              <Text style={styles.leaderRank}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaderCat}>{row.category}</Text>
                <Text style={styles.leaderSub}>{row.correct} correct · {row.accuracy}% accuracy</Text>
              </View>
              <View style={styles.leaderBar}>
                <View style={[styles.leaderFill, { width: (row.accuracy + '%') as any }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  levelCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 18, gap: 14, elevation: 1 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  levelCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#0891B2', alignItems: 'center', justifyContent: 'center' },
  levelNum: { color: '#fff', fontSize: 26, fontFamily: 'Inter_700Bold' },
  levelLbl: { color: '#BAE6FD', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  xpTotal: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  xpSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 2 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#F1F5F9', overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#0891B2' },
  streakHint: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF7ED', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  streakHintText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9A3412' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#64748B', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { width: '31%', borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4, backgroundColor: '#fff' },
  badgeName: { fontSize: 12, fontFamily: 'Inter_700Bold', color: '#0C1A2E', textAlign: 'center' },
  badgeDesc: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center' },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#94A3B8', paddingVertical: 12 },
  leaderCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  leaderRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E0F2FE', color: '#0891B2', fontSize: 12, fontFamily: 'Inter_700Bold', textAlign: 'center', lineHeight: 24, overflow: 'hidden' },
  leaderCat: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  leaderSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 1 },
  leaderBar: { width: 70, height: 6, borderRadius: 3, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  leaderFill: { height: '100%', borderRadius: 3, backgroundColor: '#0891B2' },
});