import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { AnswerOption } from '@/lib/types';

interface Props {
  option: AnswerOption;
  text: string;
  selected: boolean;
  correctAnswer?: AnswerOption;
  revealed?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const LABEL: Record<AnswerOption, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

export function OptionButton({ option, text, selected, correctAnswer, revealed, onPress, disabled }: Props) {
  const colors = useColors();

  const isCorrect = revealed && option === correctAnswer;
  const isWrong = revealed && selected && option !== correctAnswer;

  let bg = colors.card;
  let borderColor = colors.border;
  let labelBg = colors.secondary;
  let labelText = colors.mutedForeground;
  let textColor = colors.foreground;

  if (selected && !revealed) {
    bg = colors.primary + '18';
    borderColor = colors.primary;
    labelBg = colors.primary;
    labelText = colors.primaryForeground;
    textColor = colors.primary;
  }

  if (isCorrect) {
    bg = colors.success + '18';
    borderColor = colors.success;
    labelBg = colors.success;
    labelText = colors.successForeground;
    textColor = colors.success;
  }

  if (isWrong) {
    bg = colors.destructive + '18';
    borderColor = colors.destructive;
    labelBg = colors.destructive;
    labelText = colors.destructiveForeground;
    textColor = colors.destructive;
  }

  return (
    <Pressable
      style={[styles.btn, { backgroundColor: bg, borderColor }]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: colors.primary + '20' }}
    >
      <View style={[styles.label, { backgroundColor: labelBg }]}>
        <Text style={[styles.labelText, { color: labelText }]}>{LABEL[option]}</Text>
      </View>
      <Text style={[styles.text, { color: textColor }]} numberOfLines={3}>
        {text}
      </Text>
      {isCorrect && (
        <Ionicons name="checkmark-circle" size={20} color={colors.success} style={styles.icon} />
      )}
      {isWrong && (
        <Ionicons name="close-circle" size={20} color={colors.destructive} style={styles.icon} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  label: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  icon: {
    flexShrink: 0,
  },
});
