# TalentExcel Starter App: Local Internship Finder

**Purpose**: A simple, location-aware micro-app for junior developers to build as their first feature  
**Estimated Time**: 3-5 days for a junior developer  
**Last Updated**: 07-Jul-2025, Monday 09:20 IST

## 🎯 App Overview

### What We're Building

A **Local Internship Finder** that helps students discover internship opportunities near their location with tag-based filtering and a simple application journey.

### Core Features

1. **Location-based Search**: Find internships within a specified radius
2. **Tag Filtering**: Filter by skills, industry, internship type
3. **Application Journey**: Browse → View Details → Apply → Track Status
4. **Outcome Tracking**: Monitor applications sent and responses

### User Journey

```
Home Location Set → Browse Nearby Internships → Filter by Tags → View Details → Apply → Track Application → Get Response
```

## 🏗️ Technical Architecture

### Database Schema

```sql
-- Internships table (already exists, we'll use these fields)
internships (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],

  -- Location fields
  location_id UUID REFERENCES locations(id),
  location_type ENUM('onsite', 'remote', 'hybrid'),

  -- Tag fields
  skills_required TEXT[], -- ['React', 'Node.js', 'TypeScript']
  industry_tags TEXT[],   -- ['Technology', 'Finance', 'Healthcare']
  internship_type TEXT,   -- 'full-time', 'part-time', 'project-based'

  -- Application fields
  application_deadline TIMESTAMP,
  stipend_min INTEGER,
  stipend_max INTEGER,
  duration_months INTEGER,

  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
)

-- User applications (what we'll create)
CREATE TABLE user_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  internship_id UUID REFERENCES internships(id),

  -- Application data
  cover_letter TEXT,
  expected_stipend INTEGER,
  availability_date DATE,

  -- Journey tracking
  status ENUM('draft', 'submitted', 'under_review', 'interview_scheduled', 'accepted', 'rejected'),
  submitted_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Outcome tracking
  response_received_at TIMESTAMP,
  interview_date TIMESTAMP,
  final_outcome TEXT,

  UNIQUE(user_id, internship_id)
);

-- Location-based index for performance
CREATE INDEX idx_internships_location ON internships(location_id);
CREATE INDEX idx_internships_tags ON internships USING GIN(skills_required);
```

## 📁 File Structure

```
apps/talentexcel/
├── app/
│   └── internships/
│       ├── page.tsx                 # Main listing page
│       ├── [id]/
│       │   └── page.tsx            # Internship details
│       └── applications/
│           └── page.tsx            # My applications tracker
├── components/
│   └── internships/
│       ├── internship-card.tsx      # Display card component
│       ├── internship-filters.tsx   # Filter sidebar
│       ├── internship-map.tsx       # Map view component
│       ├── application-form.tsx     # Apply form modal
│       └── application-tracker.tsx  # Status tracker
└── lib/
    └── api/
        └── internships.ts           # API functions
```

## 🚀 Step-by-Step Implementation

### Step 1: Create the Listing Page (Day 1)

**File**: `app/internships/page.tsx`

```typescript
import { Suspense } from 'react'
import { InternshipList } from '@/components/internships/internship-list'
import { InternshipFilters } from '@/components/internships/internship-filters'
import { LocationPicker } from '@/components/shared/location-picker'
import { useUserLocation } from '@/hooks/use-location'

export default function InternshipsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Find Internships Near You
        </h1>
        <p className="mt-2 text-gray-600">
          Discover opportunities that match your skills and location
        </p>
      </div>

      {/* Location Selector */}
      <div className="mb-6">
        <LocationPicker
          label="Search near"
          showRadius={true}
          defaultRadius={25}
          onLocationChange={(location, radius) => {
            // Update search parameters
          }}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <InternshipFilters />
        </aside>

        {/* Internship Listings */}
        <main className="lg:col-span-3">
          <Suspense fallback={<InternshipListSkeleton />}>
            <InternshipList />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
```

### Step 2: Create the Internship Card Component (Day 1)

