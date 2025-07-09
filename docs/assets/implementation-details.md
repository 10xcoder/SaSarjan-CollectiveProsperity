# Asset Management System - Implementation Details

## Technical Architecture

### Package Dependencies

```json
{
  "@repo/assets": {
    "dependencies": {},
    "devDependencies": {
      "@types/node": "^20.11.24",
      "typescript": "^5.3.3"
    }
  },
  "@sasarjan/ui": {
    "dependencies": {
      "@repo/assets": "workspace:*",
      // ... other deps
    }
  },
  "apps": {
    "dependencies": {
      "@repo/assets": "workspace:*",
      "@sasarjan/ui": "workspace:*"
    }
  }
}
```

### Type System

The asset system is fully type-safe with the following core types:

```typescript
// Logo configuration types
export type LogoFormat = 'svg' | 'png' | 'jpg' | 'webp';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type LogoVariant = 'primary' | 'white' | 'black' | 'mono';

// Main asset interface
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

// Favicon set for PWA support
export interface FaviconSet {
  ico: string;
  png16: string;
  png32: string;
  png192: string;
  png512: string;
  appleTouchIcon: string;
}

// Complete app asset bundle
export interface AppAssets {
  logo: LogoAsset;
  favicon: FaviconSet;
  ogImage?: string;
  twitterImage?: string;
}
```

### Asset Resolution Algorithm

The `getLogoPath` function implements smart path resolution:

```typescript
export function getLogoPath(
  asset: LogoAsset,
  options: LogoOptions = {}
): string {
  // 1. Use provided options or fall back to defaults
  const { 
    size = DEFAULT_LOGO_OPTIONS.size, 
    format = asset.defaultFormat, 
    variant = asset.defaultVariant 
  } = options;

  // 2. Convert size key to pixel value
  const sizeValue = LOGO_SIZES[size];

  // 3. Build filename based on variant
  const filename = variant === 'primary' 
    ? `${asset.id}-${sizeValue}.${format}`     // Omit variant for primary
    : `${asset.id}-${variant}-${sizeValue}.${format}`;

  // 4. Construct full path
  return `/logos/${asset.category}/${filename}`;
}
```

### SEO Metadata Generation

The system provides two levels of SEO support:

1. **Generic Meta Tags** - Platform agnostic
```typescript
export function generateSEOTags(
  appId: string, 
  metadata: SEOMetadata
): Record<string, string>
```

2. **Next.js Specific** - Optimized for Next.js apps
```typescript
export function generateNextJSMetadata(
  appId: string, 
  metadata: SEOMetadata
)
```

## File Organization Guidelines

### Logo File Requirements

1. **SVG Files**
   - Viewbox should be square (e.g., `viewBox="0 0 100 100"`)
   - Use relative units for scalability
   - Minimize file size (remove unnecessary metadata)
   - Include proper XML declaration

