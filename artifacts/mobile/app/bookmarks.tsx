import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { useBookmarkStore } from '@/src/store/bookmarkStore';
import { fetchBookmarks, toggleBookmark } from '@/src/lib/queries';
import type { Bookmark } from '@/src/types';
import type { BookmarkItem } from '@/src/store/bookmarkStore';

type CombinedBookmark = Bookmark | BookmarkItem;

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { bookmarks: localBookmarks, serverBookmarks, loadServerBookmarks, loadBookmarks, removeBookmark } = useBookmarkStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
    if (user?.id) {
      refreshServerBookmarks();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshServerBookmarks = async () => {
    setLoading(true);
    try {
      if (!user?.id) { loadServerBookmarks([]); return; }
      const data = await fetchBookmarks(user.id);
      // Convert server Bookmark to BookmarkItem format
      const items: BookmarkItem[] = data.map(b => ({
        id: b.id,
        question_id: b.question_id,
        question: b.question!,
        created_at: b.created_at,
      })).filter(b => b.question);
      loadServerBookmarks(items);
    } catch {
      loadServerBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookmark: CombinedBookmark) => {
    if (user?.id) {
      await toggleBookmark(user.id, bookmark.question_id, true);
      loadServerBookmarks(serverBookmarks.filter(b => b.id !== bookmark.id));
    } else {
      await removeBookmark(bookmark.question_id);
    }
  };

  const handleOpenQuestion = (questionId: string) => {
    router.push({ pathname: '/exam', params: { questionId } });
  };

  // Combine local and server bookmarks
  const allBookmarks = [
    ...serverBookmarks,
    ...localBookmarks.filter(lb => !serverBookmarks.some(sb => sb.question_id === lb.question_id)),
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" />
        </Pressable>
        <Text style={styles.title}>Bookmarks</Text>
      </View>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#0891B2" />
        </View>
      ) : allBookmarks.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bookmark-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
          <Text style={styles.emptySub}>Bookmark questions during practice to review them later.</Text>
        </View>
      ) : (
        <FlatList
          data={allBookmarks}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.cardContent}
                onPress={() => handleOpenQuestion(item.question_id)}
              >
                <Text style={styles.cardTitle} numberOfLines={3}>{item.question?.question ?? 'Question'}</Text>
                <Text style={styles.cardCat}>{item.question?.category ?? ''}</Text>
              </Pressable>
              <Pressable style={styles.removeBtn} onPress={() => handleRemove(item)}>
                <MaterialCommunityIcons name="bookmark-remove" size={20} color="#EF4444" />
              </Pressable>
            </View>
          )}
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 12 },
  cardContent: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#0C1A2E', lineHeight: 20 },
  cardCat: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#0891B2' },
  removeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
});