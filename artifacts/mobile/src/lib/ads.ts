import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/** Master switch — set false to disable all ads. */
export const ADS_ENABLED = true;

/** When true, uses Google test ads (no revenue). Set false for your real IDs. */
export const USE_TEST_ADS = false;

/**
 * When true, if a real ad fails to load (e.g. before the app is live/approved),
 * we automatically fall back to a Google test ad so something is visible.
 * Set to false for production release so real users never see "Test ad".
 */
export const ALLOW_TEST_FALLBACK = true;

/** Your real AdMob IDs — used when USE_TEST_ADS = false. */
export const REAL_ADS = {
  androidAppId: 'ca-app-pub-7383364741984927~3313458389',
  iosAppId: 'ca-app-pub-7383364741984927~3313458389',
  homeBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  resultBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  practiceBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  mockBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  interstitial: 'ca-app-pub-7383364741984927/5436224695',
};

export type AdPlacement = 'home' | 'result' | 'practice' | 'mock';

const PLACEMENTS: Record<AdPlacement, { android: string; ios: string }> = {
  home: REAL_ADS.homeBanner,
  result: REAL_ADS.resultBanner,
  practice: REAL_ADS.practiceBanner,
  mock: REAL_ADS.mockBanner,
};

const isWeb = Platform.OS === 'web';
/** True when ads may show (native only, master switch). */
export function shouldShowAds(): boolean {
  return ADS_ENABLED && !isWeb;
}

/** Banner unit id for a placement — real or test depending on USE_TEST_ADS. */
export function getBannerUnitId(placement: AdPlacement): string | null {
  if (!ADS_ENABLED || isWeb) return null;
  if (USE_TEST_ADS) return TestIds.BANNER;
  const ids = PLACEMENTS[placement];
  const id = Platform.OS === 'ios' ? ids.ios : ids.android;
  return id && id.length > 0 ? id : null;
}

/** Interstitial unit id. */
export function getInterstitialUnitId(): string {
  return USE_TEST_ADS ? TestIds.INTERSTITIAL : REAL_ADS.interstitial;
}