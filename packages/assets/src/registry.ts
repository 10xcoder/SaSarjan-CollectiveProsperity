import type { LogoAsset, AppAssets } from './types';
import { generateFaviconSet } from './utils';

export const LOGO_REGISTRY: Record<string, LogoAsset> = {
  sasarjan: {
    id: 'sasarjan',
    name: 'SaSarjan',
    category: 'sasarjan',
    formats: ['svg', 'png'],
    sizes: {
      xs: 16,
      sm: 24,
      md: 32,
      lg: 48,
      xl: 64,
      '2xl': 128,
      full: 512
    },
    variants: ['primary', 'white', 'black'],
    defaultVariant: 'primary',
    defaultFormat: 'svg'
  },
  talentexcel: {
    id: 'talentexcel',
    name: 'TalentExcel',
    category: 'apps',
    formats: ['svg', 'png'],
    sizes: {
      xs: 16,
      sm: 24,
      md: 32,
      lg: 48,
      xl: 64,
      '2xl': 128,
      full: 512
    },
    variants: ['primary', 'white'],
    defaultVariant: 'primary',
    defaultFormat: 'svg'
  },
  sevapremi: {
    id: 'sevapremi',
    name: 'SevaPrëmi',
    category: 'apps',
    formats: ['svg', 'png'],
    sizes: {
      xs: 16,
      sm: 24,
      md: 32,
      lg: 48,
      xl: 64,
      '2xl': 128,
      full: 512
    },
    variants: ['primary', 'white'],
    defaultVariant: 'primary',
    defaultFormat: 'svg'
  },
  '10xgrowth': {
    id: '10xgrowth',
    name: '10x Growth',
    category: 'apps',
    formats: ['svg', 'png'],
    sizes: {
      xs: 16,
      sm: 24,
      md: 32,
      lg: 48,
      xl: 64,
      '2xl': 128,
      full: 512
    },
    variants: ['primary', 'white'],
    defaultVariant: 'primary',
    defaultFormat: 'svg'
  }
};

export const APP_ASSETS: Record<string, AppAssets> = {
  sasarjan: {
    logo: LOGO_REGISTRY.sasarjan,
    favicon: generateFaviconSet('sasarjan'),
    ogImage: '/logos/sasarjan/sasarjan-og.png',
    twitterImage: '/logos/sasarjan/sasarjan-twitter.png'
  },
  talentexcel: {
    logo: LOGO_REGISTRY.talentexcel,
    favicon: generateFaviconSet('talentexcel'),
    ogImage: '/logos/apps/talentexcel-og.png',
    twitterImage: '/logos/apps/talentexcel-twitter.png'
  },
  sevapremi: {
    logo: LOGO_REGISTRY.sevapremi,
    favicon: generateFaviconSet('sevapremi'),
    ogImage: '/logos/apps/sevapremi-og.png',
    twitterImage: '/logos/apps/sevapremi-twitter.png'
  },
  '10xgrowth': {
    logo: LOGO_REGISTRY['10xgrowth'],
    favicon: generateFaviconSet('10xgrowth'),
    ogImage: '/logos/apps/10xgrowth-og.png',
    twitterImage: '/logos/apps/10xgrowth-twitter.png'
  }
};