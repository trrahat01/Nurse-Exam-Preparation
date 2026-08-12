import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

/**
 * Themed full-screen splash shown while the app initializes
 * (fonts + auth + initial data), so users never see a blank screen.
 */
export default function AppSplash() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <View style={{ width: 88, height: 88, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 34, color: colors.primaryForeground }}>N</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.mutedForeground, marginTop: 16 }}>
        Loading your questions…
      </Text>
    </View>
  );
}