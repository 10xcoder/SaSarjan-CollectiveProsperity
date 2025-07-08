# Internationalization (i18n) Strategy

**Created: 04-Jul-25**

## Table of Contents

1. [Overview](#overview)
2. [Supported Languages & Regions](#supported-languages--regions)
3. [Technical Architecture](#technical-architecture)
4. [Implementation Approach](#implementation-approach)
5. [Content Management](#content-management)
6. [Localization Workflow](#localization-workflow)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)

## Overview

The internationalization strategy for SaSarjan App Store enables global accessibility by supporting multiple languages, regional formats, and cultural adaptations. Our approach prioritizes:

- **Scalability**: Easy addition of new languages and regions
- **Performance**: Minimal impact on load times
- **Maintainability**: Centralized translation management
- **User Experience**: Seamless language switching
- **Developer Experience**: Simple API for developers

### Key Features

- 20+ language support initially
- RTL (Right-to-Left) language support
- Dynamic language detection and switching
- Regional number, date, and currency formatting
- Localized content and assets
- Cultural adaptations and regional compliance

## Supported Languages & Regions

### Phase 1: Priority Languages (Launch)

1. **English** (en) - Global default
2. **Hindi** (hi) - Primary Indian language
3. **Spanish** (es) - Latin America focus
4. **Mandarin Chinese** (zh-CN) - Simplified
5. **Arabic** (ar) - RTL support

### Phase 2: Major Languages (3 months)

6. **French** (fr)
7. **German** (de)
8. **Japanese** (ja)
9. **Portuguese** (pt-BR) - Brazilian
10. **Russian** (ru)
11. **Korean** (ko)
12. **Italian** (it)

### Phase 3: Regional Languages (6 months)

13. **Tamil** (ta) - South India
14. **Telugu** (te) - South India
15. **Bengali** (bn) - East India
16. **Marathi** (mr) - West India
17. **Gujarati** (gu) - West India
18. **Turkish** (tr)
19. **Dutch** (nl)
20. **Polish** (pl)

### Regional Formats

```typescript
interface RegionalFormats {
  // Number formatting
  numbers: {
    decimal: string; // "." or ","
    thousands: string; // "," or " " or "."
    grouping: number[]; // [3] or [3,2]
  };

  // Currency formatting
  currency: {
    symbol: string;
    position: 'before' | 'after';
    decimal: string;
    thousands: string;
    precision: number;
  };

  // Date/Time formatting
  dateTime: {
    dateFormat: string; // "DD/MM/YYYY", "MM/DD/YYYY", etc.
    timeFormat: '12h' | '24h';
    firstDayOfWeek: number; // 0-6 (Sunday-Saturday)
    timezone: string;
  };

  // Other regional settings
  measurement: 'metric' | 'imperial';
  paperSize: 'A4' | 'Letter';
  phoneFormat: string; // "+1 (XXX) XXX-XXXX"
}
```

## Technical Architecture

### Next.js Integration with next-intl

```typescript
// app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} dir={getDirection(locale)}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Translation File Structure

```
/messages
├── en.json          # English (default)
├── hi.json          # Hindi
├── es.json          # Spanish
├── zh-CN.json       # Simplified Chinese
├── ar.json          # Arabic
└── shared/
    ├── countries.json
    ├── currencies.json
    └── timezones.json
```

### Message Format

```json
// messages/en.json
{
  "common": {
    "appStore": "App Store",
    "search": "Search",
    "categories": "Categories",
    "myApps": "My Apps",
    "wallet": "Wallet"
  },
  "home": {
    "welcome": "Welcome to {appStore}",
    "featuredApps": "Featured Apps",
    "recommendedForYou": "Recommended for You",
    "newReleases": "New Releases"
  },
  "app": {
    "install": "Install",
    "update": "Update",
    "uninstall": "Uninstall",
    "price": "{price, number, currency}",
    "rating": "{rating, number, ::precision=1} stars",
    "downloads": "{count, plural, =0 {No downloads} one {# download} other {# downloads}}"
  },
  "errors": {
    "notFound": "Page not found",
    "serverError": "Something went wrong",
    "networkError": "Check your internet connection"
  }
}
```

### API Integration

```typescript
// Internationalized API responses
interface I18nAPIResponse<T> {
  data: T;
  locale: string;
  messages?: LocalizedMessages;
}

// API middleware for content negotiation
export async function i18nMiddleware(req: NextRequest) {
  const locale = negotiateLocale(req);

  // Set locale for API responses
  req.headers.set('Accept-Language', locale);

  // Add locale to API context
  return NextResponse.next({
    headers: {
      'X-Locale': locale
    }
  });
}

// Dynamic content localization
class ContentLocalizer {
  async localizeApp(app: App, locale: string): Promise<LocalizedApp> {
    const translations = await this.getTranslations(app.id, locale);

    return {
      ...app,
      name: translations.name || app.name,
      description: translations.description || app.description,
      screenshots: this.localizeScreenshots(app.screenshots, locale),
      metadata: this.localizeMetadata(app.metadata, locale)
    };
  }
}
```

## Implementation Approach

### 1. Routing Strategy

```typescript
// middleware.ts
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

const locales = ['en', 'hi', 'es', 'zh-CN', 'ar'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  // Check if locale is in pathname
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Detect user's preferred locale
  const locale = negotiateLocale(request);

  // Redirect to localized path
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

function negotiateLocale(request: NextRequest): string {
  // 1. Check cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const negotiated = negotiateLanguages(acceptLanguage, locales);
    if (negotiated) return negotiated;
  }

  // 3. Check geo location
  const country = request.geo?.country;
  const geoLocale = getLocaleForCountry(country);
  if (geoLocale && locales.includes(geoLocale)) {
    return geoLocale;
  }

  return defaultLocale;
}
```

### 2. Component Internationalization

```typescript
// Internationalized component example
import {useTranslations} from 'next-intl';
import {useFormatter} from 'next-intl';

export function AppCard({app}: {app: App}) {
  const t = useTranslations('app');
  const format = useFormatter();

  return (
    <div className="app-card">
      <h3>{app.localizedName}</h3>
      <p>{app.localizedDescription}</p>

      <div className="app-stats">
        <span>{format.number(app.rating, {maximumFractionDigits: 1})} ⭐</span>
        <span>{t('downloads', {count: app.downloadCount})}</span>
      </div>

      <div className="app-price">
        {app.price === 0
          ? t('free')
          : format.number(app.price, {
              style: 'currency',
              currency: app.currency
            })
        }
      </div>

      <button>
        {app.isInstalled ? t('update') : t('install')}
      </button>
    </div>
  );
}
```

### 3. RTL Support

```typescript
// RTL language detection and styling
const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

// Tailwind CSS RTL utilities
export const rtlStyles = {
  // Margin and padding
  'ms-4': 'ltr:ml-4 rtl:mr-4',
  'me-4': 'ltr:mr-4 rtl:ml-4',
  'ps-4': 'ltr:pl-4 rtl:pr-4',
  'pe-4': 'ltr:pr-4 rtl:pl-4',

  // Positioning
  'start-0': 'ltr:left-0 rtl:right-0',
  'end-0': 'ltr:right-0 rtl:left-0',

  // Text alignment
  'text-start': 'ltr:text-left rtl:text-right',
  'text-end': 'ltr:text-right rtl:text-left',

  // Borders
  'border-s': 'ltr:border-l rtl:border-r',
  'border-e': 'ltr:border-r rtl:border-l'
};
```

### 4. Dynamic Language Switching

```typescript
// Language switcher component
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLanguage = (newLocale: string) => {
    // Update cookie
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;

    // Navigate to new locale
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <select value={locale} onChange={(e) => switchLanguage(e.target.value)}>
      {locales.map(loc => (
        <option key={loc} value={loc}>
          {getLanguageName(loc)}
        </option>
      ))}
    </select>
  );
}
```

## Content Management

### 1. Translation Management System

```typescript
interface TranslationManagement {
  // Source content management
  source: {
    extract(): Promise<SourceStrings[]>;
    validate(): Promise<ValidationResult>;
    freeze(): Promise<void>; // Lock for translation
  };

  // Translation workflow
  workflow: {
    createJob(locale: string): Promise<TranslationJob>;
    assignTranslator(jobId: string, translatorId: string): Promise<void>;
    review(jobId: string): Promise<ReviewResult>;
    approve(jobId: string): Promise<void>;
  };

  // Import/Export
  io: {
    exportForTranslation(locale: string): Promise<File>;
    importTranslations(file: File, locale: string): Promise<void>;
    sync(): Promise<SyncResult>;
  };

  // Quality assurance
  qa: {
    checkCompleteness(locale: string): Promise<Coverage>;
    checkConsistency(locale: string): Promise<ConsistencyReport>;
    checkFormatting(locale: string): Promise<FormattingIssues>;
  };
}
```

### 2. Dynamic Content Localization

```typescript
// Database schema for localized content
interface LocalizedContent {
  id: string;
  entityType: 'app' | 'category' | 'announcement';
  entityId: string;
  locale: string;
  fields: {
    name?: string;
    description?: string;
    features?: string[];
    screenshots?: LocalizedAsset[];
    metadata?: Record<string, any>;
  };
  status: 'draft' | 'review' | 'approved' | 'published';
  lastModified: Date;
}

// Content delivery API
class LocalizedContentAPI {
  async getContent(
    entityId: string,
    locale: string,
    fallback: boolean = true
  ): Promise<LocalizedContent> {
    // Try exact locale match
    let content = await this.db.findOne({
      entityId,
      locale,
      status: 'published'
    });

    // Fall back to language without region
    if (!content && fallback && locale.includes('-')) {
      const language = locale.split('-')[0];
      content = await this.db.findOne({
        entityId,
        locale: language,
        status: 'published'
      });
    }

    // Fall back to default locale
    if (!content && fallback) {
      content = await this.db.findOne({
        entityId,
        locale: defaultLocale,
        status: 'published'
      });
    }

    return content;
  }
}
```

### 3. Asset Localization

```typescript
// Localized asset management
interface LocalizedAssetManager {
  // Upload localized assets
  async uploadAsset(
    file: File,
    metadata: {
      entityId: string;
      assetType: 'screenshot' | 'icon' | 'banner';
      locale: string;
      order?: number;
    }
  ): Promise<LocalizedAsset>;

  // Get localized asset URL
  getAssetUrl(
    assetId: string,
    locale: string,
    options?: {
      width?: number;
      height?: number;
      format?: 'webp' | 'jpg' | 'png';
    }
  ): string;

  // Automatic image text localization
  async localizeImageText(
    imageId: string,
    fromLocale: string,
    toLocale: string
  ): Promise<LocalizedAsset>;
}
```

## Localization Workflow

### 1. Developer Workflow

```bash
# Extract new strings for translation
npm run i18n:extract

# Validate translations
npm run i18n:validate

# Compile translations
npm run i18n:compile

# Test specific locale
npm run dev -- --locale=hi
```

### 2. Translator Workflow

```typescript
// Translator portal interface
interface TranslatorPortal {
  // View assigned translations
  assignments: {
    list(): Promise<TranslationAssignment[]>;
    accept(id: string): Promise<void>;
    submit(id: string, translations: Translations): Promise<void>;
  };

  // Translation tools
  tools: {
    glossary: Map<string, string>;
    memory: TranslationMemory;
    machineTranslation: (text: string) => Promise<string>;
    spellCheck: (text: string, locale: string) => Promise<SpellCheckResult>;
  };

  // Context and references
  context: {
    getScreenshot(stringId: string): Promise<string>;
    getSimilarTranslations(text: string): Promise<Translation[]>;
    getUsageExample(stringId: string): Promise<UsageExample>;
  };
}
```

### 3. Review Process

```typescript
// Translation review system
class TranslationReview {
  async reviewTranslation(
    translationId: string,
    reviewerId: string
  ): Promise<ReviewResult> {
    const translation = await this.getTranslation(translationId);

    // Automated checks
    const automated = await this.runAutomatedChecks(translation);

    // Manual review interface
    const manual = await this.getManualReview(translationId, reviewerId);

    return {
      automated,
      manual,
      status: this.determineStatus(automated, manual),
      feedback: this.compileFeedback(automated, manual)
    };
  }

  private async runAutomatedChecks(translation: Translation) {
    return {
      grammar: await this.checkGrammar(translation),
      terminology: await this.checkTerminology(translation),
      consistency: await this.checkConsistency(translation),
      formatting: await this.checkFormatting(translation),
      length: await this.checkLength(translation)
    };
  }
}
```

## Performance Optimization

### 1. Translation Loading Strategy

```typescript
// Lazy loading translations
const loadTranslations = cache(async (locale: string, namespace: string) => {
  const messages = await import(`/messages/${locale}/${namespace}.json`);
  return messages.default;
});

// Preload critical translations
export async function preloadCriticalTranslations(locale: string) {
  const critical = ['common', 'errors', 'navigation'];
  await Promise.all(
    critical.map(ns => loadTranslations(locale, ns))
  );
}

// Progressive enhancement
export function ProgressiveI18n({
  children,
  locale,
  namespace
}: {
  children: React.ReactNode;
  locale: string;
  namespace: string;
}) {
  const [messages, setMessages] = useState<Messages>();

  useEffect(() => {
    loadTranslations(locale, namespace).then(setMessages);
  }, [locale, namespace]);

  if (!messages) {
    return <>{children}</>; // Render with keys as fallback
  }

  return (
    <I18nProvider messages={messages}>
      {children}
    </I18nProvider>
  );
}
```

### 2. CDN Strategy

```typescript
// CDN configuration for translations
const cdnConfig = {
  // Static translations on CDN
  static: {
    baseUrl: 'https://cdn.sasarjan.com/i18n',
    version: process.env.BUILD_ID,
    cache: {
      maxAge: 86400, // 1 day
      staleWhileRevalidate: 604800 // 1 week
    }
  },

  // Dynamic translations API
  dynamic: {
    endpoint: '/api/i18n/content',
    cache: {
      maxAge: 3600, // 1 hour
      vary: ['Accept-Language', 'X-User-Segment']
    }
  }
};

// Translation loader with CDN
async function loadFromCDN(locale: string, namespace: string) {
  const url = `${cdnConfig.static.baseUrl}/${locale}/${namespace}.json?v=${cdnConfig.static.version}`;

  const response = await fetch(url, {
    cache: 'force-cache',
    next: {
      revalidate: cdnConfig.static.cache.maxAge
    }
  });

  return response.json();
}
```

### 3. Bundle Optimization

```typescript
// Webpack configuration for i18n
module.exports = {
  resolve: {
    alias: {
      'messages': path.resolve(__dirname, 'messages')
    }
  },
  module: {
    rules: [
      {
        test: /messages\/.*\.json$/,
        type: 'javascript/auto',
        use: [
          {
            loader: 'i18n-optimize-loader',
            options: {
              removeUnused: true,
              minify: true,
              precompile: true
            }
          }
        ]
      }
    ]
  }
};

// Next.js config for i18n optimization
module.exports = {
  i18n: {
    locales,
    defaultLocale
  },
  experimental: {
    optimizePackageImports: ['next-intl']
  }
};
```

## Testing Strategy

### 1. Unit Testing

```typescript
// Testing internationalized components
import {render, screen} from '@testing-library/react';
import {NextIntlProvider} from 'next-intl';

describe('AppCard', () => {
  const messages = {
    app: {
      install: 'Install',
      downloads: '{count, plural, =0 {No downloads} one {# download} other {# downloads}}'
    }
  };

  it('renders in English', () => {
    render(
      <NextIntlProvider locale="en" messages={messages}>
        <AppCard app={mockApp} />
      </NextIntlProvider>
    );

    expect(screen.getByText('Install')).toBeInTheDocument();
  });

  it('handles pluralization', () => {
    const appWithDownloads = {...mockApp, downloadCount: 1000};
    render(
      <NextIntlProvider locale="en" messages={messages}>
        <AppCard app={appWithDownloads} />
      </NextIntlProvider>
    );

    expect(screen.getByText('1,000 downloads')).toBeInTheDocument();
  });
});
```

### 2. Visual Testing

```typescript
// Visual regression testing for RTL layouts
describe('RTL Layout Tests', () => {
  const rtlLocales = ['ar', 'he'];

  rtlLocales.forEach(locale => {
    it(`renders correctly in ${locale}`, async () => {
      await page.goto(`/${locale}/apps`);

      // Check direction attribute
      const html = await page.$('html');
      const dir = await html.getAttribute('dir');
      expect(dir).toBe('rtl');

      // Visual snapshot
      await expect(page).toMatchSnapshot(`rtl-${locale}.png`);
    });
  });
});
```

### 3. E2E Testing

```typescript
// End-to-end internationalization tests
test.describe('Language Switching', () => {
  test('switches language and persists choice', async ({page}) => {
    // Start in English
    await page.goto('/en');

    // Switch to Hindi
    await page.selectOption('[data-testid="language-switcher"]', 'hi');

    // Verify URL changed
    await expect(page).toHaveURL('/hi');

    // Verify content changed
    await expect(page.locator('h1')).toContainText('ऐप स्टोर में आपका स्वागत है');

    // Refresh and verify persistence
    await page.reload();
    await expect(page).toHaveURL('/hi');
  });
});
```

## Monitoring & Analytics

```typescript
// I18n analytics tracking
interface I18nAnalytics {
  // Track language usage
  trackLanguageUsage(locale: string, userId: string): void;

  // Track translation issues
  trackMissingTranslation(key: string, locale: string): void;
  trackTranslationError(error: Error, locale: string): void;

  // Performance metrics
  trackTranslationLoadTime(locale: string, duration: number): void;
  trackLocaleDetectionAccuracy(detected: string, actual: string): void;

  // User behavior
  trackLanguageSwitch(from: string, to: string): void;
  trackLocalePreference(locale: string): void;
}

// Dashboard metrics
interface I18nMetrics {
  usage: {
    byLocale: Map<string, number>;
    byCountry: Map<string, Map<string, number>>;
    trends: TimeSeriesData;
  };

  quality: {
    missingTranslations: Map<string, string[]>;
    errorRate: Map<string, number>;
    coveragePercentage: Map<string, number>;
  };

  performance: {
    loadTimeP50: Map<string, number>;
    loadTimeP99: Map<string, number>;
    cacheHitRate: number;
  };
}
```

---

**Document Version**: 1.0  
**Last Updated**: 04-Jul-25  
**Next Review**: 11-Jul-25
