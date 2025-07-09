import React from 'react';
import { APP_ASSETS } from '@repo/assets';

interface FaviconProviderProps {
  appId: string;
}

export function FaviconProvider({ appId }: FaviconProviderProps) {
  React.useEffect(() => {
    const appAssets = APP_ASSETS[appId];
    if (!appAssets) {
      console.warn(`Assets not found for app: ${appId}`);
      return;
    }

    const { favicon } = appAssets;
    const head = document.head;

    // Remove existing favicons
    const existingFavicons = head.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(el => el.remove());

    // Add new favicons
    const links = [
      { rel: 'icon', type: 'image/x-icon', href: favicon.ico },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: favicon.png16 },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon.png32 },
      { rel: 'apple-touch-icon', sizes: '180x180', href: favicon.appleTouchIcon },
    ];

    links.forEach(({ rel, type, sizes, href }) => {
      const link = document.createElement('link');
      link.rel = rel;
      if (type) link.type = type;
      if (sizes) link.sizes = sizes;
      link.href = href;
      head.appendChild(link);
    });

    // Update web app manifest icons
    const manifestLink = head.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const manifest = {
        icons: [
          {
            src: favicon.png192,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: favicon.png512,
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      };
      
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      manifestLink.setAttribute('href', url);
    }
  }, [appId]);

  return null;
}