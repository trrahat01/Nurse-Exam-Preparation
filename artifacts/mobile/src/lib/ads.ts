import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/**
 * ADMOB CONFIGURATION.
 * Ads are ENABLED using react-native-google-mobile-ads@15 (Google Ads SDK 24.1.0,
 * Kotlin-compatible with Expo SDK 54).
 *
 * - ADS_ENABLED = false → disables all ads.
 * - USE_TEST_ADS = false → uses your REAL AdMob IDs below (real revenue).
 *   Set USE_TEST_ADS = true to show Google's official test ads (no revenue).
 */
export const ADS_ENABLED = true;

/** Set to `false` to use your real IDs (real revenue). Keep `true` for testing. */
export const USE_TEST_ADS = false;

/** Only used when USE_TEST_ADS = false. Fill these from your AdMob dashboard. */
export const REAL_ADS = {
  // App ID: ca-app-pub-7383364741984927~3313458389
  // Banner: ca-app-pub-7383364741984927/2786844778
  // Interstitial: ca-app-pub-7383364741984927/5436224695
  androidAppId: 'ca-app-pub-7383364741984927~3313458389',
  iosAppId: 'ca-app-pub-7383364741984927~3313458389',

  // Banner ad units, format ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
  homeBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  resultBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  interstitial: 'ca-app-pub-7383364741984927/5436224695',
};

export type AdPlacement = 'home' | 'result';

const PLACEMENTS: Record<AdPlacement, { android: string; ios: string }> = {
  home: REAL_ADS.homeBanner,
  result: REAL_ADS.resultBanner,
};

const isWeb = Platform.OS === 'web';

/** True when ads are allowed on this platform (native only). */
export function shouldShowAds(): boolean {
  return ADS_ENABLED && !isWeb;
}

/**
 * Returns the active banner unit id for a placement, or `null` when the ad
 * should be hidden (ads disabled, web, or no real id configured yet).
 */
export function getBannerUnitId(placement: AdPlacement): string | null {
  if (!ADS_ENABLED || isWeb) return null;
  if (USE_TEST_ADS) return TestIds.BANNER;
  const ids = PLACEMENTS[placement];
  const id = Platform.OS === 'ios' ? ids.ios : ids.android;
  return id && id.length > 0 ? id : null;
}

export function getInterstitialUnitId(): string {
  return USE_TEST_ADS ? TestIds.INTERSTITIAL : REAL_ADS.interstitial;
}