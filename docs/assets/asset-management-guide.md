# SaSarjan App Store - Centralized Asset Management Guide

## Overview

The SaSarjan App Store platform uses a centralized asset management system to handle logos, favicons, and other visual assets across all applications. This ensures consistency, reduces duplication, and simplifies asset management for multi-app deployments.

## Architecture

### Package Structure

```
packages/assets/
├── logos/
│   ├── sasarjan/        # Main brand logos
│   ├── apps/            # Individual app logos
│   └── brands/          # Partner brand logos
├── icons/               # UI icons
├── favicons/            # Favicon sets
└── src/                 # TypeScript utilities
    ├── types.ts         # Asset type definitions
    ├── constants.ts     # Size mappings and defaults
    ├── utils.ts         # Helper functions
    ├── registry.ts      # Logo registry and metadata
    ├── seo.ts          # SEO metadata helpers
    └── index.ts        # Package exports
```

### Key Components

1. **@repo/assets Package**
   - Centralized storage for all visual assets
   - TypeScript utilities for type-safe asset handling
   - SEO metadata generation helpers

2. **UI Components** (in @sasarjan/ui)
   - `<Logo>` - Displays app logos with automatic sizing
   - `<AppIcon>` - Logo wrapper with error handling
   - `<FaviconProvider>` - Dynamic favicon management

## Logo Management

### Naming Convention

All logos follow a consistent naming pattern:
```
{app-id}-{variant}-{size}.{format}
```

Examples:
- `sasarjan-primary-32.svg` - Primary variant, 32px
- `talentexcel-white-128.png` - White variant, 128px
- `sevapremi-64.svg` - Primary variant (default), 64px

### Supported Sizes

| Size Key | Pixel Size | CSS Class | Use Case |
|----------|------------|-----------|----------|
| xs | 16px | h-4 w-4 | Small icons, favicon |
| sm | 24px | h-6 w-6 | Navigation bars |
| md | 32px | h-8 w-8 | Default size |
| lg | 48px | h-12 w-12 | Headers |
| xl | 64px | h-16 w-16 | Hero sections |
| 2xl | 128px | h-32 w-32 | Large displays |
| full | 512px | h-auto w-full | Social media, OG images |

### Variants

- **primary** - Default brand colors
- **white** - White version for dark backgrounds
- **black** - Black version for light backgrounds
- **mono** - Monochrome version

### File Formats

1. **SVG** (Preferred)
   - Scalable without quality loss
   - Smaller file sizes
   - Supports all sizes from single file

2. **PNG** (Fallback)
   - For complex graphics
   - Required for favicons
   - Social media previews

3. **WebP/JPG** (Optional)
   - For photographic content
   - Optimized file sizes

## Usage Examples

### Basic Logo Display

```tsx
import { Logo } from '@sasarjan/ui';

// Default usage
<Logo appId="talentexcel" />

// With custom size and variant
<Logo appId="talentexcel" size="lg" variant="white" />

// With custom className
<Logo appId="sevapremi" size="xl" className="animate-pulse" />
```

### App Icon with Fallback

```tsx
import { AppIcon } from '@sasarjan/ui';

<AppIcon 
  appId="10xgrowth" 
  size="md"
  fallback={<div className="w-8 h-8 bg-gray-200" />}
/>
```

### Dynamic Favicon

```tsx
import { FaviconProvider } from '@sasarjan/ui';

// In your app layout
export default function Layout({ children }) {
  return (
    <>
      <FaviconProvider appId="talentexcel" />
      {children}
    </>
  );
}
```

### SEO Metadata

```tsx
import { generateNextJSMetadata } from '@repo/assets';

// In your Next.js app
export const metadata = generateNextJSMetadata('talentexcel', {
  title: 'TalentExcel - Modern HR Platform',
  description: 'Streamline your HR processes with TalentExcel',
  keywords: ['HR', 'talent management', 'employee engagement'],
  author: 'SaSarjan Team',
  canonicalUrl: 'https://talentexcel.sasarjan.com'
});
```

### Accessing Logo Paths Directly

