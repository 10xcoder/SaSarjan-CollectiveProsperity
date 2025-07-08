import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
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
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search,
  Download,
  Star,
  Shield,
  Package,
  Code,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  Install,
  Eye,
  Heart,
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  MicroAppPackage, 
  PackageSearchFilters, 
  PackageSearchResult 
} from '@sasarjan/shared/types/developer';

interface PackageRegistryProps {
  onInstallPackage?: (packageName: string, version?: string) => Promise<void>;
  onViewPackage?: (packageName: string) => void;
  userBrands?: string[];
  isLoading?: boolean;
}

interface SearchState {
  query: string;
  category: string;
  brand: string;
  sort: string;
  isTemplate: boolean | null;
  isFeatured: boolean | null;
  licenses: string[];
  tags: string[];
}

export function PackageRegistry({
  onInstallPackage,
  onViewPackage,
  userBrands = [],
  isLoading = false
}: PackageRegistryProps) {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    category: '',
    brand: '',
    sort: 'relevance',
    isTemplate: null,
    isFeatured: null,
    licenses: [],
    tags: []
  });

  const [searchResult, setSearchResult] = useState<PackageSearchResult>({
    packages: [],
    totalCount: 0,
    facets: {
      categories: [],
      authors: [],
      licenses: [],
      tags: []
    },
    suggestions: []
  });

  const [selectedPackage, setSelectedPackage] = useState<MicroAppPackage | null>(null);
  const [installStatus, setInstallStatus] = useState<Record<string, 'installing' | 'installed' | 'error'>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const [debouncedQuery] = useDebounce(searchState.query, 300);

  // Search packages
  const searchPackages = async (page = 1) => {
    setIsSearching(true);
    
    try {
      const filters: PackageSearchFilters = {
        query: debouncedQuery || undefined,
        category: searchState.category || undefined,
        brand: searchState.brand || undefined,
        isTemplate: searchState.isTemplate || undefined,
        isFeatured: searchState.isFeatured || undefined,
        license: searchState.licenses.length > 0 ? searchState.licenses : undefined,
        tags: searchState.tags.length > 0 ? searchState.tags : undefined,
        sort: searchState.sort as any,
        limit: 12,
        offset: (page - 1) * 12
      };

      // In a real app, this would be an API call
      const mockResults: PackageSearchResult = {
        packages: generateMockPackages(filters),
        totalCount: 47,
        facets: {
          categories: [
            { name: 'two_sided_marketplace', count: 12 },
            { name: 'job_board', count: 8 },
            { name: 'learning_platform', count: 6 },
            { name: 'service_booking', count: 5 },
            { name: 'community', count: 4 },
            { name: 'analytics', count: 3 }
          ],
          authors: [
            { name: 'John Developer', count: 5 },
            { name: 'Jane Smith', count: 4 },
            { name: 'SaSarjan Team', count: 8 }
          ],
          licenses: [
            { name: 'MIT', count: 23 },
            { name: 'Apache-2.0', count: 12 },
            { name: 'GPL-3.0', count: 6 },
            { name: 'Proprietary', count: 6 }
          ],
          tags: [
            { name: 'marketplace', count: 15 },
            { name: 'education', count: 10 },
            { name: 'healthcare', count: 8 },
            { name: 'fintech', count: 7 }
          ]
        },
        suggestions: ['internship platform', 'job board', 'learning management']
      };

      setSearchResult(mockResults);
      setCurrentPage(page);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    searchPackages(1);
  }, [debouncedQuery, searchState.category, searchState.brand, searchState.sort, searchState.isTemplate, searchState.isFeatured]);

  const handleInstallPackage = async (packageName: string, version?: string) => {
    if (!onInstallPackage) return;

    setInstallStatus(prev => ({ ...prev, [packageName]: 'installing' }));
    
    try {
      await onInstallPackage(packageName, version);
      setInstallStatus(prev => ({ ...prev, [packageName]: 'installed' }));
    } catch (error) {
      setInstallStatus(prev => ({ ...prev, [packageName]: 'error' }));
      console.error('Installation error:', error);
    }
  };

  const handleFilterChange = (key: keyof SearchState, value: any) => {
    setSearchState(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchState({
      query: '',
      category: '',
      brand: '',
      sort: 'relevance',
      isTemplate: null,
      isFeatured: null,
      licenses: [],
      tags: []
    });
  };

  const totalPages = Math.ceil(searchResult.totalCount / 12);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters Sidebar */}
      <div className={`w-full lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={searchState.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {searchResult.facets.categories.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <Label>Brand Compatibility</Label>
              <Select value={searchState.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All brands</SelectItem>
                  <SelectItem value="talentexcel">TalentExcel</SelectItem>
                  <SelectItem value="happy247">Happy247</SelectItem>
                  <SelectItem value="10xgrowth">10x Growth</SelectItem>
                  <SelectItem value="sevapremi">Seva Premi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filters */}
            <div className="space-y-3">
              <Label>Type</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={searchState.isTemplate === true}
                    onCheckedChange={(checked) => handleFilterChange('isTemplate', checked ? true : null)}
                  />
                  <Label className="text-sm">Templates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={searchState.isFeatured === true}
                    onCheckedChange={(checked) => handleFilterChange('isFeatured', checked ? true : null)}
                  />
                  <Label className="text-sm">Featured</Label>
                </div>
              </div>
            </div>

            {/* License Filter */}
            <div className="space-y-3">
              <Label>License</Label>
              <div className="space-y-2">
                {searchResult.facets.licenses.map(license => (
                  <div key={license.name} className="flex items-center space-x-2">
                    <Checkbox
                      checked={searchState.licenses.includes(license.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleFilterChange('licenses', [...searchState.licenses, license.name]);
                        } else {
                          handleFilterChange('licenses', searchState.licenses.filter(l => l !== license.name));
                        }
                      }}
                    />
                    <Label className="text-sm">{license.name} ({license.count})</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1">
                {searchResult.facets.tags.map(tag => (
                  <Badge
                    key={tag.name}
                    variant={searchState.tags.includes(tag.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (searchState.tags.includes(tag.name)) {
                        handleFilterChange('tags', searchState.tags.filter(t => t !== tag.name));
                      } else {
                        handleFilterChange('tags', [...searchState.tags, tag.name]);
                      }
                    }}
                  >
                    {tag.name} ({tag.count})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={searchState.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={searchState.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="downloads">Downloads</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                  <SelectItem value="created">Newest</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{searchResult.totalCount} packages found</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {isSearching ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            searchResult.packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                installStatus={installStatus[pkg.packageName]}
                onInstall={() => handleInstallPackage(pkg.packageName)}
                onView={() => onViewPackage?.(pkg.packageName)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => searchPackages(currentPage - 1)}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(1, currentPage - 2);
              if (page > totalPages) return null;
              
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => searchPackages(page)}
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => searchPackages(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface PackageCardProps {
  package: MicroAppPackage;
  installStatus?: 'installing' | 'installed' | 'error';
  onInstall: () => void;
  onView: () => void;
}

function PackageCard({ package: pkg, installStatus, onInstall, onView }: PackageCardProps) {
  const getInstallButtonContent = () => {
    switch (installStatus) {
      case 'installing':
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Installing...
          </>
        );
      case 'installed':
        return (
          <>
            <CheckCircle className="h-4 w-4" />
            Installed
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="h-4 w-4" />
            Error
          </>
        );
      default:
        return (
          <>
            <Download className="h-4 w-4" />
            Install
          </>
        );
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {pkg.displayName}
              {pkg.isFeatured && (
                <Badge variant="secondary" className="ml-auto">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{pkg.packageName}</span>
              <span>•</span>
              <span>v{pkg.version}</span>
              {pkg.isTemplate && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    Template
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {pkg.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {pkg.totalDownloads.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {pkg.qualityScore.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(pkg.updatedAt).toLocaleDateString()}
          </div>
        </div>
        
        {/* Compatible Brands */}
        {pkg.compatibleBrands.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pkg.compatibleBrands.map(brandId => (
              <Badge key={brandId} variant="outline" className="text-xs">
                {brandId}
              </Badge>
            ))}
          </div>
        )}
        
        {/* License */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>License: {pkg.manifest.license}</span>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span className="text-green-600">Verified</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onInstall}
            disabled={installStatus === 'installing' || installStatus === 'installed'}
            className="flex-1 gap-2"
            size="sm"
          >
            {getInstallButtonContent()}
          </Button>
          
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data generator
function generateMockPackages(filters: PackageSearchFilters): MicroAppPackage[] {
  const mockPackages: Partial<MicroAppPackage>[] = [
    {
      id: '1',
      packageName: '@sasarjan/internship-platform',
      displayName: 'Internship Platform',
      description: 'Complete platform for managing internship applications and connections between students and companies.',
      version: '1.2.0',
      totalDownloads: 1247,
      qualityScore: 4.8,
      isFeatured: true,
      isTemplate: true,
      compatibleBrands: ['talentexcel', '10xgrowth'],
      manifest: { license: 'MIT' },
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      packageName: '@sasarjan/job-board',
      displayName: 'Job Board Pro',
      description: 'Advanced job posting and application management system with AI-powered matching.',
      version: '2.1.3',
      totalDownloads: 892,
      qualityScore: 4.6,
      isFeatured: false,
      isTemplate: true,
      compatibleBrands: ['talentexcel', 'happy247'],
      manifest: { license: 'Apache-2.0' },
      updatedAt: '2024-01-12T14:20:00Z'
    },
    {
      id: '3',
      packageName: '@sasarjan/wellness-coach',
      displayName: 'Wellness Coaching',
      description: 'Connect wellness seekers with certified coaches and track progress through personalized plans.',
      version: '1.0.0',
      totalDownloads: 456,
      qualityScore: 4.2,
      isFeatured: true,
      isTemplate: true,
      compatibleBrands: ['happy247', 'sevapremi'],
      manifest: { license: 'MIT' },
      updatedAt: '2024-01-10T09:15:00Z'
    }
  ];

  return mockPackages as MicroAppPackage[];
}