# Theme Configuration System

**Created: 04-Jul-25**

## Table of Contents

1. [Overview](#overview)
2. [Architecture Design](#architecture-design)
3. [Theme Structure](#theme-structure)
4. [Implementation Details](#implementation-details)
5. [Developer API](#developer-api)
6. [Performance Optimization](#performance-optimization)
7. [Accessibility](#accessibility)
8. [Examples & Patterns](#examples--patterns)

## Overview

The Theme Configuration System provides a comprehensive solution for dynamic theming across the SaSarjan App Store platform. It enables both platform-wide themes and app-specific customization through a flexible, performant architecture.

### Key Features

- **Dynamic Theme Switching**: Real-time theme changes without reload
- **App-Level Theming**: Each app can have its own color palette
- **Accessibility First**: WCAG AAA compliant color combinations
- **Performance Optimized**: CSS variables for zero runtime overhead
- **Developer Friendly**: Simple API with TypeScript support
- **User Preferences**: Save and sync theme choices across devices
- **Automatic Dark Mode**: System preference detection and adaptation

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Theme Sources                            │
├─────────────────┬────────────────┬──────────────────────────┤
│   System Theme  │  User Selection │    App Configuration    │
│  • Light/Dark   │  • Custom theme │  • Brand colors        │
│  • High contrast│  • Saved prefs  │  • Color palette       │
│  • Color scheme │  • A11y needs   │  • Custom properties   │
└────────┬────────┴────────┬───────┴────────┬─────────────────┘
         │                 │                 │
┌────────▼─────────────────▼─────────────────▼─────────────────┐
│                    Theme Engine                              │
├──────────────────────────────────────────────────────────────┤
│  Theme Resolver │ Palette Generator │ Accessibility Validator │
│  • Priority     │ • Color harmony   │ • Contrast checker     │
│  • Merging      │ • Shade creation  │ • Color blindness      │
│  • Fallbacks    │ • Tint/tone calc  │ • WCAG compliance      │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                  CSS Generation Layer                        │
├──────────────────────────────────────────────────────────────┤
│  CSS Variables  │  Utility Classes  │  Component Styles     │
│  • --color-*    │  • .bg-primary    │  • Button variants    │
│  • --spacing-*  │  • .text-accent   │  • Card themes        │
│  • --radius-*   │  • .border-muted  │  • Input styles       │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                  Application Layer                           │
│           Next.js + Tailwind CSS + Shadcn/ui               │
└──────────────────────────────────────────────────────────────┘
```

### Core Components

```typescript
// Theme engine core
interface ThemeEngine {
  // Theme resolution
  resolver: ThemeResolver;
  generator: PaletteGenerator;
  validator: AccessibilityValidator;

  // Theme application
  apply(theme: Theme): void;
  merge(themes: Theme[]): Theme;
  validate(theme: Theme): ValidationResult;

  // Theme persistence
  save(theme: Theme): Promise<void>;
  load(themeId: string): Promise<Theme>;
  sync(userId: string): Promise<void>;
}

// Theme structure
interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark' | 'auto';
  colors: ColorPalette;
  typography: Typography;
  spacing: SpacingScale;
  borders: BorderConfig;
  shadows: ShadowScale;
  animations: AnimationConfig;
  custom: Record<string, any>;
}
```

## Theme Structure

### 1. Color Palette

```typescript
interface ColorPalette {
  // Primary brand colors
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;

  // Semantic colors
  semantic: {
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
  };

  // Neutral colors
  neutral: {
    background: ColorScale;
    foreground: ColorScale;
    border: ColorScale;
    muted: ColorScale;
  };

  // Special purpose
  special: {
    overlay: string;
    highlight: string;
    focus: string;
    selection: string;
  };
}

interface ColorScale {
  50: string;   // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;  // Darkest
}
```

### 2. Color Generation Algorithm

```typescript
class PaletteGenerator {
  // Generate full palette from base color
  generatePalette(baseColor: string): ColorScale {
    const hsl = this.hexToHSL(baseColor);

    return {
      50: this.adjustColor(hsl, { l: 97, s: -30 }),
      100: this.adjustColor(hsl, { l: 94, s: -20 }),
      200: this.adjustColor(hsl, { l: 86, s: -10 }),
      300: this.adjustColor(hsl, { l: 77, s: -5 }),
      400: this.adjustColor(hsl, { l: 66, s: 0 }),
      500: baseColor, // Original color
      600: this.adjustColor(hsl, { l: 54, s: 5 }),
      700: this.adjustColor(hsl, { l: 47, s: 10 }),
      800: this.adjustColor(hsl, { l: 39, s: 15 }),
      900: this.adjustColor(hsl, { l: 32, s: 20 }),
      950: this.adjustColor(hsl, { l: 24, s: 25 })
    };
  }

  // Generate complementary colors
  generateHarmony(baseColor: string): ColorHarmony {
    const hsl = this.hexToHSL(baseColor);

    return {
      complementary: this.rotateHue(hsl, 180),
      triadic: [
        this.rotateHue(hsl, 120),
        this.rotateHue(hsl, 240)
      ],
      analogous: [
        this.rotateHue(hsl, -30),
        this.rotateHue(hsl, 30)
      ],
      splitComplementary: [
        this.rotateHue(hsl, 150),
        this.rotateHue(hsl, 210)
      ]
    };
  }
}
```

### 3. Theme Configuration Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Theme name"
    },
    "extends": {
      "type": "string",
      "description": "Parent theme to extend"
    },
    "colors": {
      "type": "object",
      "properties": {
        "primary": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$"
        },
        "secondary": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$"
        }
      }
    },
    "overrides": {
      "type": "object",
      "description": "Component-specific overrides"
    }
  }
}
```

## Implementation Details

### 1. CSS Variable System

```typescript
// Generate CSS variables from theme
function generateCSSVariables(theme: Theme): string {
  const cssVars: string[] = [];

  // Color variables
  Object.entries(theme.colors).forEach(([name, scale]) => {
    if (typeof scale === 'object') {
      Object.entries(scale).forEach(([shade, value]) => {
        cssVars.push(`--color-${name}-${shade}: ${value};`);
      });
    } else {
      cssVars.push(`--color-${name}: ${scale};`);
    }
  });

  // Spacing variables
  Object.entries(theme.spacing).forEach(([size, value]) => {
    cssVars.push(`--spacing-${size}: ${value};`);
  });

  // Border radius
  Object.entries(theme.borders.radius).forEach(([size, value]) => {
    cssVars.push(`--radius-${size}: ${value};`);
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([size, value]) => {
    cssVars.push(`--shadow-${size}: ${value};`);
  });

  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
}

// Apply theme to document
export function applyTheme(theme: Theme): void {
  // Generate CSS
  const css = generateCSSVariables(theme);

  // Find or create style element
  let styleEl = document.getElementById('theme-variables');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'theme-variables';
    document.head.appendChild(styleEl);
  }

  // Update styles
  styleEl.textContent = css;

  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.colors.primary[500]);
  }

  // Dispatch theme change event
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}
```

### 2. Tailwind Integration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Dynamic theme colors
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
        },
        secondary: {
          // Similar structure
        },
        // Semantic colors
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
    },
  },
  plugins: [
    // Custom plugin for theme utilities
    function({ addUtilities }) {
      addUtilities({
        '.theme-transition': {
          transition: 'color 200ms, background-color 200ms, border-color 200ms',
        },
      });
    },
  ],
};
```

### 3. React Context & Hooks

```typescript
// Theme context provider
import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleMode: () => void;
  updateColors: (colors: Partial<ColorPalette>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      setThemeState(parsed);
      applyTheme(parsed);
    }
  }, []);

  // Save theme changes
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', JSON.stringify(newTheme));

    // Sync across tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: JSON.stringify(newTheme)
    }));
  };

  // Toggle dark/light mode
  const toggleMode = () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    const newTheme = generateThemeForMode(theme, newMode);
    setTheme(newTheme);
  };

  // Update specific colors
  const updateColors = (colors: Partial<ColorPalette>) => {
    const newTheme = {
      ...theme,
      colors: mergeDeep(theme.colors, colors)
    };
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleMode, updateColors, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Hook for theme-aware styles
export function useThemedStyles<T extends Record<string, any>>(
  styles: (theme: Theme) => T
): T {
  const { theme } = useTheme();
  return useMemo(() => styles(theme), [theme, styles]);
}
```

### 4. App-Specific Theming

```typescript
// App theme configuration
interface AppThemeConfig {
  appId: string;
  brandColors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  overrides?: {
    components?: ComponentOverrides;
    spacing?: Partial<SpacingScale>;
    typography?: Partial<Typography>;
  };
  restrictions?: {
    allowDarkMode?: boolean;
    allowCustomization?: boolean;
    enforceAccessibility?: boolean;
  };
}

// Apply app theme
export function AppThemeProvider({
  appId,
  config,
  children
}: {
  appId: string;
  config: AppThemeConfig;
  children: React.ReactNode;
}) {
  const { theme: globalTheme } = useTheme();
  const [appTheme, setAppTheme] = useState<Theme>();

  useEffect(() => {
    // Generate app-specific theme
    const generated = generateAppTheme(globalTheme, config);

    // Validate accessibility
    if (config.restrictions?.enforceAccessibility) {
      const validation = validateAccessibility(generated);
      if (!validation.passes) {
        console.warn('App theme fails accessibility:', validation.issues);
        // Apply fixes
        generated = applyAccessibilityFixes(generated, validation);
      }
    }

    setAppTheme(generated);
  }, [globalTheme, config]);

  if (!appTheme) return null;

  return (
    <div className="app-theme-container" data-app-id={appId}>
      <style>{generateScopedCSS(appTheme, appId)}</style>
      {children}
    </div>
  );
}

// Generate scoped CSS for app
function generateScopedCSS(theme: Theme, appId: string): string {
  const vars = generateCSSVariables(theme);
  return vars.replace(':root', `[data-app-id="${appId}"]`);
}
```

## Developer API

### 1. Theme Creation API

```typescript
// Simple theme creation
const myTheme = createTheme({
  name: 'Ocean Blue',
  colors: {
    primary: '#0066CC',
    secondary: '#00AA66'
  }
});

// Advanced theme creation
const advancedTheme = createTheme({
  name: 'Corporate',
  extends: 'default',
  colors: {
    primary: '#1E40AF',
    secondary: '#7C3AED',
    accent: '#F59E0B'
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      base: '16px',
      scale: 1.25
    }
  },
  spacing: {
    unit: 4,
    scale: [0, 1, 2, 3, 5, 8, 13, 21]
  },
  components: {
    button: {
      borderRadius: 'var(--radius-md)',
      fontWeight: '500',
      transition: 'all 200ms ease'
    }
  }
});
```

### 2. Theme Utilities

```typescript
// Color manipulation utilities
export const color = {
  // Lighten/darken
  lighten: (color: string, amount: number) => {
    const hsl = hexToHSL(color);
    hsl.l = Math.min(100, hsl.l + amount);
    return hslToHex(hsl);
  },

  darken: (color: string, amount: number) => {
    const hsl = hexToHSL(color);
    hsl.l = Math.max(0, hsl.l - amount);
    return hslToHex(hsl);
  },

  // Alpha channel
  alpha: (color: string, alpha: number) => {
    const rgb = hexToRGB(color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  },

  // Contrast color
  contrast: (background: string) => {
    const rgb = hexToRGB(background);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  },

  // Mix colors
  mix: (color1: string, color2: string, weight: number = 0.5) => {
    const rgb1 = hexToRGB(color1);
    const rgb2 = hexToRGB(color2);

    return rgbToHex({
      r: Math.round(rgb1.r * (1 - weight) + rgb2.r * weight),
      g: Math.round(rgb1.g * (1 - weight) + rgb2.g * weight),
      b: Math.round(rgb1.b * (1 - weight) + rgb2.b * weight)
    });
  }
};

// Theme validation
export function validateTheme(theme: Theme): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check color contrast
  const bg = theme.colors.neutral.background[500];
  const fg = theme.colors.neutral.foreground[500];
  const contrast = getContrast(bg, fg);

  if (contrast < 4.5) {
    errors.push({
      path: 'colors.neutral',
      message: `Insufficient contrast ratio: ${contrast.toFixed(2)} (minimum 4.5)`
    });
  }

  // Check required colors
  const required = ['primary', 'secondary', 'error', 'success'];
  for (const color of required) {
    if (!theme.colors[color]) {
      errors.push({
        path: `colors.${color}`,
        message: `Required color '${color}' is missing`
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
```

### 3. Component Theming

```typescript
// Themed component example
import { cn } from '@/lib/utils';

interface ThemedButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function ThemedButton({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ThemedButtonProps) {
  const { theme } = useTheme();

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors theme-transition',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Performance Optimization

### 1. CSS Variable Performance

```typescript
// Optimized CSS variable updates
class ThemePerformance {
  private pendingUpdates = new Map<string, string>();
  private rafId: number | null = null;

  // Batch CSS variable updates
  updateVariable(name: string, value: string) {
    this.pendingUpdates.set(name, value);

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flushUpdates();
      });
    }
  }

  private flushUpdates() {
    const root = document.documentElement;

    // Apply all updates in single reflow
    this.pendingUpdates.forEach((value, name) => {
      root.style.setProperty(name, value);
    });

    this.pendingUpdates.clear();
    this.rafId = null;
  }
}

// Memoized theme calculations
const themeCache = new Map<string, any>();

export function memoizedThemeCalculation<T>(
  key: string,
  calculation: () => T
): T {
  if (themeCache.has(key)) {
    return themeCache.get(key);
  }

  const result = calculation();
  themeCache.set(key, result);

  // Clear cache on theme change
  window.addEventListener('themechange', () => {
    themeCache.delete(key);
  }, { once: true });

  return result;
}
```

### 2. Lazy Theme Loading

```typescript
// Lazy load theme variations
const themeLoader = {
  async loadTheme(themeId: string): Promise<Theme> {
    // Check cache
    const cached = await caches.match(`/themes/${themeId}.json`);
    if (cached) {
      return cached.json();
    }

    // Fetch theme
    const response = await fetch(`/api/themes/${themeId}`);
    const theme = await response.json();

    // Cache for offline use
    const cache = await caches.open('themes-v1');
    await cache.put(`/themes/${themeId}.json`, response.clone());

    return theme;
  },

  // Preload popular themes
  async preloadThemes(themeIds: string[]) {
    const promises = themeIds.map(id =>
      this.loadTheme(id).catch(() => null)
    );

    await Promise.all(promises);
  }
};

// Progressive theme enhancement
export function ProgressiveTheme({ themeId, children }: Props) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    themeLoader.loadTheme(themeId).then(setTheme);
  }, [themeId]);

  // Render with default theme while loading
  if (!theme) {
    return <div className="default-theme">{children}</div>;
  }

  return (
    <div className="custom-theme">
      <style>{generateCSSVariables(theme)}</style>
      {children}
    </div>
  );
}
```

### 3. Theme Compilation

```typescript
// Compile themes at build time
import { writeFileSync } from 'fs';
import { join } from 'path';

async function compileThemes() {
  const themes = await loadThemeDefinitions();
  const compiled: Record<string, string> = {};

  for (const [name, definition] of Object.entries(themes)) {
    // Generate full theme
    const theme = generateTheme(definition);

    // Optimize CSS
    const css = generateCSSVariables(theme);
    const optimized = await optimizeCSS(css);

    // Generate static files
    writeFileSync(
      join(process.cwd(), 'public', 'themes', `${name}.css`),
      optimized
    );

    compiled[name] = optimized;
  }

  // Generate theme manifest
  const manifest = {
    themes: Object.keys(compiled),
    generated: new Date().toISOString(),
    version: process.env.BUILD_ID
  };

  writeFileSync(
    join(process.cwd(), 'public', 'themes', 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
}

// CSS optimization
async function optimizeCSS(css: string): Promise<string> {
  // Remove duplicates
  const unique = removeDuplicateVars(css);

  // Minify
  const minified = minifyCSS(unique);

  // Add prefixes if needed
  const prefixed = autoprefixer(minified);

  return prefixed;
}
```

## Accessibility

### 1. Contrast Validation

```typescript
class AccessibilityValidator {
  // WCAG contrast requirements
  private contrastRequirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 }
  };

  validateColorPair(
    foreground: string,
    background: string,
    options: ValidationOptions = {}
  ): ValidationResult {
    const contrast = this.getContrast(foreground, background);
    const level = options.level || 'AA';
    const size = options.size || 'normal';

    const required = this.contrastRequirements[level][size];
    const passes = contrast >= required;

    return {
      passes,
      contrast,
      required,
      suggestions: !passes ? this.getSuggestions(foreground, background, required) : []
    };
  }

  // Suggest accessible alternatives
  private getSuggestions(
    foreground: string,
    background: string,
    required: number
  ): ColorSuggestion[] {
    const suggestions: ColorSuggestion[] = [];

    // Try darkening foreground
    let darkened = foreground;
    for (let i = 1; i <= 50; i += 5) {
      darkened = color.darken(foreground, i);
      const contrast = this.getContrast(darkened, background);
      if (contrast >= required) {
        suggestions.push({
          color: darkened,
          contrast,
          adjustment: `Darken by ${i}%`
        });
        break;
      }
    }

    // Try lightening foreground
    let lightened = foreground;
    for (let i = 1; i <= 50; i += 5) {
      lightened = color.lighten(foreground, i);
      const contrast = this.getContrast(lightened, background);
      if (contrast >= required) {
        suggestions.push({
          color: lightened,
          contrast,
          adjustment: `Lighten by ${i}%`
        });
        break;
      }
    }

    return suggestions;
  }
}

// Automated accessibility fixes
export function applyAccessibilityFixes(
  theme: Theme,
  validation: ValidationResult
): Theme {
  const fixed = { ...theme };

  validation.issues.forEach(issue => {
    if (issue.type === 'contrast') {
      const suggestion = issue.suggestions[0];
      if (suggestion) {
        // Apply fix
        setNestedValue(fixed, issue.path, suggestion.color);
      }
    }
  });

  return fixed;
}
```

### 2. Color Blindness Support

```typescript
// Color blindness simulations
enum ColorBlindnessType {
  Protanopia = 'protanopia',     // Red-blind
  Deuteranopia = 'deuteranopia', // Green-blind
  Tritanopia = 'tritanopia',     // Blue-blind
  Achromatopsia = 'achromatopsia' // Total color blindness
}

class ColorBlindnessSimulator {
  // Simulate how colors appear
  simulate(color: string, type: ColorBlindnessType): string {
    const rgb = hexToRGB(color);
    let simulated: RGB;

    switch (type) {
      case ColorBlindnessType.Protanopia:
        simulated = this.simulateProtanopia(rgb);
        break;
      case ColorBlindnessType.Deuteranopia:
        simulated = this.simulateDeuteranopia(rgb);
        break;
      case ColorBlindnessType.Tritanopia:
        simulated = this.simulateTritanopia(rgb);
        break;
      case ColorBlindnessType.Achromatopsia:
        simulated = this.simulateAchromatopsia(rgb);
        break;
    }

    return rgbToHex(simulated);
  }

  // Validate theme for color blindness
  validateTheme(theme: Theme): ColorBlindnessReport {
    const issues: ColorBlindnessIssue[] = [];

    // Check if colors are distinguishable
    const colors = this.extractColors(theme);

    for (const type of Object.values(ColorBlindnessType)) {
      const simulated = colors.map(c => this.simulate(c, type));
      const conflicts = this.findSimilarColors(simulated);

      if (conflicts.length > 0) {
        issues.push({
          type,
          conflicts,
          severity: this.calculateSeverity(conflicts)
        });
      }
    }

    return { issues, accessible: issues.length === 0 };
  }
}
```

### 3. High Contrast Mode

```typescript
// High contrast theme generation
export function generateHighContrastTheme(
  baseTheme: Theme,
  mode: 'light' | 'dark' = 'dark'
): Theme {
  const isLight = mode === 'light';

  return {
    ...baseTheme,
    name: `${baseTheme.name} (High Contrast)`,
    colors: {
      primary: {
        ...baseTheme.colors.primary,
        500: isLight ? '#000000' : '#FFFFFF'
      },
      neutral: {
        background: {
          50: isLight ? '#FFFFFF' : '#000000',
          100: isLight ? '#FFFFFF' : '#0A0A0A',
          // ... more shades
        },
        foreground: {
          50: isLight ? '#000000' : '#FFFFFF',
          100: isLight ? '#0A0A0A' : '#F5F5F5',
          // ... more shades
        },
        border: {
          500: isLight ? '#000000' : '#FFFFFF'
        }
      },
      semantic: {
        error: { 500: isLight ? '#CC0000' : '#FF6B6B' },
        success: { 500: isLight ? '#008800' : '#51CF66' },
        warning: { 500: isLight ? '#CC6600' : '#FFD43B' },
        info: { 500: isLight ? '#0066CC' : '#74C0FC' }
      }
    },
    // Increase all border widths
    borders: {
      ...baseTheme.borders,
      width: {
        thin: '2px',
        medium: '3px',
        thick: '4px'
      }
    },
    // Remove shadows in high contrast
    shadows: {
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none'
    }
  };
}
```

## Examples & Patterns

### 1. Theme Switching UI

```typescript
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [customizing, setCustomizing] = useState(false);

  return (
    <div className="theme-switcher">
      {/* Quick presets */}
      <div className="theme-presets">
        <button
          onClick={() => applyPreset('ocean')}
          className="theme-preset ocean"
          aria-label="Ocean theme"
        />
        <button
          onClick={() => applyPreset('forest')}
          className="theme-preset forest"
          aria-label="Forest theme"
        />
        <button
          onClick={() => applyPreset('sunset')}
          className="theme-preset sunset"
          aria-label="Sunset theme"
        />
      </div>

      {/* Mode toggle */}
      <button
        onClick={toggleMode}
        className="mode-toggle"
        aria-label={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme.mode === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      {/* Custom colors */}
      <button
        onClick={() => setCustomizing(!customizing)}
        className="customize-btn"
      >
        Customize
      </button>

      {customizing && (
        <ThemeCustomizer
          theme={theme}
          onChange={setTheme}
          onClose={() => setCustomizing(false)}
        />
      )}
    </div>
  );
}
```

### 2. Theme Customizer

```typescript
export function ThemeCustomizer({ theme, onChange, onClose }: Props) {
  const [colors, setColors] = useState(theme.colors);
  const [preview, setPreview] = useState(false);

  const handleColorChange = (path: string, value: string) => {
    const newColors = { ...colors };
    setNestedValue(newColors, path, value);
    setColors(newColors);

    if (preview) {
      onChange({ ...theme, colors: newColors });
    }
  };

  return (
    <div className="theme-customizer">
      <div className="customizer-header">
        <h3>Customize Theme</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="color-controls">
        <ColorPicker
          label="Primary Color"
          value={colors.primary[500]}
          onChange={(color) => {
            const palette = generatePalette(color);
            setColors({
              ...colors,
              primary: palette
            });
          }}
        />

        <ColorPicker
          label="Secondary Color"
          value={colors.secondary[500]}
          onChange={(color) => {
            const palette = generatePalette(color);
            setColors({
              ...colors,
              secondary: palette
            });
          }}
        />
      </div>

      <div className="preview-toggle">
        <label>
          <input
            type="checkbox"
            checked={preview}
            onChange={(e) => setPreview(e.target.checked)}
          />
          Live preview
        </label>
      </div>

      <div className="customizer-actions">
        <button onClick={() => onChange({ ...theme, colors })}>
          Apply Theme
        </button>
        <button onClick={() => exportTheme(theme)}>
          Export
        </button>
      </div>
    </div>
  );
}
```

### 3. App Theme Example

```typescript
// E-commerce app with brand colors
const ecommerceTheme: AppThemeConfig = {
  appId: 'ecommerce-pro',
  brandColors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFE66D'
  },
  overrides: {
    components: {
      button: {
        borderRadius: '9999px', // Fully rounded
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      },
      card: {
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-lg)'
      }
    },
    typography: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Lato', 'sans-serif']
      }
    }
  },
  restrictions: {
    allowDarkMode: true,
    enforceAccessibility: true
  }
};

// Apply in app
export function EcommerceApp() {
  return (
    <AppThemeProvider appId="ecommerce-pro" config={ecommerceTheme}>
      <div className="ecommerce-app">
        {/* App content with custom theme */}
      </div>
    </AppThemeProvider>
  );
}
```

---

**Document Version**: 1.0  
**Last Updated**: 04-Jul-25  
**Next Review**: 11-Jul-25
