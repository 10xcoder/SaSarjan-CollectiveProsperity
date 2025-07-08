# Location-Aware Development Guide

**Purpose**: Enable every micro-app to be location-aware and provide personalized experiences  
**Last Updated**: 07-Jul-2025, Monday 09:00 IST  
**Version**: 1.0

## 🌍 Location System Overview

### Hierarchical Structure (9 Levels)

```
1. Continent (e.g., Asia)
2. Country (e.g., India)
3. Region (e.g., South India)
4. State (e.g., Karnataka)
5. District (e.g., Bangalore Urban)
6. Taluka/Tehsil (e.g., Bangalore North)
7. Block/Mandal (e.g., Yelahanka)
8. Village/Town (e.g., Hebbal)
9. Locality/Area (e.g., Kempapura)
```

### Core Principles

1. **User-Centric**: Users set multiple locations (home, work, interest areas)
2. **Privacy-First**: Location data is opt-in and user-controlled
3. **Performance**: Hierarchical queries are optimized with indexes
4. **Flexibility**: Support both precise and approximate locations

## 🗄️ Location Database Schema

### Core Tables

```sql
-- Master location table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  local_name VARCHAR(255), -- Name in local language
  type ENUM('continent','country','region','state','district','taluka','block','village','locality'),
  parent_id UUID REFERENCES locations(id),
  level INTEGER NOT NULL, -- 1=continent, 9=locality

  -- Government identifiers
  lgd_code VARCHAR(50), -- Local Government Directory code
  census_code VARCHAR(50),
  postal_codes TEXT[], -- Array of PIN codes

  -- Geographic data
  coordinates GEOGRAPHY(POINT, 4326), -- PostGIS point
  bounds GEOGRAPHY(POLYGON, 4326), -- Administrative boundary

  -- Metadata
  population INTEGER,
  area_sq_km DECIMAL(10,2),
  metadata JSONB, -- Additional flexible data

  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User locations
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  type ENUM('home','work','interest','birth','current'),
  title VARCHAR(100), -- User's custom title
  is_primary BOOLEAN DEFAULT false,
  privacy_level ENUM('public','connections','private') DEFAULT 'private',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App/content location associations
CREATE TABLE app_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id VARCHAR(50) NOT NULL, -- e.g., 'talentexcel'
  entity_type VARCHAR(50) NOT NULL, -- e.g., 'internship'
  entity_id UUID NOT NULL,
  location_id UUID REFERENCES locations(id),
  location_type ENUM('exact','nearby','remote','hybrid'),
  radius_km INTEGER, -- For nearby locations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Hierarchical queries
CREATE INDEX idx_locations_parent ON locations(parent_id);
CREATE INDEX idx_locations_type_level ON locations(type, level);

-- Geographic queries
CREATE INDEX idx_locations_coordinates ON locations USING GIST(coordinates);
CREATE INDEX idx_locations_bounds ON locations USING GIST(bounds);

-- User queries
CREATE INDEX idx_user_locations_user ON user_locations(user_id);
CREATE INDEX idx_user_locations_type ON user_locations(type);

-- App queries
CREATE INDEX idx_app_locations_entity ON app_locations(app_id, entity_type, entity_id);
```

## 🧩 Location Components

### 1. Location Picker Component

```typescript
// Usage in any form
import { LocationPicker } from '@/components/shared/location-picker'

export function InternshipForm() {
  const [location, setLocation] = useState<Location | null>(null)

  return (
    <LocationPicker
      value={location}
      onChange={setLocation}
      level="district" // Minimum selection level
      placeholder="Select internship location"
      allowMultiple={false}
      showNearby={true}
      radiusOptions={[5, 10, 25, 50]} // km
    />
  )
}
```

### 2. Location Display Component

```typescript
// Display hierarchical location
import { LocationBreadcrumb } from '@/components/shared/location-breadcrumb'

<LocationBreadcrumb
  location={internship.location}
  showFrom="state" // Start showing from state level
  clickable={true}
  onLocationClick={(loc) => filterByLocation(loc)}
/>
// Output: Karnataka > Bangalore Urban > Koramangala
```

### 3. Location Filter Component

