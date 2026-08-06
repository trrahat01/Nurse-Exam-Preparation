import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { searchQuestions } from '@/src/lib/queries';
import { useExamStore } from '@/src/store/examStore';
import type { Question } from '@/src/types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { startExam } = useExamStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim().length < 2) { setResults([]); return; }
      setLoading(true);
      searchQuestions(query.trim()).then(res => { setResults(res); setLoading(false); }).catch(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handleOpenQuestion = (question: Question) => {
    // Start a practice exam with just this question so the exam screen can display it
    startExam([question], 'practice');
    router.push('/exam');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={22} color="#64748B" />
        <TextInput
          style={styles.input}
          placeholder="Search questions..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        {query ? <Pressable onPress={() => setQuery('')}><MaterialCommunityIcons name="close-circle" size={20} color="#64748B" /></Pressable> : null}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#0891B2" /></View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 10 }}
          data={results}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>{query.trim().length < 2 ? 'Type at least 2 characters' : 'No results found'}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => handleOpenQuestion(item)}>
              <Text style={styles.cardTitle}>{item.question}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardCat}>{item.category}</Text>
                <Text style={styles.cardDiff}>{item.difficulty}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, height: 52 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#0C1A2E' },
  list: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B' },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 8 },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#0C1A2E', lineHeight: 20 },
  cardMeta: { flexDirection: 'row', gap: 8 },
  cardCat: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#0891B2' },
  cardDiff: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
});