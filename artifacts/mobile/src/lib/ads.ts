import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/** Master switch — set false to disable all ads. */
export const ADS_ENABLED = true;

/** When true, uses Google test ads (no revenue). Set false for your real IDs. */
export const USE_TEST_ADS = false;

/**
 * When true, if a real ad fails to load (e.g. before the app is live/approved),
 * we automatically fall back to a Google test ad so something is visible.
 * Set to false for production release so real users never see "Test ad".
 */
export const ALLOW_TEST_FALLBACK = false;

/** Your real AdMob IDs — used when USE_TEST_ADS = false. */
export const REAL_ADS = {
  androidAppId: 'ca-app-pub-7383364741984927~3313458389',
  iosAppId: 'ca-app-pub-7383364741984927~3313458389',
  homeBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  resultBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  practiceBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  mockBanner: { android: 'ca-app-pub-7383364741984927/2786844778', ios: 'ca-app-pub-7383364741984927/2786844778' },
  interstitial: 'ca-app-pub-7383364741984927/5436224695',
  rewarded: 'ca-app-pub-7383364741984927/8230537288',
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
    // Try the real ad first; on failure fall back to a test ad (if allowed).
    const candidates = ALLOW_TEST_FALLBACK && !USE_TEST_ADS
      ? [REAL_ADS.interstitial, getTestAdUnit('interstitial')]
      : [getInterstitialUnitId()];
    for (const unitId of candidates) {
      const interstitial = gma.InterstitialAd.createForAdRequest(unitId);
      const ok = await new Promise<boolean>((resolve) => {
        const onLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => { try { interstitial.show(); } catch { /* ignore */ } resolve(true); });
        const onErr = interstitial.addAdEventListener(AdEventType.ERROR, () => resolve(false));
        interstitial.load();
        setTimeout(() => { try { onLoad(); } catch {} try { onErr(); } catch {} resolve(false); }, 6000);
      });
      if (ok) return;
    }
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
 * Preloaded rewarded ad (global singleton).
 *
 * Calling `ad.load()` right at the moment the user taps "Watch Ad" frequently
 * fails (no fill at that instant / slow network), which is why rewarded ads
 * often appear "not showing" while banners/interstitials render (`BannerAd`
 * auto-loads; on-demand interstitials are lucky to have cached inventory).
 * Google's recommended pattern — and the reliable one — is to PRELOAD the ad
 * in the background and keep it warm. We do exactly that here.
 */
let preloadedRewarded: any = null;
let preloadedRewardedReady = false;
let preloadedRewardedUnitId: string | null = null;

/** Destroy any existing preloaded rewarded ad (safe to call anytime). */
function destroyPreloadedRewarded(): void {
  try {
    preloadedRewarded?.removeAllAdEventListeners?.();
  } catch {
    /* ignore */
  }
  preloadedRewarded = null;
  preloadedRewardedReady = false;
  preloadedRewardedUnitId = null;
}

/**
 * Start (or restart) the background preload of a rewarded ad.
 * Safe to call at app start and after each rewarded ad is closed.
 */
export function preloadRewardedAd(): void {
  if (!shouldShowAds()) return;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gma = require('react-native-google-mobile-ads') as any;
  if (!gma?.RewardedAd) return;
  try {
    destroyPreloadedRewarded();
    const unitId = getRewardedAdUnitId();
    const ad = gma.RewardedAd.createForAdRequest(unitId);
    ad.addAdEventListener(gma.AdEventType.LOADED, () => {
      preloadedRewardedReady = true;
    });
    ad.addAdEventListener(gma.AdEventType.ERROR, () => {
      preloadedRewardedReady = false;
    });
    ad.addAdEventListener(gma.RewardedAdEventType.CLOSED, () => {
      // Auto-reload a fresh ad for the next use.
      destroyPreloadedRewarded();
      setTimeout(() => preloadRewardedAd(), 500);
    });
    preloadedRewarded = ad;
    preloadedRewardedReady = false;
    preloadedRewardedUnitId = unitId;
    ad.load();
  } catch {
    /* ignore */
  }
}

/**
 * Shows a rewarded ad that grants a reward ONLY if the user watches it fully.
 * Resolves `true` when the reward is earned, `false` if the ad didn't load,
 * was skipped/closed early, or is unavailable (Expo Go / no network).
 * Prefers the preloaded ad (instant); falls back to a fresh on-demand load.
 * Never blocks the user — it resolves within ~30s max.
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise<boolean>((resolveOuter) => {
    if (!shouldShowAds()) return resolveOuter(false);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const gma = require('react-native-google-mobile-ads') as any;
      const { RewardedAd, RewardedAdEventType, AdEventType } = gma;

      const candidates = ALLOW_TEST_FALLBACK && !USE_TEST_ADS
        ? [REAL_ADS.rewarded, getTestRewardedId()]
        : [getRewardedAdUnitId()];

      let idx = 0;
      const attempt = (unitId: string) => {
        // Reuse the warm preloaded ad when it was loaded for this same unit.
        const isWarm = preloadedRewarded && preloadedRewardedReady &&
          preloadedRewardedUnitId === unitId;
        const ad = isWarm ? preloadedRewarded : RewardedAd.createForAdRequest(unitId);
        let rewarded = false;
        let settled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;
        const finish = (v: boolean) => {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          try { ad.removeAllAdEventListeners?.(); } catch { /* ignore */ }
          destroyPreloadedRewarded();
          resolveOuter(v);
          // Warm up a fresh rewarded ad for the next use.
          setTimeout(() => preloadRewardedAd(), 700);
        };
        // Rewarded event fires when the user fully watches (earns the reward).
        ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { rewarded = true; });
        ad.addAdEventListener(AdEventType.LOADED, () => { try { ad.show(); } catch { finish(false); } });
        ad.addAdEventListener(AdEventType.ERROR, () => {
          destroyPreloadedRewarded();
          // Real ad failed -> try next candidate (test ad) if available.
          if (idx + 1 < candidates.length) { idx += 1; attempt(candidates[idx]); }
          else finish(rewarded);
        });
        ad.addAdEventListener(AdEventType.CLOSED, () => finish(rewarded));
        // If the ad can't load in 30s, give up.
        timer = setTimeout(() => finish(false), 30000);
        // Only load when we are NOT reusing the already-warm preloaded ad.
        if (isWarm) {
          try { ad.show(); } catch { finish(false); }
        } else {
          ad.load();
        }
      };
      attempt(candidates[0]);
    } catch { return resolveOuter(false); }
  });
}