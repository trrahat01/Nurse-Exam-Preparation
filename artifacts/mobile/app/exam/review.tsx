import React, { useState } from 'react';
import {
  FlatList, Platform, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useExam } from '@/contexts/ExamContext';
import { OptionButton } from '@/components/OptionButton';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import type { AnswerOption } from '@/lib/types';

type Filter = 'all' | 'correct' | 'wrong' | 'skipped';

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { result, clearExam } = useExam();
  const [filter, setFilter] = useState<Filter>('all');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  if (!result) {
    router.replace('/(tabs)/mock');
    return null;
  }

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
    { key: 'all', label: `All (${questions.length})`, color: colors.primary },
    { key: 'correct', label: `Correct (${result.correct})`, color: '#059669' },
    { key: 'wrong', label: `Wrong (${result.wrong})`, color: '#DC2626' },
    { key: 'skipped', label: `Skipped (${result.skipped})`, color: '#D97706' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter tabs */}
      <View style={[styles.filterBar, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            style={[
              styles.filterBtn,
              filter === f.key
                ? { backgroundColor: f.color + '18', borderColor: f.color }
                : { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.filterText, { color: filter === f.key ? f.color : colors.mutedForeground }]}
              numberOfLines={1}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={q => q.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80, gap: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: q, index }) => {
          const ans = answers[q.id] as AnswerOption | null;
          const isCorrect = ans === q.correct_answer;
          const isSkipped = !ans;
          const optTexts: Record<AnswerOption, string> = {
            a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d,
          };

          return (
            <View style={[styles.qCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.qHeader}>
                <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{questions.indexOf(q) + 1}</Text>
                <DifficultyBadge difficulty={q.difficulty} />
                <View style={[styles.statusBadge, {
                  backgroundColor: isSkipped ? '#FEF3C7' : isCorrect ? '#D1FAE5' : '#FEE2E2',
                }]}>
                  <MaterialCommunityIcons
                    name={isSkipped ? 'minus' : isCorrect ? 'check' : 'close'}
                    size={12}
                    color={isSkipped ? '#D97706' : isCorrect ? '#059669' : '#DC2626'}
                  />
                  <Text style={[styles.statusText, {
                    color: isSkipped ? '#D97706' : isCorrect ? '#059669' : '#DC2626',
                  }]}>
                    {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.qText, { color: colors.foreground }]}>
                {q.question}
              </Text>

              <View style={styles.options}>
                {opts.map(opt => (
                  <OptionButton
                    key={opt}
                    option={opt}
                    text={optTexts[opt]}
                    selected={ans === opt}
                    correctAnswer={q.correct_answer}
                    revealed={true}
                    onPress={() => {}}
                    disabled={true}
                  />
                ))}
              </View>

              {q.explanation && (
                <View style={[styles.explain, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={styles.explainTitle}>Explanation</Text>
                  <Text style={styles.explainText}>{q.explanation}</Text>
                  {q.reference && (
                    <Text style={styles.explainRef}>Ref: {q.reference}</Text>
                  )}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No questions in this filter.</Text>
          </View>
        }
      />

      <View style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.fabBtn, { backgroundColor: colors.primary }]}
          onPress={() => { clearExam(); router.replace('/(tabs)'); }}
        >
          <MaterialCommunityIcons name="home" size={22} color="#fff" />
          <Text style={styles.fabText}>Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: { flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1 },
  filterBtn: { flex: 1, borderRadius: 20, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  filterText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  qCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qNum: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginRight: 'auto' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  qText: { fontSize: 15, fontFamily: 'Inter_500Medium', lineHeight: 22 },
  options: { gap: 8 },
  explain: { borderRadius: 12, padding: 12, gap: 6 },
  explainTitle: { color: '#0891B2', fontSize: 12, fontFamily: 'Inter_700Bold' },
  explainText: { color: '#0C4A6E', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  explainRef: { color: '#64748B', fontSize: 11, fontFamily: 'Inter_400Regular', fontStyle: 'italic' },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  fab: { position: 'absolute', right: 16 },
  fabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 20 },
  fabText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_700Bold' },
});
