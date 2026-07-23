import React from 'react';
import {
  ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useExam } from '@/contexts/ExamContext';
import { useDailyQuestions } from '@/lib/queries';

const MODES = [
  { count: 20, label: '20 Questions', time: '20 Minutes', icon: 'lightning-bolt', color: '#059669', bg: '#D1FAE5', type: 'daily_20' as const },
  { count: 50, label: '50 Questions', time: '50 Minutes', icon: 'fire', color: '#D97706', bg: '#FEF3C7', type: 'daily_50' as const },
  { count: 100, label: '100 Questions', time: '100 Minutes', icon: 'trophy', color: '#7C3AED', bg: '#EDE9FE', type: 'daily_100' as const },
];

export default function DailyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { startExam } = useExam();
  const { refetch, isFetching } = useDailyQuestions(100);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleStart = async (count: number, type: typeof MODES[0]['type']) => {
    const { data } = await refetch();
    const qs = data?.slice(0, count) ?? [];
    if (qs.length === 0) {
      Alert.alert('No Questions', 'No questions available. Please import questions first.');
      return;
    }
    if (qs.length < count) {
      Alert.alert('Limited Questions', `Only ${qs.length} questions available.`);
    }
    startExam(qs, type, count * 60);
    router.push('/exam');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#059669', '#0891B2']}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <MaterialCommunityIcons name="calendar-star" size={40} color="rgba(255,255,255,0.9)" />
        <Text style={styles.title}>Daily Practice</Text>
        <Text style={styles.sub}>Choose your challenge for today</Text>
      </LinearGradient>

      <View style={styles.content}>
        {MODES.map(mode => (
          <Pressable
            key={mode.type}
            style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleStart(mode.count, mode.type)}
            disabled={isFetching}
          >
            <View style={[styles.modeIcon, { backgroundColor: mode.bg }]}>
              <MaterialCommunityIcons name={mode.icon as any} size={28} color={mode.color} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeName, { color: colors.foreground }]}>{mode.label}</Text>
              <Text style={[styles.modeTime, { color: colors.mutedForeground }]}>{mode.time} • Random topics</Text>
            </View>
            {isFetching ? (
              <ActivityIndicator color={mode.color} size="small" />
            ) : (
              <View style={[styles.startChip, { backgroundColor: mode.bg }]}>
                <Text style={[styles.startChipText, { color: mode.color }]}>Start</Text>
                <MaterialCommunityIcons name="arrow-right" size={14} color={mode.color} />
              </View>
            )}
          </Pressable>
        ))}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Questions are randomly selected from all categories. No timer penalty — practice at your own pace.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingBottom: 36, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 8 },
  title: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold' },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontFamily: 'Inter_400Regular' },
  content: { padding: 16, gap: 14, marginTop: 8 },
  modeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  modeIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modeInfo: { flex: 1, gap: 4 },
  modeName: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  modeTime: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  startChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  startChipText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  infoCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 14, gap: 10, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
});
