import type { LogoSize } from './types';

export const LOGO_SIZES: Record<LogoSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
  '2xl': 128,
  full: 512
};

export const ASSET_BASE_PATH = '/assets';

export const DEFAULT_LOGO_OPTIONS = {
  size: 'md' as LogoSize,
  format: 'svg' as const,
  variant: 'primary' as const
};