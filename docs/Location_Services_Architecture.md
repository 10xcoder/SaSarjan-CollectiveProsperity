# Location Services Architecture

**Created: 04-Jul-25**

## Table of Contents

1. [Overview](#overview)
2. [Location Strategy](#location-strategy)
3. [Technical Architecture](#technical-architecture)
4. [Privacy & Compliance](#privacy--compliance)
5. [Implementation Details](#implementation-details)
6. [Cost Optimization](#cost-optimization)
7. [Performance Considerations](#performance-considerations)
8. [Integration Examples](#integration-examples)

## Overview

Location Services in the SaSarjan App Store provide comprehensive geo-aware features that enhance user experience through localized content, regional recommendations, and location-based features. Our architecture prioritizes:

- **Privacy First**: User consent and data protection
- **Cost Efficiency**: Optimized API usage and caching
- **Global Coverage**: Works worldwide with offline fallbacks
- **High Performance**: Edge-based geolocation
- **Accuracy**: Multiple data sources for precision

### Key Features

- Location-aware app recommendations
- Regional content and pricing
- Nearby events and offers
- Store locator for physical locations
- Geo-restricted content management
- Location-based analytics
- Offline map capabilities

## Location Strategy

### 1. Multi-Source Location Detection

```typescript
interface LocationSources {
  // Primary sources (in order of preference)
  primary: {
    gps: GPSLocation;           // Device GPS (most accurate)
    wifi: WiFiLocation;         // WiFi positioning
    cellular: CellularLocation; // Cell tower triangulation
  };

  // Secondary sources (fallbacks)
  secondary: {
    ip: IPGeolocation;          // IP-based location
    timezone: TimezoneLocation; // Timezone inference
    locale: LocaleLocation;     // Language/locale hints
  };

  // User-provided
  manual: {
    savedLocations: SavedLocation[];
    preferredLocation: Location;
    billingAddress: Address;
  };
}
```

### 2. Location Hierarchy

```typescript
interface LocationHierarchy {
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy: number; // meters
  };

  address: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };

  region: {
    continent: string;
    subContinent: string;
    economicZone: string; // EU, ASEAN, etc.
    timezone: string;
  };

  metadata: {
    source: LocationSource;
    timestamp: Date;
    confidence: number; // 0-1
  };
}
```

## Technical Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│              (Web, Mobile, PWA, Extensions)                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                 Location Service Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Detection API  │  Geocoding API  │  Maps API  │ Search API │
│  • Multi-source │  • Forward      │  • Render  │ • Nearby  │
│  • Fallbacks   │  • Reverse      │  • Routing │ • Radius  │
│  • Caching     │  • Batch        │  • Markers │ • Filters │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   Provider Abstraction                       │
├───────────────────────────────┬─────────────────────────────┤
│         Primary Provider      │    Fallback Providers       │
│      Mapbox GL JS (Free)      │  • OpenStreetMap (OSM)      │
│  • 50k loads/month free       │  • Google Maps (limited)    │
│  • Vector tiles               │  • HERE Maps                │
│  • Offline support            │  • IP Geolocation APIs      │
└───────────────────────────────┴─────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Data & Cache Layer                        │
│         PostgreSQL + PostGIS + Redis + CDN Cache            │
└─────────────────────────────────────────────────────────────┘
```

### Mapbox Integration (Primary Provider)

```typescript
// Initialize Mapbox with cost controls
import mapboxgl from 'mapbox-gl';

class MapboxService {
  private static instance: MapboxService;
  private loadCount = 0;
  private monthlyLimit = 50000; // Free tier limit

  constructor() {
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN!;
    this.setupCostControls();
  }

  private setupCostControls() {
    // Track map loads
    mapboxgl.Map.prototype._onLoad = function() {
      MapboxService.instance.trackLoad();
    };

    // Switch to fallback if approaching limit
    if (this.loadCount > this.monthlyLimit * 0.8) {
      console.warn('Approaching Mapbox limit, switching to OSM');
      this.useFallbackProvider();
    }
  }

  async geocode(query: string): Promise<GeocodingResult> {
    // Check cache first
    const cached = await this.cache.get(`geocode:${query}`);
    if (cached) return cached;

    // Use Mapbox Geocoding API
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}`
    );

    const result = await response.json();

    // Cache for 24 hours
    await this.cache.set(`geocode:${query}`, result, 86400);

    return result;
  }
}
```

### Location Detection Service

```typescript
class LocationDetectionService {
  // Get user's current location with fallbacks
  async getCurrentLocation(options?: LocationOptions): Promise<Location> {
    const methods = [
      this.getGPSLocation,
      this.getWiFiLocation,
      this.getIPLocation,
      this.getTimezoneLocation,
      this.getCachedLocation
    ];

    for (const method of methods) {
      try {
        const location = await method.call(this, options);
        if (location && this.isValidLocation(location)) {
          await this.cacheLocation(location);
          return location;
        }
      } catch (error) {
        console.warn(`Location method failed:`, error);
        continue;
      }
    }

    // Ultimate fallback
    return this.getDefaultLocation();
  }

  // Browser Geolocation API
  private async getGPSLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: 'gps'
          });
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // IP-based geolocation
  private async getIPLocation(): Promise<Location> {
    // Use edge function for IP detection
    const response = await fetch('/api/location/ip');
    const data = await response.json();

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: 50000, // 50km accuracy for IP
      source: 'ip',
      city: data.city,
      country: data.country
    };
  }
}
```

### Geocoding Service

```typescript
interface GeocodingService {
  // Forward geocoding (address to coordinates)
  forward(address: string): Promise<Coordinates>;

  // Reverse geocoding (coordinates to address)
  reverse(lat: number, lng: number): Promise<Address>;

  // Batch geocoding
  batch(requests: GeocodingRequest[]): Promise<GeocodingResult[]>;

  // Autocomplete
  autocomplete(query: string, options?: AutocompleteOptions): Promise<Suggestion[]>;
}

class CachedGeocodingService implements GeocodingService {
  constructor(
    private provider: GeocodingProvider,
    private cache: Cache,
    private db: Database
  ) {}

  async forward(address: string): Promise<Coordinates> {
    // Normalize address
    const normalized = this.normalizeAddress(address);
    const cacheKey = `geo:fwd:${normalized}`;

    // Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // Check database
    const stored = await this.db.geocoding.findOne({ address: normalized });
    if (stored) {
      await this.cache.set(cacheKey, stored.coordinates);
      return stored.coordinates;
    }

    // Call provider
    const result = await this.provider.forward(address);

    // Store results
    await this.db.geocoding.create({
      address: normalized,
      coordinates: result,
      provider: this.provider.name,
      timestamp: new Date()
    });

    await this.cache.set(cacheKey, result, 604800); // 7 days

    return result;
  }
}
```

## Privacy & Compliance

### 1. Consent Management

```typescript
class LocationConsent {
  // Request location permission
  async requestPermission(context: PermissionContext): Promise<PermissionResult> {
    // Check if already granted
    const existing = await this.getPermissionStatus();
    if (existing === 'granted') return { status: 'granted' };

    // Show custom consent UI
    const consent = await this.showConsentDialog({
      title: 'Enable Location Services',
      message: 'We use your location to show nearby apps and regional content',
      benefits: [
        'Discover apps popular in your area',
        'Get local offers and deals',
        'See content in your language',
        'Find nearby events'
      ],
      privacy: 'Your location is never shared with third parties'
    });

    if (consent.accepted) {
      await this.saveConsent(consent);
      return { status: 'granted', timestamp: new Date() };
    }

    return { status: 'denied' };
  }

  // Granular permissions
  interface LocationPermissions {
    precise: boolean;        // Exact coordinates
    approximate: boolean;    // City-level only
    background: boolean;     // Background location
    sharing: boolean;        // Share with apps
    analytics: boolean;      // Use for analytics
    marketing: boolean;      // Use for marketing
  }
}
```

### 2. Data Protection

```typescript
class LocationDataProtection {
  // Anonymize location data
  anonymize(location: Location): AnonymizedLocation {
    return {
      // Round to ~1km precision
      latitude: Math.round(location.latitude * 100) / 100,
      longitude: Math.round(location.longitude * 100) / 100,

      // Remove precise data
      city: location.city,
      state: location.state,
      country: location.country,

      // Hash user identifier
      userHash: this.hashUser(location.userId),

      // Add noise for differential privacy
      noise: this.addGaussianNoise(0.01)
    };
  }

  // Data retention policies
  async enforceRetention() {
    // Delete precise locations after 30 days
    await this.db.locations.deleteMany({
      timestamp: { $lt: subDays(new Date(), 30) },
      type: 'precise'
    });

    // Aggregate old data
    const oldData = await this.db.locations.find({
      timestamp: { $lt: subDays(new Date(), 90) }
    });

    const aggregated = this.aggregateByRegion(oldData);
    await this.db.aggregatedLocations.insertMany(aggregated);
  }
}
```

### 3. Regional Compliance

```typescript
// GDPR (Europe)
const gdprCompliance = {
  requireExplicitConsent: true,
  allowWithdrawal: true,
  dataPortability: true,
  rightToErasure: true,
  defaultOff: true
};

// CCPA (California)
const ccpaCompliance = {
  optOutRequired: true,
  doNotSell: true,
  accessRights: true,
  deletionRights: true
};

// Region-specific settings
function getComplianceSettings(location: Location): ComplianceSettings {
  if (isEU(location.country)) return gdprCompliance;
  if (location.state === 'CA' && location.country === 'US') return ccpaCompliance;
  return defaultCompliance;
}
```

## Implementation Details

### 1. Location-Aware Features

```typescript
// App recommendations by location
class LocationBasedRecommendations {
  async getLocalApps(location: Location): Promise<App[]> {
    // Get apps popular in region
    const regionalApps = await this.db.apps.find({
      'stats.popularIn': {
        $geoWithin: {
          $centerSphere: [[location.longitude, location.latitude], 50 / 6371] // 50km radius
        }
      }
    }).sort({ 'stats.regionalDownloads': -1 });

    // Get culturally relevant apps
    const culturalApps = await this.getCulturalApps(location);

    // Merge and deduplicate
    return this.mergeAndRank([regionalApps, culturalApps]);
  }

  // Location-based pricing
  async getRegionalPricing(appId: string, location: Location): Promise<Pricing> {
    const region = await this.getEconomicRegion(location);
    const basePricing = await this.getBasePricing(appId);

    return {
      currency: region.currency,
      amount: this.adjustForPPP(basePricing.amount, region.pppIndex),
      displayPrice: this.formatPrice(amount, region),
      taxRate: region.taxRate,
      includedTaxes: region.includedTaxes
    };
  }
}

// Geo-restrictions
class GeoRestrictionService {
  async checkAccess(appId: string, location: Location): Promise<AccessResult> {
    const app = await this.getApp(appId);
    const restrictions = app.geoRestrictions;

    if (!restrictions || restrictions.length === 0) {
      return { allowed: true };
    }

    // Check blocklist
    if (restrictions.blockedCountries?.includes(location.country)) {
      return {
        allowed: false,
        reason: 'not_available_in_region',
        message: 'This app is not available in your country'
      };
    }

    // Check allowlist
    if (restrictions.allowedCountries &&
        !restrictions.allowedCountries.includes(location.country)) {
      return {
        allowed: false,
        reason: 'region_restricted',
        message: 'This app is only available in select regions'
      };
    }

    return { allowed: true };
  }
}
```

### 2. Map Integration

```typescript
// Map component with Mapbox
export function LocationMap({
  center,
  markers,
  onMarkerClick
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [center.longitude, center.latitude],
      zoom: 12,
      // Optimize for performance
      antialias: false,
      preserveDrawingBuffer: false
    });

    // Add markers
    markers.forEach(marker => {
      const el = createMarkerElement(marker);

      new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(createPopup(marker))
        .addTo(map.current!);

      el.addEventListener('click', () => onMarkerClick(marker));
    });

    // Cleanup
    return () => map.current?.remove();
  }, [center, markers]);

  return <div ref={mapContainer} className="h-full w-full" />;
}

// Offline map support
class OfflineMapService {
  async downloadRegion(bounds: Bounds, zoom: ZoomRange): Promise<void> {
    const tiles = this.calculateTiles(bounds, zoom);

    // Download in batches
    for (const batch of chunk(tiles, 100)) {
      await Promise.all(
        batch.map(tile => this.downloadTile(tile))
      );
    }

    // Store in IndexedDB
    await this.storeTiles(tiles);
  }

  async getTile(z: number, x: number, y: number): Promise<Blob | null> {
    // Check offline storage first
    const offline = await this.db.tiles.get({ z, x, y });
    if (offline) return offline.data;

    // Fallback to network
    return this.fetchTile(z, x, y);
  }
}
```

### 3. Location Search

```typescript
// Location-aware search
class LocationSearch {
  async searchNearby(
    query: string,
    location: Location,
    radius: number = 10000 // 10km default
  ): Promise<SearchResult[]> {
    // Create geo query
    const geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          $maxDistance: radius
        }
      }
    };

    // Search with location boost
    const results = await this.search({
      query,
      filters: geoQuery,
      boost: {
        distance: {
          scale: '50km',
          decay: 0.5
        }
      }
    });

    // Add distance to results
    return results.map(result => ({
      ...result,
      distance: this.calculateDistance(location, result.location),
      distanceDisplay: this.formatDistance(distance)
    }));
  }
}
```

## Cost Optimization

### 1. API Usage Optimization

```typescript
class CostOptimizedLocationService {
  private usage = {
    mapbox: { loads: 0, geocoding: 0, limit: 50000 },
    google: { requests: 0, limit: 28000 },
    osm: { requests: 0, limit: Infinity }
  };

  async getProvider(): Promise<LocationProvider> {
    // Check monthly usage
    const now = new Date();
    const isNewMonth = now.getDate() === 1;

    if (isNewMonth) {
      await this.resetUsageCounters();
    }

    // Select provider based on usage
    if (this.usage.mapbox.loads < this.usage.mapbox.limit * 0.8) {
      return this.providers.mapbox;
    } else if (this.usage.google.requests < this.usage.google.limit * 0.8) {
      return this.providers.google;
    } else {
      return this.providers.osm; // Free, unlimited
    }
  }

  // Batch requests to reduce API calls
  async batchGeocode(addresses: string[]): Promise<Coordinates[]> {
    // Group by proximity for efficient batching
    const groups = this.groupByProximity(addresses);

    const results = await Promise.all(
      groups.map(group =>
        this.provider.batchGeocode(group)
      )
    );

    return results.flat();
  }
}
```

### 2. Caching Strategy

```typescript
// Multi-tier caching
class LocationCache {
  private layers = {
    memory: new LRUCache<string, any>({ max: 1000 }),
    redis: new Redis(),
    cdn: new CDNCache()
  };

  async get(key: string): Promise<any> {
    // Check memory
    const memory = this.layers.memory.get(key);
    if (memory) return memory;

    // Check Redis
    const redis = await this.layers.redis.get(key);
    if (redis) {
      this.layers.memory.set(key, redis);
      return JSON.parse(redis);
    }

    // Check CDN
    const cdn = await this.layers.cdn.get(key);
    if (cdn) {
      await this.promote(key, cdn);
      return cdn;
    }

    return null;
  }

  // Cache with TTL based on data type
  async set(key: string, value: any, type: CacheType): Promise<void> {
    const ttl = this.getTTL(type);

    // Set in all layers
    this.layers.memory.set(key, value);
    await this.layers.redis.setex(key, ttl, JSON.stringify(value));

    // CDN for static data only
    if (type === 'static') {
      await this.layers.cdn.set(key, value, ttl);
    }
  }

  private getTTL(type: CacheType): number {
    const ttls = {
      coordinates: 2592000,  // 30 days (rarely changes)
      address: 604800,       // 7 days
      timezone: 86400,       // 1 day
      weather: 3600,         // 1 hour
      traffic: 300          // 5 minutes
    };
    return ttls[type] || 3600;
  }
}
```

### 3. Data Aggregation

```typescript
// Reduce storage and API costs through aggregation
class LocationAggregator {
  // Aggregate user locations for analytics
  async aggregateUserLocations(): Promise<void> {
    const locations = await this.db.userLocations.find({
      timestamp: { $gte: subHours(new Date(), 1) }
    });

    // Group by grid cells (H3 or S2)
    const gridded = this.groupByH3(locations, 7); // Resolution 7

    // Create aggregated records
    const aggregated = Object.entries(gridded).map(([cell, locs]) => ({
      cell,
      count: locs.length,
      timestamp: new Date(),
      center: this.calculateCenter(locs),
      radius: this.calculateRadius(locs)
    }));

    // Store aggregated data
    await this.db.aggregatedLocations.insertMany(aggregated);

    // Delete raw data
    await this.db.userLocations.deleteMany({
      _id: { $in: locations.map(l => l._id) }
    });
  }
}
```

## Performance Considerations

### 1. Edge Computing

```typescript
// Edge function for geolocation
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Get location from Cloudflare or Vercel headers
  const country = request.headers.get('CF-IPCountry') ||
                 request.headers.get('X-Vercel-IP-Country');
  const city = request.headers.get('CF-IPCity') ||
              request.headers.get('X-Vercel-IP-City');
  const latitude = request.headers.get('CF-IPLatitude') ||
                  request.headers.get('X-Vercel-IP-Latitude');
  const longitude = request.headers.get('CF-IPLongitude') ||
                   request.headers.get('X-Vercel-IP-Longitude');

  return new Response(JSON.stringify({
    country,
    city,
    latitude: parseFloat(latitude || '0'),
    longitude: parseFloat(longitude || '0'),
    source: 'edge'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=3600'
    }
  });
}
```

### 2. Lazy Loading

```typescript
// Lazy load map components
const MapComponent = dynamic(
  () => import('./LocationMap'),
  {
    loading: () => <MapSkeleton />,
    ssr: false
  }
);

// Progressive enhancement
export function ProgressiveMap({ location }: Props) {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // Only load map if user interacts or after delay
    const timer = setTimeout(() => setShowMap(true), 2000);

    const handleInteraction = () => {
      setShowMap(true);
      clearTimeout(timer);
    };

    window.addEventListener('mousemove', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, []);

  if (!showMap) {
    return <StaticMapImage location={location} />;
  }

  return <MapComponent location={location} />;
}
```

### 3. Request Optimization

```typescript
// Debounce and batch location requests
class OptimizedLocationRequests {
  private pendingRequests = new Map<string, Promise<any>>();
  private batchQueue: BatchRequest[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  // Debounce individual requests
  async getLocation(id: string): Promise<Location> {
    // Check if request is already pending
    if (this.pendingRequests.has(id)) {
      return this.pendingRequests.get(id)!;
    }

    // Create promise
    const promise = new Promise<Location>((resolve) => {
      this.batchQueue.push({ id, resolve });
      this.scheduleBatch();
    });

    this.pendingRequests.set(id, promise);
    return promise;
  }

  private scheduleBatch() {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, 50); // 50ms debounce
  }

  private async processBatch() {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = null;

    // Process in single request
    const results = await this.batchFetch(batch.map(b => b.id));

    // Resolve individual promises
    batch.forEach((request, index) => {
      request.resolve(results[index]);
      this.pendingRequests.delete(request.id);
    });
  }
}
```

## Integration Examples

### 1. Location in App Store

```typescript
// Homepage with location awareness
export function Homepage() {
  const location = useLocation();
  const { data: localContent } = useLocalContent(location);

  return (
    <div>
      <section>
        <h2>Popular in {location.city}</h2>
        <AppGrid apps={localContent.popularApps} />
      </section>

      <section>
        <h2>Nearby Events</h2>
        <EventList events={localContent.events} location={location} />
      </section>

      <section>
        <h2>Local Offers</h2>
        <OfferCarousel offers={localContent.offers} />
      </section>
    </div>
  );
}
```

### 2. Developer Integration

```typescript
// SDK for developers to use location
class AppStoreLocationSDK {
  // Get user's location (with permission)
  async getUserLocation(): Promise<Location | null> {
    const permission = await this.checkPermission();
    if (!permission) return null;

    return this.locationService.getCurrentLocation();
  }

  // Location-based features
  async getNearbyUsers(radius: number): Promise<User[]> {
    const location = await this.getUserLocation();
    if (!location) return [];

    return this.api.get('/users/nearby', {
      lat: location.latitude,
      lng: location.longitude,
      radius
    });
  }

  // Geo-fencing
  async createGeofence(config: GeofenceConfig): Promise<Geofence> {
    return this.api.post('/geofences', config);
  }

  // Location analytics
  trackLocationEvent(event: string, metadata?: any): void {
    this.analytics.track(event, {
      ...metadata,
      location: this.currentLocation,
      timestamp: Date.now()
    });
  }
}
```

### 3. Admin Dashboard

```typescript
// Location analytics dashboard
export function LocationAnalytics() {
  const { data: heatmap } = useLocationHeatmap();
  const { data: metrics } = useLocationMetrics();

  return (
    <Dashboard>
      <MetricCards>
        <MetricCard
          title="Active Regions"
          value={metrics.activeRegions}
          change={metrics.regionGrowth}
        />
        <MetricCard
          title="Location Accuracy"
          value={`${metrics.accuracy}%`}
          subtitle="GPS vs IP detection"
        />
      </MetricCards>

      <HeatmapSection>
        <h3>User Distribution</h3>
        <LocationHeatmap data={heatmap} />
      </HeatmapSection>

      <RegionalStats>
        <h3>Regional Performance</h3>
        <RegionTable data={metrics.byRegion} />
      </RegionalStats>
    </Dashboard>
  );
}
```

---

**Document Version**: 1.0  
**Last Updated**: 04-Jul-25  
**Next Review**: 11-Jul-25
