# @repo/assets

Centralized assets package for SaSarjan App Store platform.

## Structure

```
packages/assets/
├── logos/
│   ├── sasarjan/        # Main brand logos
│   ├── apps/            # Individual app logos  
│   └── brands/          # Partner brand logos
├── icons/               # UI icons
├── favicons/            # Favicon sets
└── src/                 # TypeScript utilities
```

## Logo Naming Convention

```
{app-id}-{variant}-{size}.{format}
```

Examples:
- `sasarjan-primary-32.svg`
- `talentexcel-white-128.png`
- `sevapremi-64.svg` (primary variant)

## Sizes

- `xs`: 16px
- `sm`: 24px  
- `md`: 32px
- `lg`: 48px
- `xl`: 64px
- `2xl`: 128px
- `full`: 512px

## Usage

```typescript
import { getLogoPath, APP_ASSETS } from '@repo/assets';

// Get logo path
const logoPath = getLogoPath(APP_ASSETS.sasarjan.logo, {
  size: 'lg',
  format: 'svg',
  variant: 'primary'
});

// Get favicon set
const favicons = APP_ASSETS.sasarjan.favicon;
```

## Adding New Logos

1. Add logo files following naming convention
2. Update `src/registry.ts` with logo metadata
3. Generate required sizes and formats
4. Create favicon set if needed