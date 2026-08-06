import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';
import { fetchDailyQuestions } from '@/src/lib/queries';

export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const { startExam } = useExamStore();
  const [loading, setLoading] = useState<20 | 50 | 100 | 'challenge' | null>(null);

  const startDaily = async (count: 20 | 50 | 100) => {
    setLoading(count);
    try {
      const questions = await fetchDailyQuestions(count);
      if (!questions.length) {
        Alert.alert('No Questions', 'No questions found in the database yet.');
        return;
      }
      const examType = count === 20 ? 'daily_20' : count === 50 ? 'daily_50' : 'daily_100';
      startExam(questions.slice(0, count), examType, count * 60);
      router.push('/exam');
    } catch {
      Alert.alert('Error', 'Failed to start daily practice.');
    } finally {
      setLoading(null);
    }
  };

  const startChallenge = async () => {
    setLoading('challenge');
    try {
      const questions = await fetchDailyQuestions(20);
      if (!questions.length) {
        Alert.alert('No Questions', 'No questions found in the database yet.');
        return;
      }
      startExam(questions.slice(0, 20), 'challenge', 20 * 60);
      router.push('/exam');
    } catch {
      Alert.alert('Error', 'Failed to start daily challenge.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" />
        </Pressable>
        <Text style={styles.title}>Daily Practice</Text>
      </View>
      <View style={styles.content}>
        <Pressable style={styles.card} onPress={() => startDaily(20)} disabled={loading !== null}>
          {loading === 20 ? <ActivityIndicator color="#0891B2" /> : <MaterialCommunityIcons name="numeric-1-box-outline" size={32} color="#0891B2" />}
          <View><Text style={styles.cardTitle}>Quick Practice</Text><Text style={styles.cardSub}>20 Random Questions</Text></View>
        </Pressable>
        <Pressable style={styles.card} onPress={() => startDaily(50)} disabled={loading !== null}>
          {loading === 50 ? <ActivityIndicator color="#059669" /> : <MaterialCommunityIcons name="numeric-2-box-outline" size={32} color="#059669" />}
          <View><Text style={styles.cardTitle}>Medium Practice</Text><Text style={styles.cardSub}>50 Random Questions</Text></View>
        </Pressable>
        <Pressable style={styles.card} onPress={() => startDaily(100)} disabled={loading !== null}>
          {loading === 100 ? <ActivityIndicator color="#D97706" /> : <MaterialCommunityIcons name="numeric-3-box-outline" size={32} color="#D97706" />}
          <View><Text style={styles.cardTitle}>Full Practice</Text><Text style={styles.cardSub}>100 Random Questions</Text></View>
        </Pressable>
        <Pressable style={styles.card} onPress={startChallenge} disabled={loading !== null}>
          {loading === 'challenge' ? <ActivityIndicator color="#7C3AED" /> : <MaterialCommunityIcons name="trophy-outline" size={32} color="#7C3AED" />}
          <View><Text style={styles.cardTitle}>Daily Challenge</Text><Text style={styles.cardSub}>Complete today's challenge</Text></View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  content: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 20, gap: 16 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  cardSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 2 },
});