import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useExamStore } from '@/src/store/examStore';
import { fetchMockQuestions, fetchDailyQuestions } from '@/src/lib/queries';
import { MOCK_DISTRIBUTION } from '@/src/types';

export default function MockScreen() {
  const insets = useSafeAreaInsets();
  const { startExam, savedResults } = useExamStore();
  const [mockLoading, setMockLoading] = useState(false);
  const [dailyLoading, setDailyLoading] = useState<'20' | '50' | '100' | null>(null);

  const mockResults = savedResults.filter(r => r.examType === 'mock');

  const startMock = async () => {
    setMockLoading(true);
    try {
      const questions = await fetchMockQuestions();
      if (!questions || questions.length === 0) {
        Alert.alert('No Questions', 'No questions found in database. Import questions first.');
        return;
      }
      startExam(questions, 'mock');
      router.push('/exam');
    } catch (e) {
      Alert.alert('Error', 'Failed to load questions');
    } finally {
      setMockLoading(false);
    }
  };

  const startDaily = async (count: 20 | 50 | 100) => {
    setDailyLoading(String(count) as any);
    try {
      const questions = await fetchDailyQuestions(count);
      if (!questions || questions.length === 0) {
        Alert.alert('No Questions', 'No questions found in database.');
        return;
      }
      const type = count === 20 ? 'daily_20' as const : count === 50 ? 'daily_50' as const : 'daily_100' as const;
      startExam(questions.slice(0, count), type, count * 60);
      router.push('/exam');
    } catch (e) {
      Alert.alert('Error', 'Failed to load questions');
    } finally {
      setDailyLoading(null);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: insets.top + 16 }} />

      <View style={styles.mainCard}>
        <View style={[styles.gradient, { backgroundColor: '#0891B2' }]}>
          <MaterialCommunityIcons name="clipboard-text" size={48} color="rgba(255,255,255,0.8)" />
          <Text style={styles.mockTitle}>Full Mock Test</Text>
          <Text style={styles.mockSub}>Nursing Exam Pattern • 100 Questions • 60 Minutes</Text>
          <View style={styles.distRow}>
            {Object.entries(MOCK_DISTRIBUTION).map(([cat, count]) => (
              <View key={cat} style={styles.distItem}>
                <Text style={styles.distNum}>{count}</Text>
                <Text style={styles.distCat} numberOfLines={1}>{cat.length > 9 ? cat.split(' ')[0] : cat}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.startBtn} onPress={startMock} disabled={mockLoading}>
            {mockLoading ? <ActivityIndicator color="#0891B2" /> : <><MaterialCommunityIcons name="play-circle" size={20} color="#0891B2" /><Text style={styles.startBtnText}>Start Mock Test</Text></>}
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Daily Practice</Text>
        <View style={styles.dailyRow}>
          {([{ count: 20, label: '20 Qs', time: '20 min' }, { count: 50, label: '50 Qs', time: '50 min' }, { count: 100, label: '100 Qs', time: '100 min' }]).map(item => (
            <Pressable key={item.count} style={styles.dailyBtn} onPress={() => startDaily(item.count as any)} disabled={dailyLoading === String(item.count)}>
              {dailyLoading === String(item.count) ? <ActivityIndicator color="#0891B2" /> : <><Text style={styles.dailyLabel}>{item.label}</Text><Text style={styles.dailyTime}>{item.time}</Text></>}
            </Pressable>
          ))}
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Exam Rules</Text>
          {[
            ['check-circle-outline', 'Exactly 100 questions from all 4 subjects', '#10B981'],
            ['timer', '60 minutes time limit — cannot pause', '#D97706'],
            ['shuffle', 'Questions randomly selected every time', '#0891B2'],
            ['flag', 'Mark questions for review', '#F59E0B'],
            ['auto-upload', 'Auto-submits when time expires', '#EF4444'],
          ].map(([icon, text, color]) => (
            <View key={text} style={styles.ruleRow}>
              <MaterialCommunityIcons name={icon as any} size={16} color={color} />
              <Text style={styles.ruleText}>{text}</Text>
            </View>
          ))}
        </View>

        {mockResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Mock Tests</Text>
            {mockResults.slice(0, 5).map((r, i) => (
              <View key={i} style={styles.histRow}>
                <View style={[styles.histBadge, { backgroundColor: r.percentage >= 50 ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={[styles.histPct, { color: r.percentage >= 50 ? '#059669' : '#EF4444' }]}>{r.percentage}%</Text>
                </View>
                <View style={styles.histInfo}>
                  <Text style={styles.histScore}>{r.correct}/{r.questions.length} Correct</Text>
                  <Text style={styles.histDate}>{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</Text>
                </View>
                <Text style={[styles.histStatus, { color: r.percentage >= 50 ? '#059669' : '#EF4444' }]}>{r.percentage >= 50 ? 'Pass' : 'Fail'}</Text>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  mainCard: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', elevation: 6 },
  gradient: { padding: 24, alignItems: 'center', gap: 10 },
  mockTitle: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold' },
  mockSub: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  distRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, width: '100%' },
  distItem: { flex: 1, alignItems: 'center' },
  distNum: { color: '#fff', fontSize: 20, fontFamily: 'Inter_700Bold' },
  distCat: { color: '#BAE6FD', fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2, textAlign: 'center' },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 4 },
  startBtnText: { color: '#0891B2', fontSize: 16, fontFamily: 'Inter_700Bold' },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#0C1A2E', marginTop: 8 },
  dailyRow: { flexDirection: 'row', gap: 10 },
  dailyBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  dailyLabel: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  dailyTime: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#64748B' },
  rulesCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 12 },
  rulesTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#0C1A2E', marginBottom: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#64748B', flex: 1 },
  histRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 12 },
  histBadge: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  histPct: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  histInfo: { flex: 1 },
  histScore: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  histDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
  histStatus: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
