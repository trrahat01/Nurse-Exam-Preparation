import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';

const SOURCES: { name: string; desc: string; url: string; color: string; bg: string }[] = [
  {
    name: 'DGNM Bangladesh',
    desc: 'Directorate General of Nursing & Midwifery',
    url: 'https://dgnm.gov.bd',
    color: '#059669',
    bg: '#D1FAE5',
  },
  {
    name: 'Bangladesh Public Service Commission',
    desc: 'BPSC — official recruitment & syllabus',
    url: 'https://bpsc.gov.bd',
    color: '#0891B2',
    bg: '#E0F2FE',
  },
  {
    name: 'Ministry of Health & Family Welfare',
    desc: 'Government of Bangladesh',
    url: 'https://mohfw.gov.bd',
    color: '#D97706',
    bg: '#FEF3C7',
  },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  const openSource = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C1A2E" />
        </Pressable>
        <Text style={styles.title}>Disclaimer & Sources</Text>
      </View>

      {/* Disclaimer — shown prominently so it is always easy to see */}
      <View style={styles.disclaimerCard}>
        <View style={styles.disclaimerTitleRow}>
          <MaterialCommunityIcons name="alert-outline" size={22} color="#B45309" />
          <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
        </View>
        <Text style={styles.disclaimerText}>
          Nurse Exam Preparation is an independent, unofficial educational application. It is not
          affiliated with, endorsed by, sponsored by, or officially connected with any government
          organization, government examination authority, nursing council, ministry, or public
          institution (including the sources listed below). The app is provided for educational and
          exam-preparation purposes only. Practice content is independently curated for self-study
          and does not guarantee any examination result.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Government Information Notice</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="information-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Reference only — always verify</Text>
              <Text style={styles.rowSub}>
                This app may mention government exams, curricula, and syllabi for practice and
                study reference only. That information can change. Nurse Exam Preparation is an
                independent app and is NOT a source of official government notices, circulars,
                results, or recruitment information. Always verify important details directly
                through the relevant official government sources listed below.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Official Sources</Text>
        <Text style={styles.sectionSub}>
          Public curricula & syllabi used only to shape practice topics. We are an independent app
          — these organizations are not affiliated with us. Tap to visit an official source.
        </Text>
        <View style={styles.card}>
          {SOURCES.map((s, i) => (
            <React.Fragment key={s.name}>
              {i > 0 && <View style={styles.divider} />}
              <Pressable style={styles.row} onPress={() => openSource(s.url)}>
                <View style={[styles.iconBg, { backgroundColor: s.bg }]}>
                  <MaterialCommunityIcons name="link-variant" size={20} color={s.color} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{s.name}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{s.desc}</Text>
                </View>
                <MaterialCommunityIcons name="open-in-new" size={18} color="#94A3B8" />
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBg, { backgroundColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#0891B2" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Nurse Exam Preparation</Text>
              <Text style={styles.rowSub}>Version {Constants.expoConfig?.version ?? '1.0.0'}  (build {Constants.expoConfig?.android?.versionCode ?? '-'})</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => openSource('https://mtcorestudio.github.io/nurse-prep-pages/privacy-policy.html')}>
            <View style={[styles.iconBg, { backgroundColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#0891B2" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Privacy Policy</Text>
              <Text style={styles.rowSub}>How your data is collected & used</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={18} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row} onPress={() => openSource('mailto:mtcorestudio@gmail.com')}>
            <View style={[styles.iconBg, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Contact Support</Text>
              <Text style={styles.rowSub}>mtcorestudio@gmail.com</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={18} color="#94A3B8" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.footer}>
        Exam and board names belong to their respective owners. Practice questions are for
        self-study only and do not guarantee exam results.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  disclaimerCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  disclaimerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disclaimerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#B45309' },
  disclaimerText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#78350F', lineHeight: 20 },
  section: { marginBottom: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#64748B', textTransform: 'uppercase', marginBottom: 4, marginLeft: 4 },
  sectionSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#64748B', marginLeft: 4, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#0C1A2E' },
  rowSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 68 },
  footer: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94A3B8', textAlign: 'center', paddingHorizontal: 24, marginTop: 8, lineHeight: 16 },
});