**File**: `components/internships/internship-card.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, Building } from 'lucide-react'
import { formatDistance } from '@/lib/utils'
import Link from 'next/link'

interface InternshipCardProps {
  internship: {
    id: string
    title: string
    company: string
    location: {
      name: string
      distance?: number
    }
    location_type: 'onsite' | 'remote' | 'hybrid'
    skills_required: string[]
    stipend_min?: number
    stipend_max?: number
    duration_months: number
    application_deadline: string
  }
}

export function InternshipCard({ internship }: InternshipCardProps) {
  const daysUntilDeadline = calculateDaysUntil(internship.application_deadline)

  return (
    <Link href={`/internships/${internship.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{internship.title}</CardTitle>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Building className="h-4 w-4 mr-1" />
                {internship.company}
              </p>
            </div>
            <Badge
              variant={internship.location_type === 'remote' ? 'secondary' : 'default'}
            >
              {internship.location_type}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Location Info */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{internship.location.name}</span>
            {internship.location.distance && (
              <span className="ml-2 text-blue-600">
                ({internship.location.distance.toFixed(1)} km away)
              </span>
            )}
          </div>

          {/* Stipend Range */}
          {internship.stipend_min && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>
                ₹{internship.stipend_min.toLocaleString()} -
                ₹{internship.stipend_max?.toLocaleString() || '?'}/month
              </span>
            </div>
          )}

          {/* Duration */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{internship.duration_months} months</span>
          </div>

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-2">
            {internship.skills_required.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {internship.skills_required.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{internship.skills_required.length - 3} more
              </Badge>
            )}
          </div>

          {/* Application Deadline */}
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-orange-600">
              Apply within {daysUntilDeadline} days
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### Step 3: Create Filter Component (Day 2)

**File**: `components/internships/internship-filters.tsx`

```typescript
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'

export function InternshipFilters() {
  const [filters, setFilters] = useState({
    location_type: 'all',
    skills: [] as string[],
    industries: [] as string[],
    stipend_min: 0,
    duration: 'all',
    radius: 25
  })

  const skillOptions = [
    'React', 'Node.js', 'Python', 'Java', 'UI/UX Design',
    'Data Analysis', 'Machine Learning', 'Cloud Computing'
  ]

  const industryOptions = [
    'Technology', 'Finance', 'Healthcare', 'E-commerce',
    'Education', 'Media', 'Consulting', 'Manufacturing'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetFilters()}
          >
            Clear all
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location Type */}
        <div className="space-y-3">
          <Label>Work Location</Label>
          <RadioGroup
            value={filters.location_type}
            onValueChange={(value) =>
              setFilters({ ...filters, location_type: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All Types</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onsite" id="onsite" />
              <Label htmlFor="onsite">On-site Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remote" id="remote" />
              <Label htmlFor="remote">Remote Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid" />
              <Label htmlFor="hybrid">Hybrid</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Search Radius */}
        <div className="space-y-3">
          <Label>Distance: {filters.radius} km</Label>
          <Slider
            value={[filters.radius]}
            onValueChange={([value]) =>
              setFilters({ ...filters, radius: value })
            }
            min={5}
            max={100}
            step={5}
          />
        </div>

        {/* Skills Filter */}
        <div className="space-y-3">
          <Label>Required Skills</Label>
          <div className="space-y-2">
            {skillOptions.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={skill}
                  checked={filters.skills.includes(skill)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({
                        ...filters,
                        skills: [...filters.skills, skill]
                      })
                    } else {
                      setFilters({
                        ...filters,
                        skills: filters.skills.filter(s => s !== skill)
                      })
                    }
                  }}
                />
                <Label htmlFor={skill} className="text-sm">
                  {skill}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Filters Button */}
        <Button className="w-full" onClick={applyFilters}>
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Step 4: Create API Functions (Day 2)

**File**: `lib/api/internships.ts`

```typescript
import { supabase } from '@/lib/supabase/client'

interface InternshipFilters {
  locationId?: string
  radius?: number
  skills?: string[]
  industries?: string[]
  locationType?: string
  stipendMin?: number
}

export async function searchInternships(filters: InternshipFilters) {
  let query = supabase
    .from('internships')
    .select(`
      *,
      location:locations!location_id(
        id,
        name,
        coordinates
      ),
      applications:user_applications(
        id,
        status
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Location-based filtering
  if (filters.locationId && filters.radius) {
    // Use PostGIS function for geographic search
    query = query.rpc('find_nearby_internships', {
      user_location_id: filters.locationId,
      radius_km: filters.radius,
      include_remote: true
    })
  }

  // Skills filtering
  if (filters.skills && filters.skills.length > 0) {
    query = query.contains('skills_required', filters.skills)
  }

  // Location type filtering
  if (filters.locationType && filters.locationType !== 'all') {
    query = query.eq('location_type', filters.locationType)
  }

  // Stipend filtering
  if (filters.stipendMin) {
    query = query.gte('stipend_min', filters.stipendMin)
  }

  const { data, error } = await query

  if (error) throw error

  // Calculate distances client-side if needed
  return data.map(internship => ({
    ...internship,
    distance: calculateDistance(
      userLocation.coordinates,
      internship.location.coordinates
    )
  }))
}

export async function getInternshipDetails(id: string) {
  const { data, error } = await supabase
    .from('internships')
    .select(`
      *,
      location:locations!location_id(*),
      company_details:companies(
        name,
        logo_url,
        website,
        description
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function applyForInternship(
  internshipId: string,
  applicationData: {
    coverLetter: string
    expectedStipend?: number
    availabilityDate: string
  }
) {
  const { data: user } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_applications')
    .insert({
      user_id: user.user.id,
      internship_id: internshipId,
      cover_letter: applicationData.coverLetter,
      expected_stipend: applicationData.expectedStipend,
      availability_date: applicationData.availabilityDate,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMyApplications() {
  const { data: user } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_applications')
    .select(`
      *,
      internship:internships(
        id,
        title,
        company,
        location:locations!location_id(name)
      )
    `)
    .eq('user_id', user.user.id)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Step 5: Create Application Form (Day 3)

**File**: `components/internships/application-form.tsx`

```typescript
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/components/ui/use-toast'
import { applyForInternship } from '@/lib/api/internships'

interface ApplicationFormProps {
  internship: {
    id: string
    title: string
    company: string
  }
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ApplicationForm({
  internship,
  open,
  onClose,
  onSuccess
}: ApplicationFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedStipend: '',
    availabilityDate: new Date()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await applyForInternship(internship.id, {
        coverLetter: formData.coverLetter,
        expectedStipend: formData.expectedStipend
          ? parseInt(formData.expectedStipend)
          : undefined,
        availabilityDate: formData.availabilityDate.toISOString()
      })

      toast({
        title: "Application Submitted!",
        description: "You'll receive updates via email.",
      })

      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {internship.title}</DialogTitle>
          <p className="text-sm text-gray-600">at {internship.company}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">
              Why are you interested in this internship? *
            </Label>
            <Textarea
              id="coverLetter"
              required
              rows={6}
              placeholder="Explain your interest, relevant skills, and what you hope to learn..."
              value={formData.coverLetter}
              onChange={(e) =>
                setFormData({ ...formData, coverLetter: e.target.value })
              }
            />
            <p className="text-xs text-gray-500">
              Tip: Mention specific skills from the job description
            </p>
          </div>

          {/* Expected Stipend */}
          <div className="space-y-2">
            <Label htmlFor="expectedStipend">
              Expected Stipend (₹/month)
            </Label>
            <Input
              id="expectedStipend"
              type="number"
              placeholder="Leave blank if flexible"
              value={formData.expectedStipend}
              onChange={(e) =>
                setFormData({ ...formData, expectedStipend: e.target.value })
              }
            />
          </div>

          {/* Availability Date */}
          <div className="space-y-2">
            <Label>When can you start? *</Label>
            <Calendar
              mode="single"
              selected={formData.availabilityDate}
              onSelect={(date) =>
                date && setFormData({ ...formData, availabilityDate: date })
              }
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Step 6: Create Application Tracker (Day 4)

**File**: `app/internships/applications/page.tsx`

```typescript
import { ApplicationTracker } from '@/components/internships/application-tracker'

export default function MyApplicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>
      <ApplicationTracker />
    </div>
  )
}
```

**File**: `components/internships/application-tracker.tsx`

```typescript
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getMyApplications } from '@/lib/api/internships'
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Building
} from 'lucide-react'

export function ApplicationTracker() {
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    under_review: 0,
    interview_scheduled: 0,
    accepted: 0,
    rejected: 0
  })

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    const data = await getMyApplications()
    setApplications(data)

    // Calculate stats
    const newStats = data.reduce((acc, app) => {
      acc.total++
      acc[app.status]++
      return acc
    }, { ...stats })

    setStats(newStats)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4" />
      case 'under_review':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4 text-orange-600" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default'
      case 'under_review': return 'blue'
      case 'interview_scheduled': return 'orange'
      case 'accepted': return 'green'
      case 'rejected': return 'red'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {stats.under_review}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {stats.interview_scheduled}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.total > 0
                ? Math.round((stats.accepted / stats.total) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">
                    {application.internship.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {application.internship.company}
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied on {new Date(application.submitted_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <Badge
                    variant={getStatusColor(application.status)}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(application.status)}
                    {application.status.replace('_', ' ')}
                  </Badge>

                  {application.interview_date && (
                    <p className="text-sm text-orange-600">
                      Interview: {new Date(application.interview_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Application Journey Progress */}
              <div className="mt-4">
                <Progress
                  value={getProgressValue(application.status)}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Applied</span>
                  <span>Review</span>
                  <span>Interview</span>
                  <span>Decision</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getProgressValue(status: string): number {
  switch (status) {
    case 'submitted': return 25
    case 'under_review': return 50
    case 'interview_scheduled': return 75
    case 'accepted':
    case 'rejected': return 100
    default: return 0
  }
}
```

## 🧪 Testing the App

### Unit Tests to Write

```typescript
// __tests__/internship-card.test.tsx
describe('InternshipCard', () => {
  it('displays location distance when available', () => {
    const internship = mockInternship({ distance: 15.5 })
    render(<InternshipCard internship={internship} />)
    expect(screen.getByText('15.5 km away')).toBeInTheDocument()
  })

  it('shows remote badge for remote internships', () => {
    const internship = mockInternship({ location_type: 'remote' })
    render(<InternshipCard internship={internship} />)
    expect(screen.getByText('remote')).toHaveClass('bg-secondary')
  })
})
```

### Integration Tests

```typescript
// __tests__/internship-search.test.tsx
describe('Internship Search', () => {
  it('filters by location radius', async () => {
    const { result } = renderHook(() => useInternshipSearch())

    act(() => {
      result.current.setFilters({ radius: 10 })
    })

    await waitFor(() => {
      expect(result.current.internships).toHaveLength(5)
      expect(result.current.internships[0].distance).toBeLessThan(10)
    })
  })
})
```

## 📝 Prompts for AI Assistance

### For Building Features

```
I'm building a location-aware internship finder in TalentExcel.
Current task: [Create the filter component with location radius slider]

Requirements:
- Must use existing UI components from @/components/ui
- Location filtering should work with our PostGIS setup
- Follow the existing card/list pattern in the codebase
- Include proper TypeScript types
- Add loading and error states

Please provide the complete component code with explanations.
```

### For Debugging

```
My internship search is not filtering by skills properly.
Here's my current query: [paste code]

The skills_required field is a TEXT[] array in PostgreSQL.
How do I properly filter internships that match ANY of the selected skills?
```

### For Testing

```
Help me write tests for the application tracker component.
It should test:
1. Stats calculation from applications array
2. Progress bar values based on status
3. Proper status badge colors
4. Date formatting

Use @testing-library/react and follow our existing test patterns.
```

## 🎯 Success Criteria

### Functionality Checklist

- [ ] Users can set their location and search radius
- [ ] Internships show distance from user location
- [ ] Tag filtering works (skills, industry, type)
- [ ] Application form validates all fields
- [ ] Application status updates properly
- [ ] Mobile responsive design works
- [ ] Loading states show during data fetch
- [ ] Error messages are user-friendly

### Code Quality Checklist

- [ ] TypeScript has no errors
- [ ] All components have proper types
- [ ] API calls have error handling
- [ ] Forms have validation
- [ ] Accessibility standards met
- [ ] Performance optimized (lazy loading)
- [ ] Tests cover main functionality

### Learning Outcomes

By completing this app, junior developers will have learned:

1. Location-aware feature development
2. Tag-based filtering systems
3. User journey implementation
4. State management with forms
5. API integration patterns
6. Testing location features
7. Responsive design principles

## 🚀 Next Steps

After completing the basic app:

1. Add map view for internships
2. Implement saved searches
3. Add email notifications
4. Create recommendation engine
5. Build company profiles
6. Add video introductions
7. Implement referral system

---

**Remember**: This is your first feature - focus on getting the basics right. The goal is clean, working code that follows our patterns. You can always enhance it later!
