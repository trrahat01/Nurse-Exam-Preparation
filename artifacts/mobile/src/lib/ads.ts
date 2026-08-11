import { Platform } from 'react-native';

/**
 * ⚠️ AdMob is currently DISABLED (ADS_ENABLED = false).
 *
 * Reason: the AdMob native module (react-native-google-mobile-ads v16) pulls the
 * Google Ads SDK 25.4.0, which is compiled with Kotlin 2.3.0. Expo SDK 54 only
 * supports Kotlin up to 2.2.20, so the module could not compile. Ads are disabled
 * so the app can build and ship.
 *
 * To re-enable ads in a later update:
 *  1) Install a compatible version of react-native-google-mobile-ads.
 *  2) Add the "react-native-google-mobile-ads" config plugin (with your real App
 *     IDs) to app.json.
 *  3) Put your real (test) banner unit IDs in REAL_ADS below.
 *  4) Set USE_TEST_ADS = false and ADS_ENABLED = true.
 *  5) Rebuild.
 */

/**
 * ============================================================================
 *  ADMOB CONFIGURATION — the single place to control all advertising.
 * ============================================================================
 *
 *  1. ADS_ENABLED  — Master switch. Set to false to disable ads everywhere.
 *  2. USE_TEST_ADS — Uses Google's official test ad units so NO real ad revenue
 *                    is consumed during development. KEEP THIS `true` until you
 *                    have created real AdMob units and pasted the IDs below.
 *  3. REAL_ADS     — Your real AdMob unit IDs (you provide these later).
 *
 *  ⚠️  The AdMob APP IDs live separately in app.json inside the
 *      `react-native-google-mobile-ads` config plugin. Update those there too
 *      when you switch to real ads.
 *
 *  Design note (non-intrusive): only small banners are used, and only when they
 *  can load. There are no interstitials/rewarded ads that interrupt studying.
 * ============================================================================
 */
export const ADS_ENABLED = false;

/** Set to `false` only after REAL_ADS contains valid IDs. */
export const USE_TEST_ADS = true;

/** Only used when USE_TEST_ADS = false. Fill these from your AdMob dashboard. */
export const REAL_ADS = {
  // App IDs (also update in app.json plugin config):
  // Android: ca-app-pub-XXXXXXXXXXXXXXXX/3539209097 style is for units, App ID looks like ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
  androidAppId: '',
  iosAppId: '',

  // Banner ad units, format ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
  homeBanner: { android: '', ios: '' },
  resultBanner: { android: '', ios: '' },
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

  return null; // Ads disabled — no ad unit id is used.

  const ids = PLACEMENTS[placement];
  const id = Platform.OS === 'ios' ? ids.ios : ids.android;
  return id && id.length > 0 ? id : null;
}