import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { useLocalSearchParams, router } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';
import { useSubcategoryQuestions, fetchCategoryQuestionStats } from '@/lib/queries';
import { useAuthStore } from '@/src/store/authStore';
import { CATEGORY_CONFIG } from '@/src/types';

export default function CategoryScreen() {
  const { id, chapter } = useLocalSearchParams<{ id: string; chapter?: string }>();
  const { startExam } = useExamStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Record<string, { total: number; seen: number; unseen: number }>>({});
  const isAttemptInProgress = useRef(false);
  const isFocused = useRef(false);
  const attemptGeneration = useRef(0);
  const [fetchError, setFetchError] = useState(false);

  const catName = id as string;
  const cfg = CATEGORY_CONFIG[catName];
  const chapters = cfg?.chapters ?? [];

  const { data: questions, refetch, isLoading, isFetching, error } = useSubcategoryQuestions(
    String(chapter),
    user?.id
  );

  const runAttempt = useCallback(async () => {
    if (!chapter || isAttemptInProgress.current) return;
    isAttemptInProgress.current = true;
    setFetchError(false);
    attemptGeneration.current++;
    const generation = attemptGeneration.current;

    try {
      const result = await refetch();
      if (!isFocused.current || attemptGeneration.current !== generation) return;

      if (result.isSuccess && result.data && result.data.length > 0) {
        startExam(result.data, 'practice');
        router.replace('/exam');
      } else if (result.isSuccess && (!result.data || result.data.length === 0)) {
        Alert.alert('Notice', 'No questions available for this chapter.');
      } else if (result.isError) {
        setFetchError(true);
      }
    } catch (e) {
      if (!isFocused.current || attemptGeneration.current !== generation) return;
      setFetchError(true);
    } finally {
      if (attemptGeneration.current === generation) {
        isAttemptInProgress.current = false;
      }
    }
  }, [chapter, refetch, startExam]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      runAttempt();

      return () => {
        isFocused.current = false;
        attemptGeneration.current++;
        isAttemptInProgress.current = false;
      };
    }, [runAttempt])
  );

  useEffect(() => {
    fetchCategoryQuestionStats().then(setStats).catch(() => setStats({}));
  }, [catName]);

  const handleChapterPress = (chapterName: string) => {
    router.push({
      pathname: '/category/[id]',
      params: { id: catName, chapter: chapterName },
    });
  };

  if (fetchError) {
    return (
      <View style={styles.loadingBox}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.loadingText}>Failed to load chapter practice.</Text>
        <Pressable style={styles.retryButton} onPress={runAttempt}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (isLoading || isFetching) && chapter ? (
    <View style={styles.loadingBox}>
      <ActivityIndicator size="large" color="#0891B2" />
      <Text style={styles.loadingText}>Loading chapter practice...</Text>
    </View>
  ) : (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
      data={chapters}
      keyExtractor={item => item}
      ListHeaderComponent={
        cfg ? (
          <View style={[styles.banner, { backgroundColor: cfg.bgColor }]}>
            <View style={[styles.iconBox, { backgroundColor: cfg.color + '20' }]}>
              <MaterialCommunityIcons name={cfg.icon as any} size={28} color={cfg.color} />
            </View>
            <Text style={[styles.bannerTitle, { color: cfg.color }]}>{cfg.name}</Text>
            <Text style={[styles.bannerSub, { color: cfg.color + 'AA' }]}>
              {chapters.length} chapters available
            </Text>
            <Text style={[styles.bannerSub, { color: cfg.color + 'AA' }]}>
              {stats[catName]?.total ? `${stats[catName].total.toLocaleString()} total questions · ${stats[catName].unseen.toLocaleString()} new` : 'Loading question counts...'}
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item, index }) => (
        <Pressable style={styles.chapterCard} onPress={() => handleChapterPress(item)}>
          <View style={[styles.chapterNum, { backgroundColor: cfg?.color + '15' }]}>
            <Text style={[styles.chapterNumText, { color: cfg?.color }]}>{index + 1}</Text>
          </View>
          <View style={styles.chapterInfo}>
            <Text style={styles.chapterName}>{item}</Text>
            <Text style={styles.chapterSub}>Tap to practice</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
        </Pressable>
      )}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Chapters</Text>
          <Text style={styles.emptyText}>No chapters configured for this category.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#F8FAFC' },
  banner: { borderRadius: 16, padding: 20, marginBottom: 4, gap: 8 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  bannerSub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  chapterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 14 },
  chapterNum: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chapterNumText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  chapterInfo: { flex: 1, gap: 2 },
  chapterName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  chapterSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
  emptyBox: { padding: 32, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 24 },
  loadingText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E', textAlign: 'center' },
  retryButton: { backgroundColor: '#0891B2', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  retryButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
