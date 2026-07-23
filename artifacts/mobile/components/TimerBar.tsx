import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface Props {
  timeLeft: number;
  totalTime: number;
}

export function TimerBar({ timeLeft, totalTime }: Props) {
  const colors = useColors();
  const progress = useSharedValue(1);
  const isLow = timeLeft < 300; // < 5 min
  const isCritical = timeLeft < 60;

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const ss = (timeLeft % 60).toString().padStart(2, '0');

  useEffect(() => {
    const pct = totalTime > 0 ? timeLeft / totalTime : 0;
    progress.value = withTiming(pct, { duration: 900 });
  }, [timeLeft, totalTime]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const barColor = isCritical ? colors.destructive : isLow ? colors.warning : colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MaterialCommunityIcons
          name="timer-outline"
          size={16}
          color={isCritical ? colors.destructive : colors.mutedForeground}
        />
        <Text
          style={[
            styles.time,
            {
              color: isCritical ? colors.destructive : isLow ? colors.warning : colors.foreground,
              fontFamily: isCritical ? 'Inter_700Bold' : 'Inter_600SemiBold',
            },
          ]}
        >
          {mm}:{ss}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, barStyle, { backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time: { fontSize: 15 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
});
