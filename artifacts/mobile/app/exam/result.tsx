import React from 'react';
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useExam } from '@/contexts/ExamContext';
import { StatCard } from '@/components/StatCard';

export default function ResultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { result, clearExam } = useExam();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!result) {
    router.replace('/(tabs)/mock');
    return null;
  }

  const { score, correct, wrong, skipped, percentage, timeTaken, passed, questions } = result;
  const mm = Math.floor(timeTaken / 60);
  const ss = timeTaken % 60;

  const gradColors: [string, string] = passed
    ? ['#059669', '#0891B2']
    : ['#991B1B', '#DC2626'];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={gradColors} style={[styles.header, { paddingTop: topPad + 20 }]}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>{percentage}</Text>
          <Text style={styles.scorePct}>%</Text>
        </View>
        <Text style={styles.verdict}>{passed ? 'Congratulations!' : 'Keep Practicing!'}</Text>
        <Text style={styles.verdictSub}>
          {passed ? 'You passed the exam!' : 'Score 50% or more to pass.'}
        </Text>
        <View style={[styles.passBadge, { backgroundColor: passed ? '#D1FAE5' : '#FEE2E2' }]}>
          <MaterialCommunityIcons
            name={passed ? 'check-circle' : 'close-circle'}
            size={16}
            color={passed ? '#059669' : '#DC2626'}
          />
          <Text style={[styles.passText, { color: passed ? '#059669' : '#DC2626' }]}>
            {passed ? 'PASS' : 'FAIL'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="check-circle-outline"
            iconColor="#059669"
            iconBg="#D1FAE5"
            label="Correct"
            value={correct}
            subtitle={`${Math.round((correct / questions.length) * 100)}%`}
          />
          <StatCard
            icon="close-circle-outline"
            iconColor="#DC2626"
            iconBg="#FEE2E2"
            label="Wrong"
            value={wrong}
          />
          <StatCard
            icon="minus-circle-outline"
            iconColor="#D97706"
            iconBg="#FEF3C7"
            label="Skipped"
            value={skipped}
          />
          <StatCard
            icon="timer-outline"
            iconColor="#0891B2"
            iconBg="#E0F2FE"
            label="Time"
            value={`${mm}m ${ss}s`}
          />
        </View>

        {/* Detail card */}
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            ['Total Questions', questions.length, colors.foreground],
            ['Questions Attempted', correct + wrong, colors.foreground],
            ['Score', `${score} / ${questions.length}`, colors.primary],
            ['Percentage', `${percentage}%`, passed ? '#059669' : '#DC2626'],
            ['Time Taken', `${mm} min ${ss} sec`, colors.foreground],
            ['Result', passed ? 'PASS' : 'FAIL', passed ? '#059669' : '#DC2626'],
          ].map(([label, value, color], i) => (
            <React.Fragment key={label as string}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.detailValue, { color: color as string }]}>{value}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Actions */}
        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/exam/review')}
        >
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Review Answers</Text>
        </Pressable>

        <Pressable
          style={[styles.btnOutline, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => { clearExam(); router.replace('/(tabs)'); }}
        >
          <MaterialCommunityIcons name="home-outline" size={20} color={colors.foreground} />
          <Text style={[styles.btnOutlineText, { color: colors.foreground }]}>Back to Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
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
  detailCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  detailLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  detailValue: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  divider: { height: 1, marginLeft: 14 },
  btn: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  btnOutline: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1 },
  btnOutlineText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