```typescript
// Filter content by location
import { LocationFilter } from '@/components/shared/location-filter'

<LocationFilter
  onFilterChange={(filters) => updateResults(filters)}
  options={{
    showRadius: true,
    showRemote: true,
    levels: ['state', 'district', 'taluka'],
    defaultRadius: 25
  }}
/>
```

## 🔧 Location Service Utilities

### Core Location Service

```typescript
// lib/services/location-service.ts
export class LocationService {
  // Get location hierarchy
  static async getLocationHierarchy(locationId: string): Promise<Location[]> {
    // Returns array from locality up to country
  }

  // Search locations
  static async searchLocations(query: string, options?: {
    level?: LocationLevel
    parentId?: string
    limit?: number
  }): Promise<Location[]> {
    // Fuzzy search with options
  }

  // Get nearby locations
  static async getNearbyLocations(
    coordinates: Coordinates,
    radiusKm: number,
    level: LocationLevel
  ): Promise<Location[]> {
    // Geographic search
  }

  // Get child locations
  static async getChildLocations(
    parentId: string,
    level?: LocationLevel
  ): Promise<Location[]> {
    // Get all children at specified level
  }
}
```

### Location Hooks

```typescript
// hooks/use-location.ts
export function useUserLocation() {
  // Get user's primary location
  // Handle location permissions
  // Update user location
}

export function useNearbyContent(
  contentType: string,
  radiusKm: number = 25
) {
  // Fetch content near user's location
  // Handle loading/error states
  // Real-time updates
}

export function useLocationFilter() {
  // Manage location filter state
  // Sync with URL params
  // Persist user preferences
}
```

## 📍 Implementing Location Features

### 1. Making Content Location-Aware

```typescript
// Example: Internship with location
interface LocationAwareInternship {
  id: string
  title: string
  company: string
  location: {
    id: string
    name: string
    type: LocationType
    hierarchy: Location[] // Full hierarchy
  }
  locationType: 'onsite' | 'remote' | 'hybrid'
  nearbyRadius?: number // For hybrid roles
}

// Component implementation
export function InternshipCard({ internship }: Props) {
  const userLocation = useUserLocation()
  const distance = calculateDistance(userLocation, internship.location)

  return (
    <Card>
      <CardHeader>
        <h3>{internship.title}</h3>
        <p>{internship.company}</p>
      </CardHeader>
      <CardContent>
        <LocationBreadcrumb location={internship.location} />
        {distance && (
          <Badge variant="secondary">
            {distance.toFixed(1)} km away
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
```

### 2. Location-Based Search

```typescript
// API route with location filtering
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locationId = searchParams.get('locationId')
  const radius = searchParams.get('radius')
  const includeRemote = searchParams.get('includeRemote') === 'true'

  let query = supabase
    .from('internships')
    .select(`
      *,
      location:locations(*)
    `)

  if (locationId && radius) {
    // Use PostGIS for geographic search
    query = query.rpc('search_nearby_internships', {
      location_id: locationId,
      radius_km: parseInt(radius),
      include_remote: includeRemote
    })
  }

  const { data, error } = await query
  return NextResponse.json(data)
}
```

### 3. User Location Preferences

```typescript
// User profile location management
export function LocationPreferences() {
  const [locations, setLocations] = useState<UserLocation[]>([])

  return (
    <div className="space-y-4">
      <h3>My Locations</h3>

      {/* Primary home location */}
      <LocationInput
        label="Home Location"
        type="home"
        value={locations.find(l => l.type === 'home')}
        onChange={(location) => updateLocation('home', location)}
        helperText="Used for showing nearby opportunities"
      />

      {/* Multiple work locations */}
      <MultiLocationInput
        label="Work Locations"
        type="work"
        values={locations.filter(l => l.type === 'work')}
        onChange={(locations) => updateLocations('work', locations)}
        allowCustomTitles={true}
      />

      {/* Interest areas */}
      <LocationInterests
        label="Areas of Interest"
        values={locations.filter(l => l.type === 'interest')}
        onChange={(locations) => updateLocations('interest', locations)}
        showRadius={true}
      />
    </div>
  )
}
```

## 🌐 Location-Based Personalization

### Content Ranking Algorithm

