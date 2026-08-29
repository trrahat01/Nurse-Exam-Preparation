import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { shouldShowAds, getNativeAdUnitId } from '@/src/lib/ads';

// Metro's global `require` — used to lazy-load the AdMob module ONLY on real
// native builds. In Expo Go the module is never imported (it would crash).
declare const require: (id: string) => any;

let cachedNativeAd: any = null;

/**
 * A "native advanced" banner ad (renders as a normal-looking card). Loads a
 * single NativeAd and renders it with a custom template. Only shown in native
 * builds — never in Expo Go.
 */
export default function NativeAdBanner() {
  const [ad, setAd] = useState<any>(null);
  const [ui, setUi] = useState<any>(null); // { NativeAdView, NativeAsset, NativeAssetType }

  useEffect(() => {
    if (!shouldShowAds()) return;
    const unitId = getNativeAdUnitId();
    if (!unitId) return;
    let mounted = true;
    (async () => {
      try {
        // Lazy-load the AdMob module ONLY here (Expo Go never reaches this).
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const gma = require('react-native-google-mobile-ads');
        if (!cachedNativeAd) {
          const created = await gma.NativeAd.createForAdRequest(unitId);
          if (!mounted) return;
          cachedNativeAd = created;
        }
        if (mounted) {
          setUi({ NativeAdView: gma.NativeAdView, NativeAsset: gma.NativeAsset, NativeAssetType: gma.NativeAssetType });
          setAd(cachedNativeAd);
        }
      } catch (err) {
        console.warn('NativeAd load failed:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!ad || !ui) return null;
  const { NativeAdView, NativeAsset, NativeAssetType } = ui;
  const nativeAd = ad as any;

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.header}>
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image style={styles.icon} />
          </NativeAsset>
          <View style={styles.headerText}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text numberOfLines={1} style={styles.headline} />
            </NativeAsset>
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text numberOfLines={1} style={styles.advertiser} />
            </NativeAsset>
          </View>
        </View>
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text numberOfLines={2} style={styles.body} />
        </NativeAsset>
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Text style={styles.cta} />
        </NativeAsset>
      </View>
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'stretch', marginVertical: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0',
    padding: 12, gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E2E8F0' },
  headerText: { flex: 1 },
  headline: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#0C1A2E' },
  advertiser: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748B' },
  body: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#334155', lineHeight: 18 },
  cta: {
    alignSelf: 'flex-start', backgroundColor: '#0891B2', color: '#fff',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    fontSize: 13, fontFamily: 'Inter_700Bold', overflow: 'hidden',
  },
});