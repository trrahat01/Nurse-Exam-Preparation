import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/** Master switch — set false to disable all ads. */
export const ADS_ENABLED = true;

/** When true, uses Google test ads (no revenue). Set false for your real IDs. */
export const USE_TEST_ADS = true;

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
  rewarded: 'ca-app-pub-7383364741984927/5553333333', // REPLACE with your rewarded ad unit id
};

export type AdPlacement = 'home' | 'result' | 'practice' | 'mock';

const PLACEMENTS: Record<AdPlacement, { android: string; ios: string }> = {
  home: REAL_ADS.homeBanner,
  result: REAL_ADS.resultBanner,
  practice: REAL_ADS.practiceBanner,
  mock: REAL_ADS.mockBanner,
};

const isWeb = Platform.OS === 'web';

/** True when running inside Expo Go (react-native-google-mobile-ads is NOT available there). */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** True when ads may show (native builds only, not Expo Go, not web). */
export function shouldShowAds(): boolean {
  return ADS_ENABLED && !isWeb && !isExpoGo();
}

/** Banner unit id for a placement — real or test depending on USE_TEST_ADS. */
export function getBannerUnitId(placement: AdPlacement): string | null {
  if (!shouldShowAds()) return null;
  if (USE_TEST_ADS) return getTestBannerId();
  const ids = PLACEMENTS[placement];
  const id = Platform.OS === 'ios' ? ids.ios : ids.android;
  return id && id.length > 0 ? id : null;
}

/** Interstitial unit id. */
export function getInterstitialUnitId(): string {
  return USE_TEST_ADS ? getTestAdUnit('interstitial') : REAL_ADS.interstitial;
}

/**
 * Lazily read test ids from react-native-google-mobile-ads.
 * The module is only loaded when ads are actually shown, so Expo Go (which does
 * not bundle the native module) never imports it.
 */
export function getTestBannerId(): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gma = require('react-native-google-mobile-ads') as any;
  return (gma?.TestIds?.BANNER) || 'ca-app-pub-3940256099942544/6300978111';
}

function getTestAdUnit(_kind: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gma = require('react-native-google-mobile-ads') as any;
  return (gma?.TestIds?.INTERSTITIAL) || 'ca-app-pub-3940256099942544/1033173712';
}

/** Native (advanced) ad unit id — real production id. */
export const NATIVE_AD_UNIT_ID = 'ca-app-pub-7383364741984927/9789657818';
export function getNativeAdUnitId(): string | null {
  if (!shouldShowAds()) return null;
  return USE_TEST_ADS ? getTestNativeId() : NATIVE_AD_UNIT_ID;
}
function getTestNativeId(): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gma = require('react-native-google-mobile-ads') as any;
  return (gma?.TestIds?.NATIVE) || 'ca-app-pub-3940256099942544/2242696113';
}

/**
 * Shows a full-screen interstitial ad (native builds only). Resolves after the
 * ad is shown or quickly times out so the user is never blocked.
 */
export async function showInterstitial(): Promise<void> {
  if (!shouldShowAds()) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const gma = require('react-native-google-mobile-ads') as any;
    const AdEventType = gma.AdEventType;
    const interstitial = gma.InterstitialAd.createForAdRequest(getInterstitialUnitId());
    const done = new Promise<void>((resolve) => {
      const unload = interstitial.addAdEventListener(AdEventType.LOADED, () => { try { interstitial.show(); } catch { /* ignore */ } resolve(); });
      const unerr = interstitial.addAdEventListener(AdEventType.ERROR, () => resolve());
      interstitial.load();
      setTimeout(() => { try { unload(); } catch {} try { unerr(); } catch {} resolve(); }, 6000);
    });
    await done;
  } catch { /* ignore — never block the user */ }
}

/** Rewarded ad unit id — real or test depending on USE_TEST_ADS. */
export function getRewardedAdUnitId(): string {
  return USE_TEST_ADS ? getTestRewardedId() : REAL_ADS.rewarded;
}
function getTestRewardedId(): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gma = require('react-native-google-mobile-ads') as any;
  return (gma?.TestIds?.REWARDED) || 'ca-app-pub-3940256099942544/5224354917';
}

/**
 * Shows a rewarded ad that grants a reward ONLY if the user watches it fully.
 * Resolves `true` when the reward is earned, `false` if the ad didn't load,
 * was skipped/closed early, or is unavailable (Expo Go / no network).
 * Never blocks the user — it resolves within ~30s max.
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (!shouldShowAds()) return resolve(false);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const gma = require('react-native-google-mobile-ads') as any;
      const { RewardedAd, RewardedAdEventType, AdEventType } = gma;
      const ad = RewardedAd.createForAdRequest(getRewardedAdUnitId());
      let rewarded = false;
      let settled = false;
      const finish = (v: boolean) => {
        if (!settled) { settled = true; clearTimeout(timer); try { ad.removeAllAdEventListeners?.(); } catch {} resolve(v); }
      };
      // Rewarded event fires when the user fully watches (earns the reward).
      const onReward = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { rewarded = true; });
      const onLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        try { ad.show(); } catch { finish(false); }
      });
      const onError = ad.addAdEventListener(AdEventType.ERROR, () => finish(rewarded));
      const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => finish(rewarded));
      // If the ad can't load in 30s, give up.
      const timer = setTimeout(() => finish(false), 30000);
      ad.load();
    } catch { return resolve(false); }
  });
}