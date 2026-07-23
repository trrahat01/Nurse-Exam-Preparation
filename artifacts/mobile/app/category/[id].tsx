import React from 'react';
import {
  ActivityIndicator, FlatList, StyleSheet, Text, View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useExam } from '@/contexts/ExamContext';
import { useSubcategoryQuestions } from '@/lib/queries';
import { CATEGORY_CONFIG } from '@/lib/types';
import { ChapterItem } from '@/components/ChapterItem';

export default function CategoryScreen() {
  const { id, chapter, category } = useLocalSearchParams<{
    id: string;
    chapter?: string;
    category?: string;
  }>();
  const colors = useColors();
  const { startExam } = useExam();

  const catName = (category || id) as string;
  const cfg = CATEGORY_CONFIG[catName];
  const chapters = cfg?.chapters ?? [];

  // If a specific chapter was requested, go directly to practice
  const { data: chapterQuestions, isLoading } = useSubcategoryQuestions(
    chapter ? chapter as string : ''
  );

  const handleChapterPress = (chapterName: string) => {
    router.push({
      pathname: '/category/[id]',
      params: { id: catName, chapter: chapterName, category: catName },
    });
  };

  // If a chapter param is set, show practice mode
  if (chapter && chapterQuestions) {
    if (chapterQuestions.length === 0) {
      return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Questions</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No questions found for "{chapter}". Import questions via the admin panel.
          </Text>
        </View>
      );
    }
    startExam(chapterQuestions, 'practice', 0);
    router.push('/exam');
    return null;
  }

  if (chapter && isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={cfg?.color ?? colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.list, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
      data={chapters}
      keyExtractor={item => item}
      ListHeaderComponent={
        cfg ? (
          <View style={[styles.banner, { backgroundColor: cfg.bgColor }]}>
            <Text style={[styles.bannerTitle, { color: cfg.color }]}>{cfg.name}</Text>
            <Text style={[styles.bannerSub, { color: cfg.color + 'AA' }]}>
              {chapters.length} chapters available
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item, index }) => (
        <ChapterItem
          name={item}
          index={index}
          accentColor={cfg?.color ?? colors.primary}
          onPress={() => handleChapterPress(item)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Chapters</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No chapters configured for this category.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  banner: { borderRadius: 16, padding: 16, marginBottom: 4, gap: 4 },
  bannerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  bannerSub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  emptyBox: { padding: 32, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
});
