import React, { useState } from 'react';
import {
  ActivityIndicator, FlatList, Platform, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks, useToggleBookmark } from '@/lib/queries';
import { OptionButton } from '@/components/OptionButton';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import type { AnswerOption, Bookmark } from '@/lib/types';

export default function BookmarksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: bookmarks, isLoading } = useBookmarks(user?.id);
  const { mutate: toggle } = useToggleBookmark();
  const [expanded, setExpanded] = useState<string | null>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const opts: AnswerOption[] = ['a', 'b', 'c', 'd'];

  const renderBookmark = ({ item }: { item: Bookmark }) => {
    const q = item.question;
    if (!q) return null;
    const isExpanded = expanded === item.id;

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.meta}>
            <Text style={[styles.category, { color: colors.primary }]}>{q.subcategory}</Text>
            <DifficultyBadge difficulty={q.difficulty} />
          </View>
          <MaterialCommunityIcons
            name="bookmark"
            size={20}
            color={colors.accent}
            onPress={() => toggle({ userId: user!.id, questionId: q.id, isBookmarked: true })}
          />
        </View>

        <Text
          style={[styles.question, { color: colors.foreground }]}
          numberOfLines={isExpanded ? undefined : 2}
          onPress={() => setExpanded(isExpanded ? null : item.id)}
        >
          {q.question}
        </Text>

        {!isExpanded && (
          <Text style={[styles.expand, { color: colors.primary }]} onPress={() => setExpanded(item.id)}>
            Show answer
          </Text>
        )}

        {isExpanded && (
          <>
            <View style={styles.options}>
              {opts.map(opt => (
                <OptionButton
                  key={opt}
                  option={opt}
                  text={q[`option_${opt}` as 'option_a']}
                  selected={opt === q.correct_answer}
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
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="bookmark-outline" size={64} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in Required</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Sign in to save and view bookmarked questions.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.list, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80, gap: 12 }}
      data={bookmarks}
      keyExtractor={b => b.id}
      renderItem={renderBookmark}
      ListEmptyComponent={
        <View style={styles.emptyInner}>
          <MaterialCommunityIcons name="bookmark-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Bookmarks</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Bookmark questions during practice to review them here.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyInner: { padding: 32, alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  category: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  question: { fontSize: 15, fontFamily: 'Inter_500Medium', lineHeight: 22 },
  expand: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  options: { gap: 8 },
  explain: { borderRadius: 10, padding: 12, gap: 4 },
  explainTitle: { color: '#0891B2', fontSize: 12, fontFamily: 'Inter_700Bold' },
  explainText: { color: '#0C4A6E', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
});
