import React from 'react';
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import { useMockResults, useMockQuestions } from '@/lib/queries';
import { CATEGORY_CONFIG, MOCK_DISTRIBUTION } from '@/lib/types';
import { CategoryCard } from '@/components/CategoryCard';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/SkeletonLoader';

const CATEGORIES = Object.values(CATEGORY_CONFIG);

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();
  const { data: results, isLoading: resultsLoading } = useMockResults(user?.id);
  const { startExam } = useExam();
  const { refetch: fetchMock, isFetching } = useMockQuestions();

  const totalExams = results?.length ?? 0;
  const avgScore = results?.length
    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
    : 0;
  const bestScore = results?.length
    ? Math.max(...results.map(r => r.percentage))
    : 0;

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? (isGuest ? 'Guest' : 'Student');

  const handleStartMock = async () => {
    const { data } = await fetchMock();
    if (data && data.length > 0) {
      startExam(data, 'mock');
      router.push('/exam');
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header gradient */}
      <LinearGradient
        colors={['#0C4A6E', '#0891B2']}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Text style={styles.greeting}>Hello, {firstName}</Text>
        <Text style={styles.subtitle}>BPSC Senior Staff Nurse Exam</Text>

        <View style={styles.statsRow}>
          {resultsLoading ? (
            <>
              <Skeleton width={80} height={48} borderRadius={12} />
              <Skeleton width={80} height={48} borderRadius={12} />
              <Skeleton width={80} height={48} borderRadius={12} />
            </>
          ) : (
            <>
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
            </>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Start</Text>
        <View style={styles.actionRow}>
          <ActionButton
            icon="clipboard-text-outline"
            label="Full Mock"
            sublabel="100 Questions"
            color="#0891B2"
            bg="#E0F2FE"
            onPress={handleStartMock}
            loading={isFetching}
          />
          <ActionButton
            icon="calendar-star"
            label="Daily"
            sublabel="Practice"
            color="#059669"
            bg="#D1FAE5"
            onPress={() => router.push('/daily')}
          />
          <ActionButton
            icon="bookmark-outline"
            label="Bookmarks"
            sublabel="Saved"
            color="#7C3AED"
            bg="#EDE9FE"
            onPress={() => router.push('/bookmarks')}
          />
          <ActionButton
            icon="magnify"
            label="Search"
            sublabel="Questions"
            color="#D97706"
            bg="#FEF3C7"
            onPress={() => router.push('/search')}
          />
        </View>

        {/* Categories */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat, i) => (
            <CategoryCard
              key={cat.name}
              config={cat}
              questionCount={MOCK_DISTRIBUTION[cat.name as keyof typeof MOCK_DISTRIBUTION]}
              onPress={() =>
                router.push({ pathname: '/category/[id]', params: { id: cat.name, name: cat.name } })
              }
            />
          ))}
        </View>

        {/* Recent Results */}
        {results && results.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Results</Text>
            {results.slice(0, 3).map(r => (
              <View
                key={r.id}
                style={[styles.resultRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.resultIcon, { backgroundColor: r.percentage >= 50 ? '#D1FAE5' : '#FEE2E2' }]}>
                  <MaterialCommunityIcons
                    name={r.percentage >= 50 ? 'check' : 'close'}
                    size={16}
                    color={r.percentage >= 50 ? '#059669' : '#EF4444'}
                  />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultType, { color: colors.foreground }]}>
                    {r.exam_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Test
                  </Text>
                  <Text style={[styles.resultDate, { color: colors.mutedForeground }]}>
                    {new Date(r.created_at).toLocaleDateString('en-BD')}
                  </Text>
                </View>
                <View style={styles.resultScore}>
                  <Text style={[styles.scorePct, { color: r.percentage >= 50 ? '#059669' : '#EF4444' }]}>
                    {r.percentage}%
                  </Text>
                  <Text style={[styles.scoreDetail, { color: colors.mutedForeground }]}>
                    {r.correct}/{r.correct + r.wrong + r.skipped}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

interface ActionButtonProps {
  icon: string; label: string; sublabel: string;
  color: string; bg: string;
  onPress: () => void; loading?: boolean;
}

function ActionButton({ icon, label, sublabel, color, bg, onPress, loading }: ActionButtonProps) {
  const colors = useColors();
  return (
    <Pressable
      style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={[styles.actionIcon, { backgroundColor: bg }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>{sublabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 32, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  greeting: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16, gap: 0 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLbl: { color: '#BAE6FD', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  actionSub: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  resultRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  resultIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, gap: 2 },
  resultType: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  resultDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  resultScore: { alignItems: 'flex-end', gap: 2 },
  scorePct: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  scoreDetail: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
