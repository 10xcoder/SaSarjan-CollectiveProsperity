import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProfileType, ConnectionStatus } from '@sasarjan/shared/types/brand';

export interface SearchFiltersState {
  query?: string;
  profileType?: ProfileType;
  location?: {
    city?: string;
    country?: string;
    remote?: boolean;
    radius?: number;
  };
  skills?: string[];
  experience?: {
    min?: number;
    max?: number;
  };
  availability?: boolean;
  verified?: boolean;
  rating?: {
    min?: number;
    max?: number;
  };
  pricing?: {
    min?: number;
    max?: number;
    type?: 'fixed' | 'hourly' | 'negotiable' | 'free';
  };
  connectionStatus?: ConnectionStatus[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  availableSkills?: string[];
  availableLocations?: string[];
  filterType?: 'profiles' | 'listings' | 'connections';
  compact?: boolean;
  collapsible?: boolean;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  availableSkills = [],
  availableLocations = [],
  filterType = 'profiles',
  compact = false,
  collapsible = false
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [skillInput, setSkillInput] = useState('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.profileType) count++;
    if (filters.location?.city || filters.location?.country || filters.location?.remote) count++;
    if (filters.skills && filters.skills.length > 0) count++;
    if (filters.experience?.min || filters.experience?.max) count++;
    if (filters.availability !== undefined) count++;
    if (filters.verified !== undefined) count++;
    if (filters.rating?.min || filters.rating?.max) count++;
    if (filters.pricing?.min || filters.pricing?.max || filters.pricing?.type) count++;
    if (filters.connectionStatus && filters.connectionStatus.length > 0) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const updateFilters = (updates: Partial<SearchFiltersState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const addSkill = (skill: string) => {
    if (skill && !filters.skills?.includes(skill)) {
      updateFilters({
        skills: [...(filters.skills || []), skill]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateFilters({
      skills: filters.skills?.filter(s => s !== skill) || []
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const profileTypeOptions = [
    { value: 'seeker', label: 'Seekers' },
    { value: 'provider', label: 'Providers' },
    { value: 'both', label: 'Both' }
  ];

  const pricingTypeOptions = [
    { value: 'free', label: 'Free' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'negotiable', label: 'Negotiable' }
  ];

  const connectionStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Rating' },
    { value: 'experience', label: 'Experience' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'price', label: 'Price' }
  ];

  if (collapsible && !isExpanded) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                Clear All
              </Button>
            )}
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by keywords, skills, or description..."
              value={filters.query || ''}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Profile Type */}
        {filterType === 'profiles' && (
          <div className="space-y-2">
            <Label>Profile Type</Label>
            <Select
              value={filters.profileType || ''}
              onValueChange={(value) => updateFilters({ profileType: value as ProfileType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {profileTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City, Country"
                value={filters.location?.city || ''}
                onChange={(e) => updateFilters({
                  location: { ...filters.location, city: e.target.value }
                })}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={filters.location?.remote || false}
                onCheckedChange={(checked) => updateFilters({
                  location: { ...filters.location, remote: checked as boolean }
                })}
              />
              <Label htmlFor="remote" className="text-sm">Remote work available</Label>
            </div>
            
            {filters.location?.city && (
              <div className="space-y-2">
                <Label className="text-sm">Search radius: {filters.location?.radius || 50} km</Label>
                <Slider
                  value={[filters.location?.radius || 50]}
                  onValueChange={(value) => updateFilters({
                    location: { ...filters.location, radius: value[0] }
                  })}
                  max={200}
                  min={5}
                  step={5}
                />
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Skills</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSkill(skillInput)}
                disabled={!skillInput}
              >
                Add
              </Button>
            </div>
            
            {filters.skills && filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Experience */}
        {filterType === 'profiles' && (
          <div className="space-y-2">
            <Label>Experience (years)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Minimum</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.experience?.min || ''}
                  onChange={(e) => updateFilters({
                    experience: { 
                      ...filters.experience, 
                      min: e.target.value ? parseInt(e.target.value) : undefined 
                    }
                  })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Maximum</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.experience?.max || ''}
                  onChange={(e) => updateFilters({
                    experience: { 
                      ...filters.experience, 
                      max: e.target.value ? parseInt(e.target.value) : undefined 
                    }
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Minimum Rating
          </Label>
          <div className="space-y-2">
            <Slider
              value={[filters.rating?.min || 0]}
              onValueChange={(value) => updateFilters({
                rating: { ...filters.rating, min: value[0] }
              })}
              max={5}
              min={0}
              step={0.5}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>0 stars</span>
              <span>{filters.rating?.min || 0} stars</span>
              <span>5 stars</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        {filterType === 'listings' && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </Label>
            
            <Select
              value={filters.pricing?.type || ''}
              onValueChange={(value) => updateFilters({
                pricing: { ...filters.pricing, type: value as any }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any pricing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any pricing type</SelectItem>
                {pricingTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Min Price</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.pricing?.min || ''}
                  onChange={(e) => updateFilters({
                    pricing: { 
                      ...filters.pricing, 
                      min: e.target.value ? parseInt(e.target.value) : undefined 
                    }
                  })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max Price</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.pricing?.max || ''}
                  onChange={(e) => updateFilters({
                    pricing: { 
                      ...filters.pricing, 
                      max: e.target.value ? parseInt(e.target.value) : undefined 
                    }
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {filterType === 'connections' && (
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="space-y-2">
              {connectionStatusOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={filters.connectionStatus?.includes(option.value as ConnectionStatus) || false}
                    onCheckedChange={(checked) => {
                      const currentStatuses = filters.connectionStatus || [];
                      const newStatuses = checked
                        ? [...currentStatuses, option.value as ConnectionStatus]
                        : currentStatuses.filter(s => s !== option.value);
                      updateFilters({ connectionStatus: newStatuses });
                    }}
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Filters */}
        {filterType === 'profiles' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified || false}
                onCheckedChange={(checked) => updateFilters({ verified: checked as boolean })}
              />
              <Label htmlFor="verified" className="text-sm">Verified profiles only</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={filters.availability || false}
                onCheckedChange={(checked) => updateFilters({ availability: checked as boolean })}
              />
              <Label htmlFor="available" className="text-sm">Available for work</Label>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="space-y-2">
          <Label>Sort by</Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Select
                value={filters.sortBy || 'relevance'}
                onValueChange={(value) => updateFilters({ sortBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select
              value={filters.sortOrder || 'desc'}
              onValueChange={(value) => updateFilters({ sortOrder: value as 'asc' | 'desc' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">High to Low</SelectItem>
                <SelectItem value="asc">Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}