2. **PNG Files**
   - Export at exact pixel sizes (don't rely on scaling)
   - Use PNG-8 for simple graphics
   - Use PNG-24 for complex graphics with transparency
   - Optimize with tools like `pngquant`

3. **Social Media Images**
   - Open Graph: 1200x630px (1.91:1 ratio)
   - Twitter: 1200x600px (2:1 ratio)
   - File size under 1MB
   - Include text/branding for context

### Directory Structure Rules

```
packages/assets/
├── logos/
│   ├── sasarjan/          # Main platform brand
│   │   └── [files]        # Only SaSarjan logos
│   ├── apps/              # Individual applications
│   │   ├── talentexcel/   # One folder per app
│   │   ├── sevapremi/     
│   │   └── 10xgrowth/     
│   └── brands/            # Partner/customer brands
│       ├── partner1/      
│       └── customer1/     
├── favicons/              # Structured like logos
│   ├── sasarjan/
│   └── apps/
├── icons/                 # Shared UI icons
│   ├── actions/          # Action icons
│   ├── status/           # Status indicators
│   └── navigation/       # Nav icons
└── src/                  # TypeScript source
```

## Component Implementation Details

### Logo Component Internals

```tsx
export function Logo({ 
  appId, 
  size = 'md',
  variant,
  format,
  className,
  alt,
  ...props 
}: LogoProps) {
  // 1. Resolve asset from registry
  const appAssets = APP_ASSETS[appId];
  const logo = appAssets?.logo || LOGO_REGISTRY[appId];
  
  if (!logo) {
    console.warn(`Logo not found for app: ${appId}`);
    return null;
  }

  // 2. Generate path using utility
  const logoPath = getLogoPath(logo, { size, variant, format });
  
  // 3. Use semantic alt text
  const displayAlt = alt || `${logo.name} logo`;

  // 4. Apply responsive sizing
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
```

### FaviconProvider Implementation

```tsx
export function FaviconProvider({ appId }: FaviconProviderProps) {
  React.useEffect(() => {
    const appAssets = APP_ASSETS[appId];
    if (!appAssets) {
      console.warn(`Assets not found for app: ${appId}`);
      return;
    }

    const { favicon } = appAssets;
    const head = document.head;

    // 1. Clean up existing favicons
    const existingFavicons = head.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(el => el.remove());

    // 2. Create new favicon links
    const links = [
      { rel: 'icon', type: 'image/x-icon', href: favicon.ico },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: favicon.png16 },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon.png32 },
      { rel: 'apple-touch-icon', sizes: '180x180', href: favicon.appleTouchIcon },
    ];

    // 3. Append to document head
    links.forEach(({ rel, type, sizes, href }) => {
      const link = document.createElement('link');
      link.rel = rel;
      if (type) link.type = type;
      if (sizes) link.sizes = sizes;
      link.href = href;
      head.appendChild(link);
    });

    // 4. Update web manifest if present
    // ... manifest update logic
  }, [appId]);

  return null;
}
```

## Asset Serving Configuration

### Next.js Static Asset Handling

1. **Development Mode**
   - Symlink in public directory serves files directly
   - No build-time optimization
   - Hot reload works for asset changes

2. **Production Mode**
   - Assets are copied during build
   - Next.js optimizes images automatically
   - CDN-ready with proper cache headers

### Rewrite Rules Explained

```javascript
async rewrites() {
  return [
    // Logos - main asset type
    {
      source: '/logos/:path*',
      destination: '/assets/logos/:path*',
    },
    // Favicons - for browser tabs
    {
      source: '/favicons/:path*',
      destination: '/assets/favicons/:path*',
    },
    // Icons - UI elements
    {
      source: '/icons/:path*',
      destination: '/assets/icons/:path*',
    },
  ];
}
```

### Symlink Setup

```bash
# Why symlinks?
# - Avoids copying files during development
# - Changes reflect immediately
# - Maintains single source of truth

cd apps/your-app/public
ln -s ../../../packages/assets assets

# Verify symlink
ls -la assets/
# Should show: assets -> ../../../packages/assets
```

## Performance Optimization

### Loading Strategies

1. **Lazy Loading**
```tsx
<Logo 
  appId="talentexcel" 
  loading="lazy"
  decoding="async"
/>
```

2. **Preloading Critical Assets**
```tsx
// In document head
<link 
  rel="preload" 
  as="image" 
  href="/logos/sasarjan/sasarjan-32.svg"
/>
```

3. **Responsive Images**
```tsx
// Future enhancement - srcset support
<Logo 
  appId="talentexcel"
  srcSet={{
    '1x': 'md',
    '2x': 'lg',
    '3x': 'xl'
  }}
/>
```

### Caching Strategy

1. **Static Assets**
   - Set long cache headers (1 year)
   - Use content-based hashing for cache busting
   - Enable brotli/gzip compression

2. **Dynamic Selection**
   - Cache logo registry in memory
   - Minimize runtime calculations
   - Use React.memo for component optimization

## Security Considerations

### Asset Validation

1. **File Type Checking**
   - Validate MIME types on upload
   - Restrict to allowed formats only
   - Scan for malicious content

2. **Path Traversal Prevention**
   - Sanitize all user inputs
   - Use whitelist for allowed paths
   - No direct file system access

3. **CDN Security**
   - Use HTTPS only
   - Set security headers
   - Enable hotlink protection

## Testing Strategies

### Unit Tests

```typescript
describe('Logo Component', () => {
  it('should render with default props', () => {
    render(<Logo appId="sasarjan" />);
    expect(screen.getByAltText('SaSarjan logo')).toBeInTheDocument();
  });

  it('should apply size classes', () => {
    render(<Logo appId="sasarjan" size="lg" />);
    expect(screen.getByAltText('SaSarjan logo')).toHaveClass('h-12 w-12');
  });
});
```

### Integration Tests

```typescript
describe('Asset Loading', () => {
  it('should load logo from correct path', () => {
    const logoPath = getLogoPath(APP_ASSETS.talentexcel.logo, {
      size: 'md',
      variant: 'primary'
    });
    expect(logoPath).toBe('/logos/apps/talentexcel-32.svg');
  });
});
```

### Visual Regression Tests

- Use tools like Percy or Chromatic
- Capture all logo variants
- Test on different backgrounds
- Verify responsive behavior

## Debugging Guide

### Common Issues

1. **404 Errors**
   - Check file exists with exact name
   - Verify symlink is working
   - Check Next.js rewrite rules
   - Look for typos in registry

2. **Wrong Logo Displayed**
   - Clear browser cache
   - Check appId matches registry
   - Verify variant/size logic
   - Check for duplicate files

3. **TypeScript Errors**
   - Run `pnpm install`
   - Restart TS server
   - Check import paths
   - Verify package exports

### Debug Utilities

```typescript
// Add to development builds
export function debugAssetPath(appId: string, options?: LogoOptions) {
  const asset = APP_ASSETS[appId]?.logo || LOGO_REGISTRY[appId];
  console.log('Asset:', asset);
  console.log('Options:', options);
  console.log('Path:', getLogoPath(asset, options));
  console.log('File exists:', /* check file system */);
}
```

## Maintenance Tasks

### Regular Audits

1. **Monthly**
   - Check for unused assets
   - Verify all apps have complete sets
   - Update documentation
   - Review file sizes

2. **Quarterly**
   - Optimize image files
   - Update dependencies
   - Review naming conventions
   - Test all variants

### Asset Cleanup Script

```bash
#!/bin/bash
# Find unused assets
echo "Checking for unused assets..."

# List all registered apps
APPS=$(cat packages/assets/src/registry.ts | grep -oP "(?<=')[^']+(?=':\s*{)")

# Check each app directory
for app in $APPS; do
  echo "Checking $app..."
  # Find missing sizes, variants, etc.
done
```

## Future Roadmap

### Phase 1: Automation (Q2 2025)
- [ ] Automated favicon generation from SVG
- [ ] Logo variant generation (dark/light)
- [ ] Build-time optimization pipeline
- [ ] Asset usage analytics

### Phase 2: Enhanced Features (Q3 2025)
- [ ] Dynamic logo themes
- [ ] Animated logo support
- [ ] AI-powered logo suggestions
- [ ] Brand compliance checking

### Phase 3: Scale & Performance (Q4 2025)
- [ ] Global CDN integration
- [ ] Edge caching
- [ ] WebP auto-generation
- [ ] Lazy loading improvements

## Contributing

When adding new features:

1. Update type definitions first
2. Add to registry with full metadata
3. Create comprehensive tests
4. Update documentation
5. Add migration guide if breaking changes