```tsx
import { getLogoPath, APP_ASSETS } from '@repo/assets';

// Get specific logo path
const logoPath = getLogoPath(APP_ASSETS.sasarjan.logo, {
  size: 'lg',
  variant: 'white',
  format: 'svg'
});
// Returns: /logos/sasarjan/sasarjan-white-48.svg

// Access favicon paths
const { favicon } = APP_ASSETS.talentexcel;
console.log(favicon.ico); // /favicons/talentexcel/favicon.ico
console.log(favicon.appleTouchIcon); // /favicons/talentexcel/apple-touch-icon.png
```

## Adding New Apps

### 1. Update the Registry

Edit `packages/assets/src/registry.ts`:

```typescript
export const LOGO_REGISTRY: Record<string, LogoAsset> = {
  // ... existing logos
  'your-app': {
    id: 'your-app',
    name: 'Your App Name',
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
  // ... existing apps
  'your-app': {
    logo: LOGO_REGISTRY['your-app'],
    favicon: generateFaviconSet('your-app'),
    ogImage: '/logos/apps/your-app-og.png',
    twitterImage: '/logos/apps/your-app-twitter.png'
  }
};
```

### 2. Add Logo Files

Place your logo files in the appropriate directory:
```
packages/assets/logos/apps/
├── your-app-16.svg
├── your-app-24.svg
├── your-app-32.svg
├── your-app-48.svg
├── your-app-64.svg
├── your-app-128.svg
├── your-app-512.svg
├── your-app-white-32.svg  # White variant
├── your-app-og.png        # 1200x630 for Open Graph
└── your-app-twitter.png   # 1200x600 for Twitter
```

### 3. Add Favicon Set

Create favicon files in:
```
packages/assets/favicons/your-app/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── apple-touch-icon.png
```

## Next.js Configuration

Apps using the centralized assets need to configure asset serving. This is already set up in the web app:

```javascript
// next.config.mjs
export default {
  async rewrites() {
    return [
      {
        source: '/logos/:path*',
        destination: '/assets/logos/:path*',
      },
      {
        source: '/favicons/:path*',
        destination: '/assets/favicons/:path*',
      },
      {
        source: '/icons/:path*',
        destination: '/assets/icons/:path*',
      },
    ];
  },
};
```

And create a symlink in the public directory:
```bash
cd apps/your-app/public
ln -s ../../../packages/assets assets
```

## Best Practices

1. **Always use SVG for logos when possible**
   - Scalable without quality loss
   - Smaller file sizes
   - Better performance

2. **Optimize PNG files**
   - Use tools like `pngquant` or `optipng`
   - Keep file sizes under 50KB for web display
   - Use WebP for modern browsers

3. **Provide all required sizes**
   - Don't rely on browser scaling
   - Each size should be optimized for its use case

4. **Test on different backgrounds**
   - Ensure logos work on light and dark themes
   - Provide appropriate variants

5. **Use semantic naming**
   - Follow the naming convention strictly
   - Makes assets discoverable and maintainable

6. **Version control considerations**
   - Large binary files should be optimized before commit
   - Consider using Git LFS for very large assets

## Troubleshooting

### Logo not displaying

1. Check if the app is registered in `registry.ts`
2. Verify file exists with correct naming convention
3. Ensure Next.js rewrites are configured
4. Check browser console for 404 errors

### Favicon not updating

1. Favicons are aggressively cached by browsers
2. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache completely
4. Test in incognito/private mode

### TypeScript errors

1. Run `pnpm install` to ensure @repo/assets is linked
2. Check that package.json includes the dependency
3. Restart TypeScript server in your IDE

### Build errors

1. Ensure symlink is created in public directory
2. Check that asset files are included in package.json files array
3. Verify all imports resolve correctly

## Migration Guide

If you have existing apps with local assets:

1. Move logo files to `packages/assets/logos/apps/`
2. Rename files following the convention
3. Update imports to use `@sasarjan/ui` components
4. Remove old logo files from app directories
5. Update any hardcoded paths in your code

## Future Enhancements

- [ ] Automatic logo optimization pipeline
- [ ] Dark mode variant generation
- [ ] CDN integration for production
- [ ] Asset usage analytics
- [ ] Automated favicon generation from SVG
- [ ] Brand guideline enforcement tools