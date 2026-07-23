import React from 'react';
import {
  ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import { useMockQuestions, useMockResults, useDailyQuestions } from '@/lib/queries';
import { MOCK_DISTRIBUTION } from '@/lib/types';

export default function MockScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();
  const { startExam } = useExam();
  const { refetch: fetchMock, isFetching: mockFetching } = useMockQuestions();
  const { refetch: fetchDaily, isFetching: dailyFetching } = useDailyQuestions(20);
  const { data: results } = useMockResults(user?.id);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const startMock = async () => {
    const { data } = await fetchMock();
    if (!data || data.length === 0) {
      Alert.alert('No Questions', 'No questions found in database. Please import questions first.');
      return;
    }
    startExam(data, 'mock', 3600);
    router.push('/exam');
  };

  const startDaily = async (count: 20 | 50 | 100, type: 'daily_20' | 'daily_50' | 'daily_100') => {
    const { data } = await fetchDaily();
    if (!data || data.length === 0) {
      Alert.alert('No Questions', 'No questions found in database.');
      return;
    }
    startExam(data.slice(0, count), type, count * 60);
    router.push('/exam');
  };

  const mockResults = results?.filter(r => r.exam_type === 'mock') ?? [];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 16 }} />

      {/* Full Mock Test Card */}
      <View style={styles.mainCard}>
        <LinearGradient colors={['#0C4A6E', '#0891B2']} style={styles.gradient}>
          <MaterialCommunityIcons name="clipboard-text" size={48} color="rgba(255,255,255,0.8)" />
          <Text style={styles.mockTitle}>Full Mock Test</Text>
          <Text style={styles.mockSub}>BPSC Exam Pattern • 100 Questions • 60 Minutes</Text>

          <View style={styles.distRow}>
            {Object.entries(MOCK_DISTRIBUTION).map(([cat, count]) => (
              <View key={cat} style={styles.distItem}>
                <Text style={styles.distNum}>{count}</Text>
                <Text style={styles.distCat} numberOfLines={1}>{cat.length > 9 ? cat.split(' ')[0] : cat}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={startMock}
            disabled={mockFetching}
          >
            {mockFetching ? (
              <ActivityIndicator color="#0891B2" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="play-circle" size={20} color="#0891B2" />
                <Text style={styles.startBtnText}>Start Mock Test</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {/* Daily Practice */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Practice</Text>
        <View style={styles.dailyRow}>
          {([
            { count: 20, label: '20 Qs', time: '20 min', type: 'daily_20' },
            { count: 50, label: '50 Qs', time: '50 min', type: 'daily_50' },
            { count: 100, label: '100 Qs', time: '100 min', type: 'daily_100' },
          ] as const).map(item => (
            <TouchableOpacity
              key={item.count}
              style={[styles.dailyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => startDaily(item.count as any, item.type)}
              disabled={dailyFetching}
            >
              <Text style={[styles.dailyLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.dailyTime, { color: colors.mutedForeground }]}>{item.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exam Rules */}
        <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.rulesTitle, { color: colors.foreground }]}>Exam Rules</Text>
          {[
            ['checkmark-circle', 'Exactly 100 questions from all 4 subjects', colors.success],
            ['timer', '60 minutes time limit — cannot pause', '#D97706'],
            ['shuffle', 'Questions randomly selected every time', colors.primary],
            ['arrow-left-right', 'Previous/Next navigation allowed', colors.foreground],
            ['flag', 'Mark questions for review', colors.warning],
            ['auto-upload', 'Auto-submits when time expires', colors.destructive],
          ].map(([icon, text, color]) => (
            <View key={text as string} style={styles.ruleRow}>
              <MaterialCommunityIcons name={icon as any} size={16} color={color as string} />
              <Text style={[styles.ruleText, { color: colors.mutedForeground }]}>{text as string}</Text>
            </View>
          ))}
        </View>

        {/* Recent Mock History */}
        {mockResults.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Mock Tests</Text>
            {mockResults.slice(0, 5).map(r => (
              <View key={r.id} style={[styles.histRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.histBadge, { backgroundColor: r.percentage >= 50 ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={[styles.histPct, { color: r.percentage >= 50 ? '#059669' : '#EF4444' }]}>
                    {r.percentage}%
                  </Text>
                </View>
                <View style={styles.histInfo}>
                  <Text style={[styles.histScore, { color: colors.foreground }]}>
                    {r.correct}/{r.correct + r.wrong + r.skipped} Correct
                  </Text>
                  <Text style={[styles.histDate, { color: colors.mutedForeground }]}>
                    {new Date(r.created_at).toLocaleDateString('en-BD')} • {Math.floor(r.time_taken / 60)}m {r.time_taken % 60}s
                  </Text>
                </View>
                <Text style={[styles.histStatus, { color: r.percentage >= 50 ? '#059669' : '#EF4444' }]}>
                  {r.percentage >= 50 ? 'Pass' : 'Fail'}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  mainCard: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  gradient: { padding: 24, alignItems: 'center', gap: 10 },
  mockTitle: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold' },
  mockSub: { color: '#BAE6FD', fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  distRow: { flexDirection: 'row', gap: 0, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, width: '100%' },
  distItem: { flex: 1, alignItems: 'center' },
  distNum: { color: '#fff', fontSize: 20, fontFamily: 'Inter_700Bold' },
  distCat: { color: '#BAE6FD', fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2, textAlign: 'center' },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 4 },
  startBtnText: { color: '#0891B2', fontSize: 16, fontFamily: 'Inter_700Bold' },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginTop: 8 },
  dailyRow: { flexDirection: 'row', gap: 10 },
  dailyBtn: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, gap: 4 },
  dailyLabel: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  dailyTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  rulesCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  rulesTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  histRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  histBadge: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  histPct: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  histInfo: { flex: 1 },
  histScore: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  histDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  histStatus: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
