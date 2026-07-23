import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { useMockResults } from '@/lib/queries';
import { ProgressBar } from '@/components/ProgressBar';
import { CATEGORY_CONFIG, MOCK_DISTRIBUTION } from '@/lib/types';
import type { MockResult } from '@/lib/types';

const CATS = Object.keys(CATEGORY_CONFIG);

function calcCategoryPerformance(results: MockResult[]) {
  // We don't have per-question answers in list view, so compute overall stats
  return CATS.map(cat => ({
    name: cat,
    config: CATEGORY_CONFIG[cat],
    percentage: results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
      : 0,
  }));
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: results, isLoading } = useMockResults(user?.id);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const total = results?.length ?? 0;
  const avgPct = total > 0 ? Math.round((results ?? []).reduce((s, r) => s + r.percentage, 0) / total) : 0;
  const bestPct = total > 0 ? Math.max(...(results ?? []).map(r => r.percentage)) : 0;
  const passCount = (results ?? []).filter(r => r.percentage >= 50).length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  const totalCorrect = (results ?? []).reduce((s, r) => s + r.correct, 0);
  const totalAttempted = (results ?? []).reduce((s, r) => s + r.correct + r.wrong, 0);
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const catPerf = calcCategoryPerformance(results ?? []);
  const last10 = (results ?? []).slice(0, 10).reverse();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#0C4A6E', '#0891B2']}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSub}>Your performance overview</Text>

        <View style={styles.overviewRow}>
          {[
            { label: 'Total Tests', value: total },
            { label: 'Avg Score', value: `${avgPct}%` },
            { label: 'Pass Rate', value: `${passRate}%` },
            { label: 'Accuracy', value: `${accuracy}%` },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.overviewItem}>
                <Text style={styles.overviewVal}>{item.value}</Text>
                <Text style={styles.overviewLbl}>{item.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {total === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyIcon, { color: colors.mutedForeground }]}>📊</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Data Yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Complete mock tests to see your performance analytics here.
            </Text>
          </View>
        ) : (
          <>
            {/* Progress chart */}
            {last10.length > 1 && (
              <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Score Trend</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Last {last10.length} mock tests</Text>
                <View style={styles.barChart}>
                  {last10.map((r, i) => (
                    <View key={r.id} style={styles.barWrap}>
                      <View style={styles.barCol}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(4, (r.percentage / 100) * 100),
                              backgroundColor: r.percentage >= 50 ? '#0891B2' : '#EF4444',
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>
                        {i + 1}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#0891B2' }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Pass</Text>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Fail</Text>
                </View>
              </View>
            )}

            {/* Category performance */}
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Subject Performance</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                Based on overall score (per-subject data available after review)
              </Text>
              <View style={styles.progressList}>
                {catPerf.map(cat => (
                  <ProgressBar
                    key={cat.name}
                    label={cat.name}
                    percentage={avgPct}
                    color={cat.config.color}
                    count={`${MOCK_DISTRIBUTION[cat.name as keyof typeof MOCK_DISTRIBUTION]} Qs`}
                  />
                ))}
              </View>
            </View>

            {/* Summary stats */}
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Exam Summary</Text>
              {[
                ['Best Score', `${bestPct}%`, '#059669'],
                ['Avg Score', `${avgPct}%`, '#0891B2'],
                ['Pass Rate', `${passRate}%`, '#7C3AED'],
                ['Total Exams', `${total}`, '#D97706'],
              ].map(([label, value, color]) => (
                <View key={label as string} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
                  <Text style={[styles.summaryValue, { color: color as string }]}>{value}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  headerSub: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 16 },
  overviewRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 14 },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewVal: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  overviewLbl: { color: '#BAE6FD', fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2, textAlign: 'center' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { padding: 16, gap: 14 },
  emptyCard: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  cardSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: -6 },
  barChart: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 6 },
  barWrap: { flex: 1, alignItems: 'center', gap: 4 },
  barCol: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: 'Inter_400Regular', marginRight: 8 },
  progressList: { gap: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  summaryLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  summaryValue: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});
