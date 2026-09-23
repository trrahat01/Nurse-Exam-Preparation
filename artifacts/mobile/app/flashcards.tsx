import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBookmarkStore, type BookmarkItem } from '@/src/store/bookmarkStore';
import { useAuthStore } from '@/src/store/authStore';
import { fetchBookmarks } from '@/src/lib/queries';

export default function FlashcardsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { bookmarks: localBookmarks, loadBookmarks, loadServerBookmarks } = useBookmarkStore();
  const [cards, setCards] = useState<BookmarkItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Local bookmarks live in AsyncStorage — always (re)load them first so
        // the flashcards are fresh even if the user just bookmarked something.
        await loadBookmarks();
        let items: BookmarkItem[] = localBookmarks;
        if (user?.$id) {
          const server = await fetchBookmarks(user.$id);
          const serverItems: BookmarkItem[] = server.map(b => ({
            id: b.id, question_id: b.question_id, question: b.question!, created_at: b.created_at,
          }));
          loadServerBookmarks(serverItems);
          items = serverItems;
        }
        setCards(items.filter(b => b.question));
        setIndex(0);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [user?.$id]);

  const card = cards[index];

  const optionAnswer = (c: any): string => {
    const map: any = { a: c.option_a, b: c.option_b, c: c.option_c, d: c.option_d };
    return map[c.correct_answer] || '';
  };

  if (loading) {
    return <View style={styles.center}><Text>Loading flashcards...</Text></View>;
  }
  if (!cards.length) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="cards-outline" size={48} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>No Flashcards</Text>
        <Text style={styles.emptySub}>Bookmark questions to turn them into flashcards.</Text>
        <Pressable style={styles.btn} onPress={() => router.back()}><Text style={styles.btnText}>Go Back</Text></Pressable>
      </View>
    );
  }

  const q = card!.question!;
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" /></Pressable>
        <Text style={styles.title}>Flashcards</Text>
        <Text style={styles.count}>{index + 1} / {cards.length}</Text>
      </View>

      <View style={styles.cardOuter}>
        <ScrollView style={styles.card} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.q}>{q.category}</Text>
          <Text style={styles.question}>{q.question}</Text>
          {revealed ? (
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Answer</Text>
              <Text style={styles.answerText}>{optionAnswer(q)}</Text>
              {q.explanation ? <Text style={styles.explanation}>{q.explanation}</Text> : null}
            </View>
          ) : null}
        </ScrollView>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.navBtn} onPress={() => { setIndex(i => Math.max(0, i - 1)); setRevealed(false); }}>
          <MaterialCommunityIcons name="chevron-left" size={26} color="#0891B2" />
        </Pressable>
        <Pressable style={styles.revealBtn} onPress={() => setRevealed(r => !r)}>
          <Text style={styles.revealText}>{revealed ? 'Hide answer' : 'Show answer'}</Text>
        </Pressable>
        <Pressable style={styles.navBtn} onPress={() => { setIndex(i => Math.min(cards.length - 1, i + 1)); setRevealed(false); }}>
          <MaterialCommunityIcons name="chevron-right" size={26} color="#0891B2" />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { flex: 1, fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  count: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#64748B' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B', textAlign: 'center' },
  btn: { backgroundColor: '#0891B2', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
  cardOuter: { flex: 1, marginHorizontal: 16, borderRadius: 18, overflow: 'hidden', elevation: 2, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  card: { flex: 1 },
  q: { color: '#0891B2', fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  question: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E', lineHeight: 26 },
  answerBox: { marginTop: 20, backgroundColor: '#E0F2FE', borderRadius: 12, padding: 16, gap: 6 },
  answerLabel: { color: '#0891B2', fontSize: 12, fontFamily: 'Inter_700Bold' },
  answerText: { color: '#0C4A6E', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  explanation: { color: '#0C4A6E', fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginTop: 6 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 16 },
  navBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20 },
  revealBtn: { flex: 1, backgroundColor: '#0891B2', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  revealText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
});