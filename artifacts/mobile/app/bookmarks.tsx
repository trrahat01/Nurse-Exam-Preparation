import React, { useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { useBookmarkStore } from '@/src/store/bookmarkStore';
import type { Bookmark } from '@/src/types';

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    bookmarks,
    isLoading,
    error,
    loadBookmarks,
    removeBookmark,
    pendingQuestionIds,
  } = useBookmarkStore();

  useEffect(() => {
    if (user?.id) {
      loadBookmarks();
    }
  }, [user?.id]);

  const handleRemove = async (bookmark: Bookmark) => {
    if (pendingQuestionIds[bookmark.question_id]) return;
    await removeBookmark(bookmark.question_id);
  };

  const handleOpenQuestion = (questionId: string) => {
    router.push({ pathname: '/exam', params: { questionId } });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" />
        </Pressable>
        <Text style={styles.title}>Bookmarks</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0891B2" />
          <Text style={styles.loadingText}>Loading bookmarks...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Failed to Load Bookmarks</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => loadBookmarks()}>
            <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons name="bookmark-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
          <Text style={styles.emptySub}>Bookmark questions during practice to review them later.</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
          renderItem={({ item }) => {
            const isPending = !!pendingQuestionIds[item.question_id];
            return (
              <View style={styles.card}>
                <Pressable
                  style={styles.cardContent}
                  onPress={() => handleOpenQuestion(item.question_id)}
                >
                  <Text style={styles.cardTitle} numberOfLines={3}>
                    {item.question?.question ?? 'Question'}
                  </Text>
                  {item.question?.category ? (
                    <Text style={styles.cardCat}>{item.question.category}</Text>
                  ) : null}
                </Pressable>
                <Pressable
                  style={[styles.removeBtn, isPending && styles.disabledBtn]}
                  onPress={() => handleRemove(item)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <MaterialCommunityIcons name="bookmark-remove" size={20} color="#EF4444" />
                  )}
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80, paddingHorizontal: 40 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B' },
  errorTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  errorSub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#EF4444', textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0891B2', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, marginTop: 8 },
  retryText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 12 },
  cardContent: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#0C1A2E', lineHeight: 20 },
  cardCat: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#0891B2' },
  removeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  disabledBtn: { opacity: 0.5 },
});
