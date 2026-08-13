import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AdPlacement, getBannerUnitId, shouldShowAds, ALLOW_TEST_FALLBACK } from '@/src/lib/ads';

interface AdBannerProps {
  placement: AdPlacement;
}

/**
 * Single, non-intrusive banner ad with a smart fallback:
 * - Tries your REAL ad unit first.
 * - If the real ad fails to load (e.g. "no fill" before the app is live),
 *   it falls back to a Google TEST ad so something is always visible.
 * - Once real ads start serving, the real ad shows instead of the test ad.
 */
export default function AdBanner({ placement }: AdBannerProps) {
  const [useTest, setUseTest] = useState(false);

  if (!shouldShowAds()) return null;
  const primary = getBannerUnitId(placement);
  const unitId = useTest ? TestIds.BANNER : primary;
  if (!unitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        key={unitId}
        unitId={unitId}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={(error) => {
          if (__DEV__) console.warn(`AdBanner("${placement}") failed to load:`, error);
          // Real ad failed → switch to a test ad (only when allowed).
          if (ALLOW_TEST_FALLBACK && !useTest) {
            setUseTest(true);
          }
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