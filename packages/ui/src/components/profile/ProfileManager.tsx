import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Plus, 
  Edit, 
  Eye, 
  Settings, 
  Share, 
  Download,
  Copy,
  ExternalLink,
  User,
  Building,
  Shield,
  Star,
  TrendingUp,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { 
  UserBrandProfile, 
  ProfileType, 
  Brand,
  ProfileVisibility 
} from '@sasarjan/shared/types/brand';
import { ProfileForm } from './ProfileForm';
import { ProfileCard } from '../marketplace/ProfileCard';

interface ProfileManagerProps {
  userId: string;
  brands: Brand[];
  profiles: UserBrandProfile[];
  onCreateProfile: (brandId: string, profileType: ProfileType, profileData: any) => Promise<void>;
  onUpdateProfile: (profileId: string, profileData: any) => Promise<void>;
  onDeleteProfile: (profileId: string) => Promise<void>;
  onViewProfile: (profileId: string) => void;
  onShareProfile: (profileId: string) => void;
  currentBrandId?: string;
}

interface ProfileStats {
  totalViews: number;
  totalConnections: number;
  responseRate: number;
  rating: number;
  activeListings: number;
  completedProjects: number;
}

export function ProfileManager({
  userId,
  brands,
  profiles,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  onViewProfile,
  onShareProfile,
  currentBrandId
}: ProfileManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(
    currentBrandId ? brands.find(b => b.id === currentBrandId) || brands[0] : brands[0]
  );
  const [editingProfile, setEditingProfile] = useState<UserBrandProfile | null>(null);
  const [creatingProfile, setCreatingProfile] = useState<{brandId: string, type: ProfileType} | null>(null);
  const [profileStats, setProfileStats] = useState<Record<string, ProfileStats>>({});

  const brandProfiles = profiles.filter(p => p.brandId === selectedBrand?.id);
  const seekerProfile = brandProfiles.find(p => p.profileType === 'seeker');
  const providerProfile = brandProfiles.find(p => p.profileType === 'provider');

  // Mock profile stats - in real app, this would come from API
  useEffect(() => {
    const mockStats: Record<string, ProfileStats> = {};
    profiles.forEach(profile => {
      mockStats[profile.id] = {
        totalViews: Math.floor(Math.random() * 1000) + 100,
        totalConnections: profile.totalInteractions || 0,
        responseRate: Math.floor(Math.random() * 40) + 60,
        rating: profile.qualityScore || 0,
        activeListings: Math.floor(Math.random() * 5),
        completedProjects: Math.floor(Math.random() * 20)
      };
    });
    setProfileStats(mockStats);
  }, [profiles]);

  const getProfileCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVisibilityIcon = (visibility: ProfileVisibility) => {
    switch (visibility) {
      case 'public':
        return <Eye className="h-4 w-4 text-green-600" />;
      case 'verified_only':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'private':
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getVisibilityLabel = (visibility: ProfileVisibility) => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'verified_only':
        return 'Verified Only';
      case 'private':
        return 'Private';
    }
  };

  const handleCreateProfile = async (profileData: any) => {
    if (!creatingProfile || !selectedBrand) return;
    
    await onCreateProfile(selectedBrand.id, creatingProfile.type, profileData);
    setCreatingProfile(null);
  };

  const handleUpdateProfile = async (profileData: any) => {
    if (!editingProfile) return;
    
    await onUpdateProfile(editingProfile.id, profileData);
    setEditingProfile(null);
  };

  const copyProfileUrl = (profile: UserBrandProfile) => {
    const url = `${window.location.origin}/profiles/${profile.id}`;
    navigator.clipboard.writeText(url);
    // Show toast notification
  };

  const exportProfileData = (profile: UserBrandProfile) => {
    const data = {
      profile: profile.profileData,
      stats: profileStats[profile.id],
      brand: selectedBrand?.name
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.profileData.name || 'profile'}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (editingProfile) {
    return (
      <div className="max-w-4xl mx-auto">
        <ProfileForm
          profile={editingProfile}
          profileType={editingProfile.profileType}
          schema={{
            required: ['name', 'email', 'title', 'bio'],
            optional: ['location', 'skills', 'experience'],
            validation: {},
            display: {
              order: ['name', 'email', 'title', 'bio', 'location'],
              groups: {},
              labels: {
                name: 'Full Name',
                email: 'Email Address',
                title: 'Professional Title',
                bio: 'About You',
                location: 'Location'
              },
              placeholders: {
                name: 'Enter your full name',
                email: 'Enter your email address',
                title: 'Your professional title',
                bio: 'Tell us about yourself',
                location: 'City, Country'
              },
              help: {}
            }
          }}
          brandId={selectedBrand?.id || ''}
          onSave={handleUpdateProfile}
          onCancel={() => setEditingProfile(null)}
          mode="edit"
        />
      </div>
    );
  }

  if (creatingProfile) {
    return (
      <div className="max-w-4xl mx-auto">
        <ProfileForm
          profileType={creatingProfile.type}
          schema={{
            required: ['name', 'email', 'title', 'bio'],
            optional: ['location', 'skills', 'experience'],
            validation: {},
            display: {
              order: ['name', 'email', 'title', 'bio', 'location'],
              groups: {},
              labels: {
                name: 'Full Name',
                email: 'Email Address',
                title: 'Professional Title',
                bio: 'About You',
                location: 'Location'
              },
              placeholders: {
                name: 'Enter your full name',
                email: 'Enter your email address',
                title: 'Your professional title',
                bio: 'Tell us about yourself',
                location: 'City, Country'
              },
              help: {}
            }
          }}
          brandId={selectedBrand?.id || ''}
          onSave={handleCreateProfile}
          onCancel={() => setCreatingProfile(null)}
          mode="create"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile Manager</h1>
          <p className="text-muted-foreground">
            Manage your profiles across different brands and platforms
          </p>
        </div>
        
        {/* Brand Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Brand:</span>
          <select
            value={selectedBrand?.id || ''}
            onChange={(e) => {
              const brand = brands.find(b => b.id === e.target.value);
              setSelectedBrand(brand || null);
            }}
            className="px-3 py-2 border rounded-md"
          >
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Brand Header */}
      {selectedBrand && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedBrand.logoUrl} />
                <AvatarFallback className="text-lg">
                  {selectedBrand.displayName.split(' ').map(w => w[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{selectedBrand.displayName}</h2>
                <p className="text-muted-foreground">{selectedBrand.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{selectedBrand.domain}</span>
                  <span>•</span>
                  <span>{brandProfiles.length} active profiles</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://${selectedBrand.domain}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Site
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seeker">Seeker Profile</TabsTrigger>
          <TabsTrigger value="provider">Provider Profile</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seeker Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Seeker Profile
                  </CardTitle>
                  {seekerProfile && (
                    <div className="flex items-center gap-1">
                      {getVisibilityIcon(seekerProfile.visibility)}
                      <span className="text-xs text-muted-foreground">
                        {getVisibilityLabel(seekerProfile.visibility)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {seekerProfile ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seekerProfile.profileData.avatar} />
                        <AvatarFallback>
                          {seekerProfile.profileData.name?.split(' ').map(n => n[0]).join('') || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{seekerProfile.profileData.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {seekerProfile.profileData.title}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Profile Completion</span>
                        <span className={`font-medium ${getProfileCompletionColor(seekerProfile.completionPercentage)}`}>
                          {seekerProfile.completionPercentage}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${seekerProfile.completionPercentage}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="font-medium">{profileStats[seekerProfile.id]?.totalViews || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Connections</p>
                          <p className="font-medium">{profileStats[seekerProfile.id]?.totalConnections || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingProfile(seekerProfile)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewProfile(seekerProfile.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyProfileUrl(seekerProfile)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Seeker Profile</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a seeker profile to find opportunities and connect with providers.
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => setCreatingProfile({brandId: selectedBrand!.id, type: 'seeker'})}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Seeker Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Provider Profile
                  </CardTitle>
                  {providerProfile && (
                    <div className="flex items-center gap-1">
                      {getVisibilityIcon(providerProfile.visibility)}
                      <span className="text-xs text-muted-foreground">
                        {getVisibilityLabel(providerProfile.visibility)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {providerProfile ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={providerProfile.profileData.avatar} />
                        <AvatarFallback>
                          {providerProfile.profileData.name?.split(' ').map(n => n[0]).join('') || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{providerProfile.profileData.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {providerProfile.profileData.title}
                        </p>
                        {providerProfile.profileData.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{providerProfile.profileData.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Profile Completion</span>
                        <span className={`font-medium ${getProfileCompletionColor(providerProfile.completionPercentage)}`}>
                          {providerProfile.completionPercentage}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${providerProfile.completionPercentage}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="font-medium">{profileStats[providerProfile.id]?.totalViews || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Projects</p>
                          <p className="font-medium">{profileStats[providerProfile.id]?.completedProjects || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingProfile(providerProfile)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewProfile(providerProfile.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyProfileUrl(providerProfile)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Provider Profile</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a provider profile to offer services and connect with seekers.
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => setCreatingProfile({brandId: selectedBrand!.id, type: 'provider'})}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Provider Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seeker Profile Tab */}
        <TabsContent value="seeker" className="space-y-6">
          {seekerProfile ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProfileCard
                  profile={seekerProfile}
                  variant="detailed"
                  showActions={false}
                />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setEditingProfile(seekerProfile)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => onShareProfile(seekerProfile.id)}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => exportProfileData(seekerProfile)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Views</span>
                      <span className="font-medium">{profileStats[seekerProfile.id]?.totalViews || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Connections</span>
                      <span className="font-medium">{profileStats[seekerProfile.id]?.totalConnections || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Response Rate</span>
                      <span className="font-medium">{profileStats[seekerProfile.id]?.responseRate || 0}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-xl font-semibold mb-2">Create Your Seeker Profile</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                A seeker profile helps you find opportunities, connect with providers, 
                and showcase your interests and requirements.
              </p>
              <Button 
                size="lg"
                onClick={() => setCreatingProfile({brandId: selectedBrand!.id, type: 'seeker'})}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Seeker Profile
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Provider Profile Tab */}
        <TabsContent value="provider" className="space-y-6">
          {providerProfile ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProfileCard
                  profile={providerProfile}
                  variant="detailed"
                  showActions={false}
                />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setEditingProfile(providerProfile)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => onShareProfile(providerProfile.id)}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => exportProfileData(providerProfile)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Provider Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Profile Views</span>
                      <span className="font-medium">{profileStats[providerProfile.id]?.totalViews || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Listings</span>
                      <span className="font-medium">{profileStats[providerProfile.id]?.activeListings || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed Projects</span>
                      <span className="font-medium">{profileStats[providerProfile.id]?.completedProjects || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Response Rate</span>
                      <span className="font-medium">{profileStats[providerProfile.id]?.responseRate || 0}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-xl font-semibold mb-2">Create Your Provider Profile</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                A provider profile helps you showcase your services, connect with clients, 
                and grow your business within the {selectedBrand?.displayName} ecosystem.
              </p>
              <Button 
                size="lg"
                onClick={() => setCreatingProfile({brandId: selectedBrand!.id, type: 'provider'})}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Provider Profile
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {brandProfiles.map(profile => {
              const stats = profileStats[profile.id];
              if (!stats) return null;
              
              return (
                <Card key={profile.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {profile.profileType === 'seeker' ? <User className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                      {profile.profileType.charAt(0).toUpperCase() + profile.profileType.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{stats.totalViews}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total Views</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{stats.totalConnections}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Connections</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{stats.responseRate}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Response Rate</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}