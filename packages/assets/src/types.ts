export type LogoFormat = 'svg' | 'png' | 'jpg' | 'webp';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type LogoVariant = 'primary' | 'white' | 'black' | 'mono';

export interface LogoAsset {
  id: string;
  name: string;
  category: 'sasarjan' | 'apps' | 'brands';
  formats: LogoFormat[];
  sizes: Record<LogoSize, number>;
  variants: LogoVariant[];
  defaultVariant: LogoVariant;
  defaultFormat: LogoFormat;
}

export interface LogoOptions {
  size?: LogoSize;
  format?: LogoFormat;
  variant?: LogoVariant;
}

export interface FaviconSet {
  ico: string;
  png16: string;
  png32: string;
  png192: string;
  png512: string;
  appleTouchIcon: string;
}

export interface AppAssets {
  logo: LogoAsset;
  favicon: FaviconSet;
  ogImage?: string;
  twitterImage?: string;
}