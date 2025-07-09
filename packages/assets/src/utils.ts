import type { LogoAsset, LogoOptions, FaviconSet } from './types';
import { DEFAULT_LOGO_OPTIONS, LOGO_SIZES } from './constants';

export function getLogoPath(
  asset: LogoAsset,
  options: LogoOptions = {}
): string {
  const { 
    size = DEFAULT_LOGO_OPTIONS.size, 
    format = asset.defaultFormat, 
    variant = asset.defaultVariant 
  } = options;

  const sizeValue = LOGO_SIZES[size];
  const filename = variant === 'primary' 
    ? `${asset.id}-${sizeValue}.${format}`
    : `${asset.id}-${variant}-${sizeValue}.${format}`;

  return `/logos/${asset.category}/${filename}`;
}

export function generateFaviconSet(logoId: string): FaviconSet {
  const base = `/favicons/${logoId}`;
  
  return {
    ico: `${base}/favicon.ico`,
    png16: `${base}/favicon-16x16.png`,
    png32: `${base}/favicon-32x32.png`,
    png192: `${base}/android-chrome-192x192.png`,
    png512: `${base}/android-chrome-512x512.png`,
    appleTouchIcon: `${base}/apple-touch-icon.png`
  };
}

export function getOGImagePath(appId: string): string {
  return `/logos/apps/${appId}-og.png`;
}

export function getTwitterImagePath(appId: string): string {
  return `/logos/apps/${appId}-twitter.png`;
}