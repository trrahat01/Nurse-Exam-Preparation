import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';
import type { AnswerOption } from '@/src/types';

type Filter = 'all' | 'correct' | 'wrong' | 'skipped';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { result, clearExam } = useExamStore();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (!result) {
      router.replace('/(tabs)/mock');
    }
  }, [result]);

  if (!result) return null;

  const { questions, answers } = result;
  const filtered = questions.filter(q => {
    const ans = answers[q.id];
    if (filter === 'correct') return ans === q.correct_answer;
    if (filter === 'wrong') return ans && ans !== q.correct_answer;
    if (filter === 'skipped') return !ans;
    return true;
  });

  const opts: AnswerOption[] = ['a', 'b', 'c', 'd'];
  const FILTERS: { key: Filter; label: string; color: string }[] = [
    { key: 'all', label: `All (${questions.length})`, color: '#0891B2' },
    { key: 'correct', label: `Correct (${result.correct})`, color: '#059669' },
    { key: 'wrong', label: `Wrong (${result.wrong})`, color: '#DC2626' },
    { key: 'skipped', label: `Skipped (${result.skipped})`, color: '#D97706' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.filterBar, { paddingTop: insets.top + 8 }]}>
        {FILTERS.map(f => (
          <Pressable key={f.key} style={[styles.filterBtn, filter === f.key ? { backgroundColor: f.color + '18', borderColor: f.color } : { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, { color: filter === f.key ? f.color : '#64748B' }]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={q => q.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80, gap: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: q }) => {
          const ans = answers[q.id] as AnswerOption | null;
          const isCorrect = ans === q.correct_answer;
          const isSkipped = !ans;
          const optTexts: Record<AnswerOption, string> = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d };

          return (
            <View style={styles.qCard}>
              <View style={styles.qHeader}>
                <Text style={styles.qNum}>Q{questions.indexOf(q) + 1}</Text>
                <View style={[styles.statusBadge, { backgroundColor: isSkipped ? '#FEF3C7' : isCorrect ? '#D1FAE5' : '#FEE2E2' }]}>
                  <MaterialCommunityIcons name={isSkipped ? 'minus' : isCorrect ? 'check' : 'close'} size={12} color={isSkipped ? '#D97706' : isCorrect ? '#059669' : '#DC2626'} />
                  <Text style={[styles.statusText, { color: isSkipped ? '#D97706' : isCorrect ? '#059669' : '#DC2626' }]}>{isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong'}</Text>
                </View>
              </View>
              <Text style={styles.qText}>{q.question}</Text>
              <View style={styles.options}>
                {opts.map(opt => (
                  <View key={opt} style={[styles.optionRow, ans === opt && { borderColor: isCorrect ? '#059669' : '#DC2626', backgroundColor: isCorrect ? '#D1FAE5' : '#FEE2E2' }, opt === q.correct_answer && ans !== opt && { borderColor: '#059669', backgroundColor: '#D1FAE5' }]}>
                    <View style={[styles.optCircle, { backgroundColor: opt === q.correct_answer ? '#059669' : ans === opt && !isCorrect ? '#DC2626' : '#F1F5F9' }]}>
                      <Text style={[styles.optLetter, { color: opt === q.correct_answer || (ans === opt && !isCorrect) ? '#fff' : '#64748B' }]}>{opt.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.optText}>{optTexts[opt]}</Text>
                    {opt === q.correct_answer && <MaterialCommunityIcons name="check-circle" size={18} color="#059669" />}
                    {ans === opt && !isCorrect && <MaterialCommunityIcons name="close-circle" size={18} color="#DC2626" />}
                  </View>
                ))}
              </View>
              {q.explanation && (
                <View style={styles.explain}>
                  <Text style={styles.explainTitle}>Explanation</Text>
                  <Text style={styles.explainText}>{q.explanation}</Text>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No questions in this filter.</Text></View>}
      />

      <View style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <Pressable style={styles.fabBtn} onPress={() => { clearExam(); router.replace('/(tabs)'); }}>
          <MaterialCommunityIcons name="home" size={22} color="#fff" />
          <Text style={styles.fabText}>Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  filterBar: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterBtn: { flex: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  filterText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  qCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 12 },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qNum: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#64748B', marginRight: 'auto' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  qText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: '#0C1A2E', lineHeight: 22 },
  options: { gap: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12 },
  optCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optLetter: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  optText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#0C1A2E' },
  explain: { backgroundColor: '#E0F2FE', borderRadius: 12, padding: 12, gap: 6 },
  explainTitle: { color: '#0891B2', fontSize: 12, fontFamily: 'Inter_700Bold' },
  explainText: { color: '#0C4A6E', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#64748B' },
  fab: { position: 'absolute', right: 16 },
  fabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 24, backgroundColor: '#0891B2', paddingVertical: 12, paddingHorizontal: 20 },
  fabText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
});