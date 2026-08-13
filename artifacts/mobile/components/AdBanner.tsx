import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AdPlacement, getBannerUnitId, shouldShowAds } from '@/src/lib/ads';

interface AdBannerProps {
  placement: AdPlacement;
}

/**
 * Single, non-intrusive banner ad. Renders nothing on web / when disabled /
 * when no unit is configured / when a real ad fails to load (silently).
 */
export default function AdBanner({ placement }: AdBannerProps) {
  if (!shouldShowAds()) return null;
  const unitId = getBannerUnitId(placement);
  if (!unitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={(error) => {
          if (__DEV__) console.warn(`AdBanner("${placement}") failed to load:`, error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});