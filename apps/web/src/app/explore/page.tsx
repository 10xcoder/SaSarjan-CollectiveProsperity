'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, Download, Star, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Database } from '@/types/database';

type App = Database['public']['Tables']['apps']['Row'];
type MicroApp = Database['public']['Tables']['micro_apps']['Row'];

interface AppWithDetails extends App {
  micro_apps: MicroApp[];
  _count: {
    installations: number;
    reviews: number;
  };
  _avg: {
    rating: number | null;
  };
  tags?: { name: string }[];
}

const categoryColors: Record<string, string> = {
  'personal-transformation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'organizational-excellence': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'community-resilience': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'ecological-regeneration': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'economic-empowerment': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'knowledge-commons': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'social-innovation': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'cultural-expression': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const formatCategory = (category: string) => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Local running apps data
const localApps = [
  {
    id: 'local-10xgrowth',
    name: '10xGrowth',
    tagline: 'Freelancer marketplace for 10X business growth',
    description: 'Connect with top freelancers, manage projects, and build your professional profile. Features include freelancer browsing, landing page creation, and comprehensive profile management.',
    category: 'economic-empowerment',
    status: 'active',
    icon_url: '/icons/10xgrowth.svg',
    url: 'http://localhost:3002',
    micro_apps: [
      {
        id: 'freelancer-browse',
        name: 'Freelancer Browse',
        description: 'Find and connect with skilled freelancers across various categories',
        category: 'professional-networking'
      },
      {
        id: 'landing-pages',
        name: 'Landing Page Builder',
        description: 'Create custom landing pages for your business or services',
        category: 'content-management'
      },
      {
        id: 'profile-management',
        name: 'Profile Management',
        description: 'Build and manage your professional profile with skills and experience',
        category: 'personal-branding'
      }
    ],
    _count: { installations: 0, reviews: 0 },
    _avg: { rating: null }
  },
  {
    id: 'local-talentexcel',
    name: 'TalentExcel',
    tagline: 'Career opportunities and skill development platform',
    description: 'Discover internships, fellowships, and skill development programs. Location-aware matching for career growth.',
    category: 'personal-transformation',
    status: 'launching-soon',
    icon_url: '/icons/talentexcel.svg',
    url: 'http://localhost:3001',
    micro_apps: [],
    _count: { installations: 0, reviews: 0 },
    _avg: { rating: null }
  },
  {
    id: 'local-sevapremi',
    name: 'SevaPremi',
    tagline: 'Community service and volunteer platform',
    description: 'Connect with meaningful volunteer opportunities in your community. Track your impact, verify your service, and be part of India\'s largest community service network.',
    category: 'community-resilience',
    status: 'active',
    icon_url: '/icons/sevapremi.svg',
    url: 'http://localhost:3003',
    micro_apps: [
      {
        id: 'volunteer-opportunities',
        name: 'Volunteer Opportunities',
        description: 'Browse and register for community service opportunities',
        category: 'community-service'
      },
      {
        id: 'impact-tracker',
        name: 'Impact Tracker',
        description: 'Track your volunteer hours and community impact',
        category: 'analytics'
      },
      {
        id: 'service-verification',
        name: 'Service Verification',
        description: 'Get your community service verified and certified',
        category: 'certification'
      },
      {
        id: 'volunteer-profile',
        name: 'Volunteer Profile',
        description: 'Create and manage your volunteer profile and skills',
        category: 'profile-management'
      }
    ],
    _count: { installations: 0, reviews: 0 },
    _avg: { rating: null }
  }
];

export default function ExplorePage() {
  const [apps, setApps] = useState<AppWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());
  const [activatingApps, setActivatingApps] = useState<Set<string>>(new Set());

  const supabase = createClient();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      
      const { data: appsData, error: appsError } = await supabase
        .from('apps')
        .select(`
          *,
          micro_apps (*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Get installation counts
      const { data: installData, error: installError } = await supabase
        .from('app_installations')
        .select('app_id')
        .in('app_id', appsData?.map((app: App) => app.id) || []);

      if (installError) throw installError;

      // Get review data
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('app_id, rating')
        .in('app_id', appsData?.map((app: App) => app.id) || []);

      if (reviewError) throw reviewError;

      // Process the data
      const appsWithDetails = appsData?.map((app: App) => {
        const installations = installData?.filter((i: any) => i.app_id === app.id).length || 0;
        const appReviews = reviewData?.filter((r: any) => r.app_id === app.id) || [];
        const avgRating = appReviews.length > 0
          ? appReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / appReviews.length
          : null;

        return {
          ...app,
          micro_apps: (app as any).micro_apps || [],
          _count: {
            installations,
            reviews: appReviews.length
          },
          _avg: {
            rating: avgRating
          }
        };
      }) || [];

      // Combine with local apps
      const allApps = [...localApps, ...appsWithDetails];
      setApps(allApps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      // Even if database fails, show local apps
      setApps(localApps);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (appId: string) => {
    setExpandedApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const activateApp = async (appId: string) => {
    try {
      setActivatingApps(prev => new Set(prev).add(appId));
      
      // Check if it's a local app
      const app = apps.find(a => a.id === appId);
      if (app?.id.startsWith('local-')) {
        // For local apps, just open them directly
        window.open(app.url, '_blank');
        toast.success('Opening app...');
        return;
      }
      
      // Get current user for database apps
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        toast.error('Please sign in to activate apps');
        return;
      }

      // Check if already installed
      const { data: existing, error: checkError } = await supabase
        .from('app_installations')
        .select()
        .eq('app_id', appId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        toast.info('App is already activated');
        return;
      }

      // Create installation record
      const { error: installError } = await supabase
        .from('app_installations')
        .insert({
          app_id: appId,
          user_id: user.id,
          installed_at: new Date().toISOString()
        });

      if (installError) throw installError;

      toast.success('App activated successfully!');
      
      // Update local count
      setApps(prev => prev.map(app => 
        app.id === appId 
          ? { ...app, _count: { ...app._count, installations: app._count.installations + 1 } }
          : app
      ));
    } catch (error) {
      console.error('Error activating app:', error);
      toast.error('Failed to activate app');
    } finally {
      setActivatingApps(prev => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
      });
    }
  };

  const filteredApps = apps.filter(app => {
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.tagline?.toLowerCase().includes(query) ||
      app.category?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Explore Apps</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Apps</h1>
        <p className="text-muted-foreground">
          Discover apps that contribute to collective prosperity across eight categories
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search apps by name, tagline, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No apps found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          filteredApps.map((app) => (
            <Card key={app.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {app.icon_url && (
                      <img
                        src={app.icon_url}
                        alt={app.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-xl">{app.name}</CardTitle>
                      <CardDescription>{app.tagline}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.category && (
                      <Badge className={categoryColors[app.category] || ''}>
                        {formatCategory(app.category)}
                      </Badge>
                    )}
                    <Button
                      onClick={() => activateApp(app.id)}
                      disabled={activatingApps.has(app.id)}
                      size="sm"
                    >
                      {activatingApps.has(app.id) 
                        ? 'Opening...' 
                        : app.id.startsWith('local-') && app.status === 'active' 
                        ? 'Launch App' 
                        : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{app.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{app._count.installations} installs</span>
                  </div>
                  {app._avg.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{app._avg.rating.toFixed(1)} ({app._count.reviews} reviews)</span>
                    </div>
                  )}
                  {app.micro_apps.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{app.micro_apps.length} micro-apps</span>
                    </div>
                  )}
                </div>

                {app.micro_apps.length > 0 && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(app.id)}
                      className="w-full justify-between"
                    >
                      <span>View Micro-Apps</span>
                      {expandedApps.has(app.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {expandedApps.has(app.id) && (
                      <div className="mt-4 space-y-2">
                        {app.micro_apps.map((microApp) => (
                          <Card key={microApp.id} className="bg-muted/50">
                            <CardHeader className="py-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{microApp.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {microApp.description}
                                  </p>
                                </div>
                                {microApp.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {formatCategory(microApp.category)}
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}