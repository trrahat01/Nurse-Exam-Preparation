import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Difficulty } from '@/lib/types';

interface Props {
  difficulty: Difficulty;
}

const CONFIG = {
  easy: { label: 'Easy', bg: '#D1FAE5', text: '#065F46' },
  medium: { label: 'Medium', bg: '#FEF3C7', text: '#92400E' },
  hard: { label: 'Hard', bg: '#FEE2E2', text: '#991B1B' },
};

export function DifficultyBadge({ difficulty }: Props) {
  const cfg = CONFIG[difficulty] ?? CONFIG.medium;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});
