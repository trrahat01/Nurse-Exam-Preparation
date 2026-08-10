import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AdPlacement, getBannerUnitId, shouldShowAds } from '@/src/lib/ads';

interface AdBannerProps {
  placement: AdPlacement;
}

/**
 * A single, non-intrusive small banner ad.
 *
 * - Renders nothing on the web, when ads are disabled, or when no ad unit is
 *   configured — so it can never block or break the UI.
 * - If an ad fails to load, it fails silently (the space collapses).
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
          // Never disrupt the user; the banner simply won't appear.
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