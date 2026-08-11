import React from 'react';
import { AdPlacement } from '@/src/lib/ads';

interface AdBannerProps {
  placement: AdPlacement;
}

/**
 * Ads are currently disabled (see src/lib/ads.ts). This renders nothing and can
 * be re-enabled together with the AdMob module in a later update without
 * touching the screens that use <AdBanner />.
 */
export default function AdBanner(_props: AdBannerProps) {
  return null;
}