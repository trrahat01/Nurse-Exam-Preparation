import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';

export default function AnalyticsTabScreen() {
  const insets = useSafeAreaInsets();
  const { savedResults } = useExamStore();

  const totalExams = savedResults.length;
  const avgScore = totalExams ? Math.round(savedResults.reduce((s, r) => s + r.percentage, 0) / totalExams) : 0;
  const bestScore = totalExams ? Math.max(...savedResults.map(r => r.percentage)) : 0;
  const totalCorrect = savedResults.reduce((s, r) => s + r.correct, 0);
  const totalQuestions = savedResults.reduce((s, r) => s + r.questions.length, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}>
      <Text style={styles.pageTitle}>Analytics</Text>

      {totalExams === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="chart-bar" size={48} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptySub}>Complete a mock exam to see your analytics.</Text>
        </View>
      ) : (
        <>
          <View style={styles.scoreCard}>
            <Text style={styles.bigScore}>{overallAccuracy}%</Text>
            <Text style={styles.scoreLabel}>Overall Accuracy</Text>
            <Text style={styles.scoreSub}>{totalExams} exams completed</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}><Text style={[styles.statNum, { color: '#10B981' }]}>{avgScore}%</Text><Text style={styles.statLabel}>Average</Text></View>
            <View style={styles.statBox}><Text style={[styles.statNum, { color: '#0891B2' }]}>{bestScore}%</Text><Text style={styles.statLabel}>Best</Text></View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  pageTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#0C1A2E', paddingHorizontal: 16, marginBottom: 16 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center', paddingHorizontal: 40 },
  scoreCard: { alignItems: 'center', marginHorizontal: 16, padding: 24, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  bigScore: { fontSize: 48, fontFamily: 'Inter_700Bold', color: '#0891B2' },
  scoreLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#64748B', marginTop: 4 },
  scoreSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#94A3B8', marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 10, marginHorizontal: 16 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, alignItems: 'center' },
  statNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 4 },
});