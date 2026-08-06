import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { savedResults } = useExamStore();

  const totalExams = savedResults.length;
  const avgScore = totalExams ? Math.round(savedResults.reduce((s, r) => s + r.percentage, 0) / totalExams) : 0;
  const bestScore = totalExams ? Math.max(...savedResults.map(r => r.percentage)) : 0;
  const worstScore = totalExams ? Math.min(...savedResults.map(r => r.percentage)) : 0;
  const totalCorrect = savedResults.reduce((s, r) => s + r.correct, 0);
  const totalWrong = savedResults.reduce((s, r) => s + r.wrong, 0);
  const totalSkipped = savedResults.reduce((s, r) => s + r.skipped, 0);
  const totalQuestions = savedResults.reduce((s, r) => s + r.questions.length, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" />
        </Pressable>
        <Text style={styles.title}>Performance Analytics</Text>
      </View>

      {totalExams === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="chart-bar" size={48} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptySub}>Complete a mock exam to see your performance analytics here.</Text>
        </View>
      ) : (
        <>
          <View style={styles.scoreCard}>
            <Text style={styles.bigScore}>{overallAccuracy}%</Text>
            <Text style={styles.scoreLabel}>Overall Accuracy</Text>
            <Text style={styles.scoreSub}>{totalExams} exams completed</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#10B981' }]}>{avgScore}%</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#0891B2' }]}>{bestScore}%</Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#F59E0B' }]}>{worstScore}%</Text>
              <Text style={styles.statLabel}>Worst</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.cardTitle}>Question Breakdown</Text>
            <View style={styles.breakdownRow}>
              <View style={[styles.breakdownBar, { backgroundColor: '#D1FAE5', flex: totalCorrect }]} />
              <View style={[styles.breakdownBar, { backgroundColor: '#FEE2E2', flex: totalWrong || 0.1 }]} />
              <View style={[styles.breakdownBar, { backgroundColor: '#FEF3C7', flex: totalSkipped || 0.1 }]} />
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Correct ({totalCorrect})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>Wrong ({totalWrong})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Skipped ({totalSkipped})</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>All Results</Text>
          {savedResults.map((r, i) => (
            <View key={i} style={styles.resultCard}>
              <View style={styles.resultLeft}>
                <Text style={styles.resultType}>{r.examType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
                <Text style={styles.resultDate}>Exam #{totalExams - i}</Text>
              </View>
              <View style={styles.resultRight}>
                <Text style={[styles.resultScore, { color: r.passed ? '#10B981' : '#EF4444' }]}>{r.percentage}%</Text>
                <Text style={styles.resultSub}>{r.correct}/{r.questions.length}</Text>
              </View>
              <View style={[styles.resultTrend, { backgroundColor: r.percentage >= 50 ? '#D1FAE5' : '#FEE2E2' }]}>
                <MaterialCommunityIcons
                  name={i > 0 && r.percentage > savedResults[i - 1].percentage ? 'trending-up' : i > 0 && r.percentage < savedResults[i - 1].percentage ? 'trending-down' : 'minus'}
                  size={16}
                  color={r.percentage >= 50 ? '#059669' : '#DC2626'}
                />
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center', paddingHorizontal: 40 },
  scoreCard: { alignItems: 'center', marginHorizontal: 16, padding: 24, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  bigScore: { fontSize: 48, fontFamily: 'Inter_700Bold', color: '#0891B2' },
  scoreLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#64748B', marginTop: 4 },
  scoreSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94A3B8', marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, alignItems: 'center' },
  statNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 4 },
  breakdownCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0C1A2E', marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  breakdownBar: { height: '100%' },
  legendRow: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0C1A2E', marginHorizontal: 16, marginBottom: 8, marginTop: 4 },
  resultCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, marginBottom: 8, gap: 12 },
  resultLeft: { flex: 1 },
  resultType: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  resultDate: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 2 },
  resultRight: { alignItems: 'flex-end' },
  resultScore: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  resultSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B' },
  resultTrend: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});