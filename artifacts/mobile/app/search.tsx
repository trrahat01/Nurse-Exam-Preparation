import React, { useState } from 'react';
import {
  ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text,
  TextInput, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSearchQuestions } from '@/lib/queries';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import type { Question, AnswerOption } from '@/lib/types';

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: results, isLoading, isFetching } = useSearchQuestions(query);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const opts: AnswerOption[] = ['a', 'b', 'c', 'd'];
  const LABEL: Record<AnswerOption, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

  const renderResult = ({ item: q }: { item: Question }) => {
    const isExpanded = expanded === q.id;
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.meta}>
          <Text style={[styles.cat, { color: colors.primary }]}>{q.subcategory || q.category}</Text>
          <DifficultyBadge difficulty={q.difficulty} />
        </View>
        <Pressable onPress={() => setExpanded(isExpanded ? null : q.id)}>
          <Text style={[styles.question, { color: colors.foreground }]}>{q.question}</Text>
        </Pressable>
        {isExpanded ? (
          <View style={styles.optList}>
            {opts.map(opt => {
              const isCorrect = opt === q.correct_answer;
              return (
                <View
                  key={opt}
                  style={[
                    styles.optRow,
                    { backgroundColor: isCorrect ? '#D1FAE5' : colors.secondary, borderColor: isCorrect ? '#059669' : colors.border },
                  ]}
                >
                  <View style={[styles.optLabel, { backgroundColor: isCorrect ? '#059669' : colors.muted }]}>
                    <Text style={[styles.optLabelText, { color: isCorrect ? '#fff' : colors.mutedForeground }]}>
                      {LABEL[opt]}
                    </Text>
                  </View>
                  <Text style={[styles.optText, { color: colors.foreground }]} numberOfLines={2}>
                    {q[`option_${opt}` as 'option_a']}
                  </Text>
                  {isCorrect && (
                    <MaterialCommunityIcons name="check-circle" size={16} color="#059669" />
                  )}
                </View>
              );
            })}
            {q.explanation ? (
              <View style={[styles.explain, { backgroundColor: '#E0F2FE' }]}>
                <Text style={styles.explainTitle}>Explanation</Text>
                <Text style={styles.explainText}>{q.explanation}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={[styles.showAnswer, { color: colors.primary }]}>
            Tap to see answer
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search questions..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {isFetching ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={q => q.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 80 }}
          renderItem={renderResult}
          ListEmptyComponent={
            query.length > 2 && !isLoading ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="magnify" size={48} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Results</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No questions found for "{query}"
                </Text>
              </View>
            ) : query.length <= 2 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="text-search" size={48} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Type at least 3 characters to search
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', padding: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cat: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  question: { fontSize: 15, fontFamily: 'Inter_500Medium', lineHeight: 22 },
  showAnswer: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  optList: { gap: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 10, gap: 10 },
  optLabel: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  optLabelText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  optText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  explain: { borderRadius: 10, padding: 12, gap: 4 },
  explainTitle: { color: '#0891B2', fontSize: 12, fontFamily: 'Inter_700Bold' },
  explainText: { color: '#0C4A6E', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  empty: { padding: 32, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
