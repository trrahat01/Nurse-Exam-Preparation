import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeStore } from '@/src/store/themeStore';
import { useColors } from '@/hooks/useColors';
import { clearQuestionHistory } from '@/src/lib/queries';
import { getNotificationPref, setNotificationPref, scheduleDailyReminder, scheduleStreakReminder, cancelDailyReminder } from '@/src/lib/notifications';
import { getStreak } from '@/src/lib/streak';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = colors.scheme === 'dark';
  const { theme, setTheme } = useThemeStore();
  const [notifOn, setNotifOn] = React.useState<boolean>(true);

  React.useEffect(() => { getNotificationPref().then(setNotifOn); }, []);

  const handleToggleNotifications = async (on: boolean) => {
    setNotifOn(on);
    await setNotificationPref(on);
    if (on) {
      const streak = await getStreak();
      await scheduleDailyReminder();
      await scheduleStreakReminder(streak.current);
      Alert.alert('Daily Reminder On', 'We\u2019ll remind you to practice every day at 8:00 PM so you keep your streak!');
    } else {
      await cancelDailyReminder();
      Alert.alert('Daily Reminder Off', 'You can turn it back on anytime in Settings.');
    }
  };

  const handleResetSeen = () => {
    Alert.alert(
      'Reset Seen Questions',
      'This will allow previously seen questions to appear again in your exams. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearQuestionHistory();
            Alert.alert('Done', 'Question history has been reset. You may now see previously answered questions again.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Device</Text>
        <View style={[styles.card, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="cellphone-check" size={22} color="#0891B2" />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Progress saved on this device</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>No account needed — your streaks, results, bookmarks and settings stay on your device.</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Study Tools</Text>
        <View style={[styles.card, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]}>
          <Pressable style={styles.row} onPress={handleResetSeen}>
            <MaterialCommunityIcons name="refresh" size={22} color="#D97706" />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Reset Seen Questions</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Allow old questions to appear again</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Preferences</Text>
        <View style={[styles.card, { backgroundColor: isDark ? colors.card : '#fff', borderColor: colors.border }]}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#64748B" />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Daily Reminder</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Get a nudge at 8 PM to keep your streak</Text>
            </View>
            <Switch
              value={notifOn}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: '#0891B2' }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: isDark ? colors.border : '#F1F5F9' }]} />
          <View style={styles.row}>
            <MaterialCommunityIcons name="theme-light-dark" size={22} color="#64748B" />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{isDark ? 'Dark theme enabled' : 'Light theme'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: '#0891B2' }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: isDark ? colors.border : '#F1F5F9' }]} />
          <Pressable style={styles.row} onPress={() => router.push('/reading')}>
            <MaterialCommunityIcons name="book-open-variant" size={22} color="#059669" />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Reading Mode</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Study notes with adjustable text size</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? colors.border : '#F1F5F9' }]} />
          <Pressable style={styles.row} onPress={() => router.push('/about')}>
            <MaterialCommunityIcons name="information-outline" size={22} color="#64748B" />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Disclaimer & Sources</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Independent app disclaimer, official sources & support</Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>v{Constants.expoConfig?.version ?? '1.6.0'}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  section: { marginBottom: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#64748B', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_500Medium', color: '#0C1A2E' },
  rowSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 2 },
  rowValue: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#64748B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 54 },
});
