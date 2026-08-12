import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions, Appearance,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

const CHAPTERS: { title: string; icon: string; color: string; text: string[] }[] = [
  {
    title: 'Medical-Surgical Nursing Basics',
    icon: 'medical-bag',
    color: '#0891B2',
    text: [
      'The nursing process is: Assessment, Diagnosis, Planning, Implementation, and Evaluation (ADPIE).',
      'Always assess ABC first (Airway, Breathing, Circulation) before any other intervention.',
      'Pain is the fifth vital sign — reassess after administering pain medication.',
    ],
  },
  {
    title: 'Pharmacology Essentials',
    icon: 'pill',
    color: '#7C3AED',
    text: [
      'Verify the 5 Rights of medication: Right patient, drug, dose, route, and time.',
      'Never crush enteric-coated or sustained-release tablets.',
      'Check two patient identifiers before giving any medication.',
    ],
  },
  {
    title: 'Infection Control & Safety',
    icon: 'hand-wash',
    color: '#059669',
    text: [
      'Hand hygiene is the single most effective way to prevent infection.',
      'Standard precautions apply to ALL patients, regardless of diagnosis.',
      'Use PPE based on the anticipated exposure to blood or body fluids.',
    ],
  },
  {
    title: 'Community & Public Health Nursing',
    icon: 'earth',
    color: '#D97706',
    text: [
      'Primary prevention prevents disease before it occurs (vaccination, education).',
      'Secondary prevention detects disease early (screening).',
      'Tertiary prevention reduces complications of existing disease (rehabilitation).',
    ],
  },
];

export default function ReadingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const [fontScale, setFontScale] = useState(1);
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  const contentWidth = Math.min(width - 32, 560);
  const onDark = isDark;
  const textColor = onDark ? '#E2E8F0' : '#334155';
  const bg = onDark ? '#0C1A2E' : '#F8FAFC';
  const cardBg = onDark ? colors.card : '#FFFFFF';
  const cardBorder = onDark ? colors.border : '#E2E8F0';
  const heading = onDark ? colors.foreground : '#0C1A2E';

  const toggleFont = () => setFontScale(s => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1));
  const toggleBg = () => setIsDark(d => !d);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={heading} />
        </Pressable>
        <Text style={[styles.title, { color: heading }]}>Reading Mode</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconBtn icon={fontScale > 1 ? 'format-size' : 'format-font'} color="#0891B2" onPress={toggleFont} onDark={onDark} bg={cardBg} fg={heading} />
          <IconBtn icon="brightness-7" color="#7C3AED" onPress={toggleBg} onDark={onDark} bg={cardBg} fg={heading} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 14 }} showsVerticalScrollIndicator={false}>
        {CHAPTERS.map(c => (
          <View key={c.title} style={[styles.card, { width: contentWidth, backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: c.color + '20' }]}>
                <MaterialCommunityIcons name={c.icon as any} size={22} color={c.color} />
              </View>
              <Text style={[styles.cardTitle, { color: heading }]}>{c.title}</Text>
            </View>
            <View style={{ gap: 8, marginTop: 6 }}>
              {c.text.map((t, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <MaterialCommunityIcons name="circle-medium" size={18} color={c.color} style={{ marginTop: 2 }} />
                  <Text style={[styles.body, { fontSize: 15 * fontScale, color: textColor, lineHeight: 22 * fontScale }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function IconBtn({ icon, color, onPress, onDark, bg, fg }: any) {
  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', gap: 2 }}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: onDark ? '#1E3A5F' : '#E0F2FE', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={{ fontSize: 9, color: onDark ? '#94A3B8' : '#64748B' }}>{icon === 'format-size' ? 'Text Size' : 'Theme'}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', flex: 1 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, alignSelf: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', flex: 1 },
  body: { fontFamily: 'Inter_400Regular', flex: 1 },
});