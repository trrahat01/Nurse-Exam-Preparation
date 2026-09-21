import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';
import { getStreak, type StreakData } from '@/src/lib/streak';
import { getWrongAnswers } from '@/src/lib/wrongAnswers';
import { getGamification, type GamificationState } from '@/src/lib/gamification';
import { fetchTotalQuestionCount } from '@/src/lib/queries';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { savedResults } = useExamStore();
  const [streak, setStreak] = useState<StreakData>({ current: 0, best: 0, lastDate: null, studiedToday: false });
  const [wrongCount, setWrongCount] = useState(0);
  const [gam, setGam] = useState<GamificationState>({ xp: 0, level: 1, xpIntoLevel: 0, xpForNextLevel: 250, progressPct: 0, earnedBadges: [] });
  const [totalMcqs, setTotalMcqs] = useState(0);
  const { startExam } = useExamStore();

  // Re-read the streak + weak topics + total whenever the Profile tab is focused.
  useFocusEffect(
    React.useCallback(() => {
      getStreak().then(setStreak);
      getWrongAnswers().then(w => setWrongCount(w.length));
      getGamification().then(setGam);
      fetchTotalQuestionCount().then(setTotalMcqs).catch(() => setTotalMcqs(0));
    }, [])
  );

  const handleWeakQuiz = async () => {
    const wrong = await getWrongAnswers();
    if (!wrong.length) { Alert.alert('No Weak Topics', 'Answer questions wrong in practice to build your Weak Topics list.'); return; }
    const questions: any[] = wrong.map(w => ({
      id: w.id, category: w.category, question: w.question,
      option_a: w.option_a, option_b: w.option_b, option_c: w.option_c, option_d: w.option_d,
      correct_answer: w.correct_answer, explanation: w.explanation,
    }));
    startExam(questions, 'practice');
    router.push('/exam');
  };

  const name = 'Guest User';
  const email = 'Progress is saved on this device';
  const initials = 'G';

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
      </View>

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

      {/* Daily streak — motivating, works for guests too */}
      <View style={styles.streakCard}>
        <View style={styles.streakItem}>
          <MaterialCommunityIcons name={streak.studiedToday ? 'fire' : 'fire-alert'} size={26} color="#F97316" />
          <Text style={styles.streakVal}>{streak.current}</Text>
          <Text style={styles.streakLbl}>Day Streak</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <MaterialCommunityIcons name="trophy-outline" size={26} color="#D97706" />
          <Text style={styles.streakVal}>{streak.best}</Text>
          <Text style={styles.streakLbl}>Best Streak</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <MaterialCommunityIcons name={streak.studiedToday ? 'check-circle' : 'calendar-today'} size={26} color={streak.studiedToday ? '#059669' : '#64748B'} />
          <Text style={styles.streakVal}>{streak.studiedToday ? 'Done' : '-'}</Text>
          <Text style={styles.streakLbl}>Today's Quiz</Text>
        </View>
      </View>

      {/* Weak Topics / wrong-answer bank + Flashcards */}
      <View style={styles.quickRow}>
        <Pressable style={styles.quickCard} onPress={handleWeakQuiz}>
          <MaterialCommunityIcons name="rewind-outline" size={24} color="#DC2626" />
          <Text style={styles.quickLabel}>Weak Topics</Text>
          <Text style={styles.quickSub}>{wrongCount} to review</Text>
        </Pressable>
        <Pressable style={styles.quickCard} onPress={() => router.push('/flashcards')}>
          <MaterialCommunityIcons name="cards-outline" size={24} color="#0891B2" />
          <Text style={styles.quickLabel}>Flashcards</Text>
          <Text style={styles.quickSub}>Review bookmarks</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.section}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/bookmarks')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="bookmark-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>Bookmarked Questions</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => router.push('/level' as any)}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="trophy-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>Level & Badges</Text>
            </View>
            <Text style={styles.menuValue}>Lv {gam.level} - {gam.xp} XP</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.section}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>App Version</Text>
            </View>
            <Text style={styles.menuValue}>{Constants.expoConfig?.version ?? '1.6.0'}</Text>
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('About Us', `Nurse Exam Preparation\n\n${totalMcqs > 0 ? totalMcqs.toLocaleString() : 'Thousands of'} MCQs for all nursing exams\n\nFor any questions, issues, or suggestions, contact us at:\nmtcorestudio@gmail.com`)}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>About Us</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('Contact Us', 'For any questions, issues, or suggestions, please email us at:\n\nmtcorestudio@gmail.com\n\nWe typically respond within 24-48 hours.')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#0891B2" />
              <Text style={styles.menuLabel}>Contact Us</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </Pressable>
        </View>

        <View style={[styles.authButtons, { marginTop: 16 }]}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#64748B" />
              <Text style={[styles.menuLabel, { color: '#64748B' }]}>No account needed — all progress is saved on this device with Google Play Games sign-in removed.</Text>
            </View>
          </View>
        </View>
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
  
  
  statsRow: { flexDirection: 'row', margin: 16, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2 },
  streakCard: { flexDirection: 'row', marginHorizontal: 16, marginTop: 4, marginBottom: 8, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#FDE68A', paddingVertical: 16, overflow: 'hidden' },
  streakItem: { flex: 1, alignItems: 'center', gap: 2 },
  streakVal: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  streakLbl: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 2, textAlign: 'center' },
  streakDivider: { width: 1, backgroundColor: '#F1F5F9' },
  quickRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 4 },
  quickCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 4 },
  quickLabel: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  quickSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
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
  
  
  authButtons: { gap: 10, marginTop: 8 },
  
  
});