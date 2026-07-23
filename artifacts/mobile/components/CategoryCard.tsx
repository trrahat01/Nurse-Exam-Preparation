import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import type { CategoryConfig } from '@/lib/types';

interface Props {
  config: CategoryConfig;
  questionCount?: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryCard({ config, questionCount, onPress }: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.card, animStyle, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: config.bgColor }]}>
        <MaterialCommunityIcons
          name={config.icon as any}
          size={28}
          color={config.color}
        />
      </View>
      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
        {config.name}
      </Text>
      <Text style={[styles.count, { color: colors.mutedForeground }]}>
        {questionCount !== undefined ? `${questionCount} Questions` : config.description}
      </Text>
      <View style={[styles.bar, { backgroundColor: config.bgColor }]}>
        <View style={[styles.barFill, { backgroundColor: config.color, width: '65%' }]} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minHeight: 150,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  count: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
  bar: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
