import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface Props {
  name: string;
  questionCount?: number;
  index: number;
  accentColor: string;
  onPress: () => void;
}

export function ChapterItem({ name, questionCount, index, accentColor, onPress }: Props) {
  const colors = useColors();

  return (
    <Pressable
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      android_ripple={{ color: accentColor + '20' }}
    >
      <View style={[styles.num, { backgroundColor: accentColor + '18' }]}>
        <Text style={[styles.numText, { color: accentColor }]}>{index + 1}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{name}</Text>
        {questionCount !== undefined ? (
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {questionCount} questions
          </Text>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  num: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  count: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