```typescript
// Rank content based on location relevance
function rankByLocation(
  contents: Content[],
  userLocations: UserLocation[]
): RankedContent[] {
  return contents.map(content => {
    let score = 0

    // Exact location match
    if (userLocations.some(ul => ul.location_id === content.location_id)) {
      score += 100
    }

    // Nearby location (within preferred radius)
    const distance = getMinDistance(userLocations, content.location)
    if (distance < 25) score += 50
    else if (distance < 50) score += 25
    else if (distance < 100) score += 10

    // Same state/district
    if (isSameState(userLocations, content.location)) score += 20
    if (isSameDistrict(userLocations, content.location)) score += 30

    // Remote opportunities for any location
    if (content.locationType === 'remote') score += 40

    return { ...content, locationScore: score }
  }).sort((a, b) => b.locationScore - a.locationScore)
}
```

### Location-Based Notifications

```typescript
// Send notifications for nearby opportunities
async function notifyNearbyOpportunities(userId: string) {
  const userLocations = await getUserLocations(userId)
  const preferences = await getUserPreferences(userId)

  for (const location of userLocations) {
    const nearbyContent = await findNearbyContent({
      locationId: location.location_id,
      radius: preferences.notificationRadius || 25,
      types: preferences.interestedTypes
    })

    if (nearbyContent.length > 0) {
      await sendNotification({
        userId,
        title: `${nearbyContent.length} new opportunities near ${location.name}`,
        items: nearbyContent.slice(0, 5)
      })
    }
  }
}
```

## 🗺️ Map Integration

### Basic Map View

```typescript
import { MapView } from '@/components/shared/map-view'

export function OpportunityMap() {
  const opportunities = useNearbyOpportunities()

  return (
    <MapView
      center={userLocation.coordinates}
      zoom={12}
      markers={opportunities.map(opp => ({
        id: opp.id,
        position: opp.location.coordinates,
        title: opp.title,
        icon: 'internship' // Custom icons
      }))}
      onMarkerClick={(marker) => showDetails(marker.id)}
      showUserLocation={true}
      showRadiusCircle={true}
      radius={25} // km
    />
  )
}
```

## 🧪 Testing Location Features

### Unit Tests

```typescript
// Test location service
describe('LocationService', () => {
  it('should return complete hierarchy', async () => {
    const hierarchy = await LocationService.getLocationHierarchy('locality-id')
    expect(hierarchy).toHaveLength(5) // locality to country
    expect(hierarchy[0].type).toBe('locality')
    expect(hierarchy[4].type).toBe('country')
  })

  it('should find nearby locations', async () => {
    const nearby = await LocationService.getNearbyLocations(
      { lat: 12.9716, lng: 77.5946 },
      25,
      'district'
    )
    expect(nearby.length).toBeGreaterThan(0)
    expect(nearby[0].distance).toBeLessThan(25)
  })
})
```

### Integration Tests

```typescript
// Test location-aware features
describe('Location-aware internship search', () => {
  it('should prioritize nearby internships', async () => {
    const response = await fetch('/api/internships?locationId=blr&radius=25')
    const internships = await response.json()

    // First results should be within radius
    expect(internships[0].distance).toBeLessThan(25)

    // Remote internships should also appear
    const remoteCount = internships.filter(i => i.locationType === 'remote').length
    expect(remoteCount).toBeGreaterThan(0)
  })
})
```

## 🚀 Best Practices

### 1. Performance

- Always use indexes for location queries
- Cache frequently accessed locations
- Lazy load location hierarchies
- Use geographic indexes for coordinate searches

### 2. User Experience

- Show loading states during location searches
- Provide fallbacks for users without location
- Allow manual location entry
- Remember user's location preferences

### 3. Privacy

- Always ask permission before accessing location
- Allow users to control location visibility
- Provide option to use approximate location
- Clear data deletion options

### 4. Accessibility

- Provide text alternatives for maps
- Ensure location pickers are keyboard navigable
- Support screen readers for location info
- Allow location entry without maps

## 📚 Resources

- [PostGIS Documentation](https://postgis.net/docs/)
- [OpenStreetMap Data](https://www.openstreetmap.org/)
- [India Census Location Codes](https://censusindia.gov.in/)
- [Location Privacy Best Practices](https://www.w3.org/TR/geolocation-privacy/)

---

Remember: Location awareness should enhance, not limit, user experience. Always provide alternatives for users who prefer not to share location data.
