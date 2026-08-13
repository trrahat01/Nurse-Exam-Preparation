import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { useColors } from '@/hooks/useColors';

/**
 * Animated full-screen splash (uses the provided Nurse Animation Lottie file)
 * shown while the app initializes, so users never see a blank screen.
 */
export default function AppSplash() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <LottieView
        source={require('../assets/lottie/splash.json')}
        autoPlay
        loop
        style={{ width: 180, height: 180 }}
      />
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.mutedForeground, marginTop: 16 }}>
        Loading your questions…
      </Text>
    </View>
  );
}