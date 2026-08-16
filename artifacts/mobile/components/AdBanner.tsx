import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdPlacement, getBannerUnitId, shouldShowAds, ALLOW_TEST_FALLBACK, isExpoGo } from '@/src/lib/ads';

// Metro's global `require` (used to lazily load the AdMob module only when a real
// native build is running — never in Expo Go / web).
declare const require: (id: string) => any;

interface AdBannerProps {
  placement: AdPlacement;
}

/**
 * Single, non-intrusive banner ad with a smart fallback:
 * - Tries your REAL ad unit first.
 * - If the real ad fails to load it falls back to a Google TEST ad.
 * - Ads are fully disabled inside Expo Go (the native module is not bundled there),
 *   so the app never crashes in the Expo Go testing environment.
 */
export default function AdBanner({ placement }: AdBannerProps) {
  const [useTest, setUseTest] = useState(false);

  if (!shouldShowAds()) return null;
  const primary = getBannerUnitId(placement);
  // In Expo Go we never render ads (native module unavailable).
  if (isExpoGo()) return null;

  // Lazy-load the AdMob module ONLY here — never imported at module scope.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ads = require('react-native-google-mobile-ads');
  const BannerAd = ads.BannerAd;
  const BannerAdSize = ads.BannerAdSize;
  const unitId = useTest ? ads.TestIds.BANNER : primary;
  if (!unitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        key={unitId}
        unitId={unitId}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={(error: unknown) => {
          console.warn(`AdBanner("${placement}") failed to load:`, error);
          // Real ad failed -> switch to a test ad (only when allowed).
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