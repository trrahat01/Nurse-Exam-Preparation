import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { useExamStore } from '@/src/store/examStore';
import { fetchMockQuestions, fetchCategoryQuestionStats, fetchTotalQuestionCount } from '@/src/lib/queries';
import { CATEGORY_CONFIG } from '@/src/types';

const CATEGORIES = Object.values(CATEGORY_CONFIG);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuthStore();
  const { savedResults, loadSavedResults, startExam } = useExamStore();
  const [loading, setLoading] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Record<string, { total: number; seen: number; unseen: number }>>({});
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    loadSavedResults();
    loadQuestionCounts();
  }, []);

  const loadQuestionCounts = async () => {
    try {
      const [counts, total] = await Promise.all([
        fetchCategoryQuestionStats(),
        fetchTotalQuestionCount(),
      ]);
      setCategoryStats(counts);
      setTotalQuestions(total);
    } catch (e) {
      console.error('Failed to load question counts:', e);
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? (isGuest ? 'Guest' : 'Student');
  const totalExams = savedResults.length;
  const avgScore = savedResults.length
    ? Math.round(savedResults.reduce((s, r) => s + r.percentage, 0) / savedResults.length)
    : 0;
  const bestScore = savedResults.length
    ? Math.max(...savedResults.map(r => r.percentage))
    : 0;

  const handleStartMock = async () => {
    setLoading(true);
    try {
      const questions = await fetchMockQuestions();
      if (questions.length > 0) {
        startExam(questions, 'mock');
        router.push('/exam');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: '#0891B2' }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.subtitle}>Nurse Exam Preparation</Text>
          </View>
          <Pressable style={styles.settingsBtn} onPress={() => router.push('/settings')}>
            <MaterialCommunityIcons name="cog-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{totalExams}</Text>
            <Text style={styles.statLbl}>Exams</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{avgScore}%</Text>
            <Text style={styles.statLbl}>Avg Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{bestScore}%</Text>
            <Text style={styles.statLbl}>Best</Text>
          </View>
        </View>

        {/* Total Questions Badge */}
        {totalQuestions > 0 && (
          <View style={styles.totalBadge}>
            <MaterialCommunityIcons name="book-open-variant" size={16} color="#fff" />
            <Text style={styles.totalBadgeText}>{totalQuestions.toLocaleString()} Questions Available</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.actionRow}>
          <ActionButton icon="clipboard-text-outline" label="Full Mock" sublabel="100 Questions" color="#0891B2" bg="#E0F2FE" onPress={handleStartMock} loading={loading} />
          <ActionButton icon="calendar-star" label="Daily" sublabel="Practice" color="#059669" bg="#D1FAE5" onPress={() => router.push('/daily')} />
          <ActionButton icon="bookmark-outline" label="Bookmarks" sublabel="Saved" color="#7C3AED" bg="#EDE9FE" onPress={() => router.push('/bookmarks')} />
          <ActionButton icon="magnify" label="Search" sublabel="Questions" color="#D97706" bg="#FEF3C7" onPress={() => router.push('/search')} />
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => {
            const stat = categoryStats[cat.name] || { total: 0, seen: 0, unseen: 0 };
            return (
              <Pressable
                key={cat.name}
                style={[styles.catCard, { backgroundColor: cat.bgColor }]}
                onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.name } })}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                  <MaterialCommunityIcons name={cat.icon as any} size={28} color={cat.color} />
                </View>
                <Text style={[styles.catName, { color: cat.color }]}>{cat.name}</Text>
                <Text style={styles.catDesc} numberOfLines={2}>{cat.description}</Text>
                <Text style={[styles.catCount, { color: cat.color }]}>
                  {stat.total > 0 ? `${stat.total.toLocaleString()} total` : 'Loading...'}
                </Text>
                <Text style={[styles.catSeen, { color: cat.color }]}>
                  {stat.total > 0 ? `${stat.unseen.toLocaleString()} new` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {savedResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Results</Text>
            {savedResults.slice(0, 3).map((r, i) => (
              <Pressable
                key={i}
                style={styles.resultRow}
                onPress={() => router.push('/exam/review')}
              >
                <View style={[styles.resultIcon, { backgroundColor: r.passed ? '#D1FAE5' : '#FEE2E2' }]}>
                  <MaterialCommunityIcons name={r.passed ? 'check' : 'close'} size={16} color={r.passed ? '#059669' : '#EF4444'} />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultType}>{r.examType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Test</Text>
                  <Text style={styles.resultDate}>{new Date().toLocaleDateString()}</Text>
                </View>
                <View style={styles.resultScore}>
                  <Text style={[styles.scorePct, { color: r.passed ? '#059669' : '#EF4444' }]}>{r.percentage}%</Text>
                  <Text style={styles.scoreDetail}>{r.correct}/{r.questions.length}</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function ActionButton({ icon, label, sublabel, color, bg, onPress, loading }: any) {
  return (
    <Pressable style={[styles.actionBtn, { backgroundColor: '#fff', borderColor: '#E2E8F0' }]} onPress={onPress} disabled={loading}>
      <View style={[styles.actionIcon, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionSub}>{sublabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold' },
  subtitle: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  settingsBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLbl: { color: '#BAE6FD', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  totalBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'center' },
  totalBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 16, gap: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  actionSub: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#64748B' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: { width: '47%', borderRadius: 16, padding: 16, gap: 8 },
  catIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  catDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B', lineHeight: 16 },
  catCount: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  catSeen: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: -4 },
  resultRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 12 },
  resultIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, gap: 2 },
  resultType: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  resultDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
  resultScore: { alignItems: 'flex-end', gap: 2 },
  scorePct: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  scoreDetail: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B' },
});
