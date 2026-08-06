import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const { result, clearExam } = useExamStore();

  useEffect(() => {
    if (!result) {
      router.replace('/(tabs)/mock');
    }
  }, [result]);

  if (!result) return null;

  const { correct, wrong, skipped, percentage, timeTaken, passed, questions } = result;
  const mm = Math.floor(timeTaken / 60);
  const ss = timeTaken % 60;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: passed ? '#0891B2' : '#DC2626' }]}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>{percentage}</Text>
          <Text style={styles.scorePct}>%</Text>
        </View>
        <Text style={styles.verdict}>{passed ? 'Congratulations!' : 'Keep Practicing!'}</Text>
        <Text style={styles.verdictSub}>{passed ? 'You passed the exam!' : 'Score 50% or more to pass.'}</Text>
        <View style={[styles.passBadge, { backgroundColor: passed ? '#D1FAE5' : '#FEE2E2' }]}>
          <MaterialCommunityIcons name={passed ? 'check-circle' : 'close-circle'} size={16} color={passed ? '#059669' : '#DC2626'} />
          <Text style={[styles.passText, { color: passed ? '#059669' : '#DC2626' }]}>{passed ? 'PASS' : 'FAIL'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard icon="check-circle-outline" iconColor="#059669" iconBg="#D1FAE5" label="Correct" value={correct} subtitle={`${questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0}%`} />
          <StatCard icon="close-circle-outline" iconColor="#DC2626" iconBg="#FEE2E2" label="Wrong" value={wrong} />
          <StatCard icon="minus-circle-outline" iconColor="#D97706" iconBg="#FEF3C7" label="Skipped" value={skipped} />
          <StatCard icon="timer-outline" iconColor="#0891B2" iconBg="#E0F2FE" label="Time" value={`${mm}m ${ss}s`} />
        </View>

        <View style={styles.detailCard}>
          {[
            ['Total Questions', questions.length, '#0C1A2E'],
            ['Attempted', correct + wrong, '#0C1A2E'],
            ['Score', `${correct} / ${questions.length}`, '#0891B2'],
            ['Percentage', `${percentage}%`, passed ? '#059669' : '#DC2626'],
            ['Time Taken', `${mm} min ${ss} sec`, '#0C1A2E'],
            ['Result', passed ? 'PASS' : 'FAIL', passed ? '#059669' : '#DC2626'],
          ].map(([label, value, color], i) => (
            <React.Fragment key={String(label)}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={[styles.detailValue, { color: color as string }]}>{value}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Pressable style={styles.btn} onPress={() => router.push('/exam/review')}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Review Answers</Text>
        </Pressable>

        <Pressable style={styles.btnOutline} onPress={() => { clearExam(); router.replace('/(tabs)'); }}>
          <MaterialCommunityIcons name="home-outline" size={20} color="#0C1A2E" />
          <Text style={styles.btnOutlineText}>Back to Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, iconColor, iconBg, label, value, subtitle }: any) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: iconColor }]}>{value}</Text>
      {subtitle && <Text style={styles.statSub}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, gap: 10 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 4, borderColor: 'rgba(255,255,255,0.4)' },
  scoreNum: { color: '#fff', fontSize: 44, fontFamily: 'Inter_700Bold' },
  scorePct: { color: 'rgba(255,255,255,0.8)', fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 10 },
  verdict: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold' },
  verdictSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Inter_400Regular' },
  passBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  passText: { fontSize: 13, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  content: { padding: 16, gap: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 6, alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B' },
  detailCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  detailLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B' },
  detailValue: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginLeft: 14 },
  btn: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0891B2' },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  btnOutline: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  btnOutlineText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
});