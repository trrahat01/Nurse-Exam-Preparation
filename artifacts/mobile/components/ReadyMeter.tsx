import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type ReadinessLevel, type ReadinessResult } from '@/src/lib/readiness';

const LEVEL_COLORS: Record<ReadinessLevel, string> = {
  ready: '#059669',
  getting_there: '#F59E0B',
  not_ready: '#DC2626',
};

const LEVEL_ICONS: Record<ReadinessLevel, any> = {
  ready: 'shield-check',
  getting_there: 'progress-clock',
  not_ready: 'alert-circle-outline',
};

export default function ReadyMeter({ readiness, compact }: { readiness: ReadinessResult; compact?: boolean }) {
  const color = LEVEL_COLORS[readiness.level];
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: color + '1A' }]}>
          <MaterialCommunityIcons name={LEVEL_ICONS[readiness.level]} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{compact ? 'Readiness' : 'Predicted Exam Readiness'}</Text>
          <Text style={styles.subtitle}>NCLEX-style estimate from your results</Text>
        </View>
        <Text style={[styles.percent, { color }]}>{readiness.percentage}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: (readiness.percentage + '%') as any, backgroundColor: color }]} />
      </View>
      <View style={styles.footerRow}>
        <Text style={[styles.label, { color }]}>{readiness.label}</Text>
        {readiness.isEstimate ? <Text style={styles.estimate}>Based on {readiness.mockCount} mock(s)</Text> : null}
      </View>
      {!compact ? <Text style={styles.advice}>{readiness.advice}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
    elevation: 1,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  subtitle: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#94A3B8', marginTop: 1 },
  percent: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  track: { height: 10, borderRadius: 5, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  estimate: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#94A3B8' },
  advice: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B', lineHeight: 18 },
});