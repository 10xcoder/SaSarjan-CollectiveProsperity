import React from 'react';
import { cn } from '../lib/utils';
import { 
  getLogoPath, 
  APP_ASSETS, 
  LOGO_REGISTRY,
  type LogoOptions,
  type LogoSize 
} from '@repo/assets';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  appId: string;
  size?: LogoSize;
  variant?: LogoOptions['variant'];
  format?: LogoOptions['format'];
}

export function Logo({ 
  appId, 
  size = 'md',
  variant,
  format,
  className,
  alt,
  ...props 
}: LogoProps) {
  const appAssets = APP_ASSETS[appId];
  const logo = appAssets?.logo || LOGO_REGISTRY[appId];
  
  if (!logo) {
    console.warn(`Logo not found for app: ${appId}`);
    return null;
  }

  const logoPath = getLogoPath(logo, { size, variant, format });
  const displayAlt = alt || `${logo.name} logo`;

  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-32 w-32',
    full: 'h-auto w-full'
  };

  return (
    <img
      src={logoPath}
      alt={displayAlt}
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
}

interface AppIconProps extends LogoProps {
  fallback?: React.ReactNode;
}

export function AppIcon({ 
  appId,
  size = 'md',
  fallback,
  ...props
}: AppIconProps) {
  const [error, setError] = React.useState(false);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Logo
      appId={appId}
      size={size}
      onError={() => setError(true)}
      {...props}
    />
  );
}