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
import { useColors } from '@/hooks/useColors';
import * as Linking from 'expo-linking';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = colors.scheme === 'dark';
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
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: isDark ? colors.secondary : '#0891B2' }]}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { color: isDark ? colors.foreground : '#fff' }]}>{initials || 'ST'}</Text>
        </View>
        <Text style={[styles.name, { color: isDark ? colors.foreground : '#fff' }]}>{name}</Text>
        <Text style={[styles.email, { color: isDark ? colors.mutedForeground : '#BAE6FD' }]}>{email}</Text>
      </View>

      <View style={[styles.statsRow, { backgroundColor: isDark ? colors.card : '#fff' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.text }]}>{totalExams}</Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Tests Taken</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.text }]}>{avgScore}%</Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Avg Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.text }]}>{bestScore}%</Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Best Score</Text>
          </View>
      </View>

      {/* Daily streak — motivating, works for guests too */}
      <View style={[styles.streakCard, { backgroundColor: isDark ? colors.card : '#fff', borderColor: isDark ? colors.border : '#FDE68A' }]}>
        <View style={styles.streakItem}>
          <MaterialCommunityIcons name={streak.studiedToday ? 'fire' : 'fire-alert'} size={26} color="#F97316" />
          <Text style={[styles.streakVal, { color: colors.text }]}>{streak.current}</Text>
          <Text style={[styles.streakLbl, { color: colors.mutedForeground }]}>Day Streak</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <MaterialCommunityIcons name="trophy-outline" size={26} color="#D97706" />
          <Text style={[styles.streakVal, { color: colors.text }]}>{streak.best}</Text>
          <Text style={[styles.streakLbl, { color: colors.mutedForeground }]}>Best Streak</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <MaterialCommunityIcons name={streak.studiedToday ? 'check-circle' : 'calendar-today'} size={26} color={streak.studiedToday ? '#059669' : '#64748B'} />
          <Text style={[styles.streakVal, { color: colors.text }]}>{streak.studiedToday ? 'Done' : '-'}</Text>
          <Text style={[styles.streakLbl, { color: colors.mutedForeground }]}>Today's Quiz</Text>
        </View>
      </View>

      {/* Weak Topics / wrong-answer bank + Flashcards */}
      <View style={styles.quickRow}>
        <Pressable style={[styles.quickCard, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]} onPress={handleWeakQuiz}>
          <MaterialCommunityIcons name="rewind-outline" size={24} color="#DC2626" />
          <Text style={[styles.quickLabel, { color: colors.text }]}>Weak Topics</Text>
          <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>{wrongCount} to review</Text>
        </Pressable>
        <Pressable style={[styles.quickCard, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]} onPress={() => router.push('/flashcards')}>
          <MaterialCommunityIcons name="cards-outline" size={24} color="#0891B2" />
          <Text style={[styles.quickLabel, { color: colors.text }]}>Flashcards</Text>
          <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>Review bookmarks</Text>
        </Pressable>
      </View>

      <View style={[styles.content, { gap: 8 }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.section, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/bookmarks')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="bookmark-outline" size={20} color="#0891B2" />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Bookmarked Questions</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => router.push('/level' as any)}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="trophy-outline" size={20} color="#0891B2" />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Level & Badges</Text>
            </View>
            <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>Lv {gam.level} - {gam.xp} XP</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>COMMUNITY & LINKS</Text>
        <View style={[styles.section, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]}>
          <Pressable style={styles.menuItem} onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.nurseexampreparation.nursing')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="google-play" size={20} color="#0891B2" />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Rate on Google Play</Text>
              <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>Review the app</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={20} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61594250881')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Follow on Facebook</Text>
              <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>News, updates & tips</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={20} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => Linking.openURL('https://play.google.com/store/apps/developer?id=MT+Core+Studio')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="apps" size={20} color="#059669" />
              <Text style={[styles.menuLabel, { color: colors.text }]}>MT Core Studio</Text>
              <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>Other apps</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.section, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#0891B2" />
              <Text style={[styles.menuLabel, { color: colors.text }]}>App Version</Text>
            </View>
            <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{Constants.expoConfig?.version ?? '1.6.0'}</Text>
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('About Us', `Nurse Exam Preparation\n\n${totalMcqs > 0 ? totalMcqs.toLocaleString() : 'Thousands of'} MCQs for all nursing exams\n\nFor any questions, issues, or suggestions, contact us at:\nmtcorestudio@gmail.com`)}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="help-circle-outline" size={20} color="#0891B2" />
              <Text style={[styles.menuLabel, { color: colors.text }]}>About Us</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => Alert.alert('Contact Us', 'For any questions, issues, or suggestions, please email us at:\n\nmtcorestudio@gmail.com\n\nWe typically respond within 24-48 hours.')}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#0891B2" />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Contact Us</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={[styles.authButtons, { marginTop: 16 }]}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="shield-lock-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.menuLabel, { color: colors.mutedForeground }]}>No account needed — all progress is saved on this device with Google Play Games sign-in removed.</Text>
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