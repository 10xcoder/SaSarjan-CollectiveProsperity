import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  MapPin, 
  Star, 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  MessageCircle,
  Eye,
  Heart,
  Share2,
  Award,
  Clock
} from 'lucide-react';
import { UserBrandProfile, ProfileType } from '@sasarjan/shared/types/brand';

interface ProfileCardProps {
  profile: UserBrandProfile;
  onConnect?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
  onViewProfile?: (profileId: string) => void;
  onBookmark?: (profileId: string) => void;
  onShare?: (profileId: string) => void;
  compact?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'detailed' | 'minimal';
}

export function ProfileCard({
  profile,
  onConnect,
  onMessage,
  onViewProfile,
  onBookmark,
  onShare,
  compact = false,
  showActions = true,
  variant = 'default'
}: ProfileCardProps) {
  const {
    profileType,
    profileData,
    isVerified,
    completionPercentage,
    qualityScore,
    lastActiveAt,
    totalInteractions
  } = profile;

  const isMinimal = variant === 'minimal';
  const isDetailed = variant === 'detailed';

  const getAvailabilityStatus = () => {
    if (!profileData.availability) return null;
    
    const status = profileData.availability.status;
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      busy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unavailable: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return {
      status: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown',
      className: colors[status as keyof typeof colors] || colors.unavailable
    };
  };

  const getLastActive = () => {
    if (!lastActiveAt) return 'Unknown';
    
    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'Online now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    return lastActive.toLocaleDateString();
  };

  const availabilityStatus = getAvailabilityStatus();
  const lastActiveText = getLastActive();

  return (
    <Card className={`group relative transition-all duration-200 hover:shadow-lg ${
      isVerified ? 'ring-2 ring-blue-500/20' : ''
    } ${compact ? 'p-3' : 'p-4'}`}>
      {isVerified && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1">
          <CheckCircle className="h-3 w-3" />
        </div>
      )}

      <CardHeader className={compact ? 'p-0 pb-3' : 'p-0 pb-4'}>
        <div className="flex items-start gap-3">
          <div 
            className="relative cursor-pointer"
            onClick={() => onViewProfile?.(profile.id)}
          >
            <Avatar className={compact ? 'h-12 w-12' : 'h-16 w-16'}>
              <AvatarImage src={profileData.avatar} />
              <AvatarFallback className="text-lg font-semibold">
                {profileData.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {/* Online status indicator */}
            {lastActiveText.includes('Online') && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 
                  className={`font-semibold cursor-pointer hover:text-blue-600 transition-colors ${
                    compact ? 'text-base' : 'text-lg'
                  } line-clamp-1`}
                  onClick={() => onViewProfile?.(profile.id)}
                >
                  {profileData.name || 'Anonymous User'}
                </h3>
                
                <p className={`text-muted-foreground ${compact ? 'text-sm' : ''} line-clamp-1`}>
                  {profileData.title || profileData.profession || `${profileType} Profile`}
                </p>
                
                {!isMinimal && profileData.company && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    at {profileData.company}
                  </p>
                )}
              </div>
              
              {showActions && (
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBookmark?.(profile.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onShare?.(profile.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Status badges */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs capitalize">
                {profileType.replace('_', ' ')}
              </Badge>
              
              {isVerified && (
                <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                  Verified
                </Badge>
              )}
              
              {availabilityStatus && (
                <Badge variant="outline" className={`text-xs ${availabilityStatus.className}`}>
                  {availabilityStatus.status}
                </Badge>
              )}
              
              {qualityScore > 4.0 && (
                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                  <Award className="h-3 w-3 mr-1" />
                  Top Rated
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        {/* Bio */}
        {!isMinimal && profileData.bio && (
          <p className={`text-muted-foreground ${compact ? 'text-sm line-clamp-2' : 'line-clamp-3'}`}>
            {profileData.bio}
          </p>
        )}

        {/* Key Info Grid */}
        <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-2'} text-sm`}>
          {profileData.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">
                {typeof profileData.location === 'string' 
                  ? profileData.location 
                  : `${profileData.location.city}, ${profileData.location.country}`
                }
              </span>
            </div>
          )}
          
          {profileData.experience && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="line-clamp-1">
                {typeof profileData.experience === 'string'
                  ? profileData.experience
                  : `${profileData.experience.years}+ years`
                }
              </span>
            </div>
          )}
          
          {profileData.rating && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>
                {profileData.rating.toFixed(1)} 
                {profileData.reviewCount && ` (${profileData.reviewCount})`}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{lastActiveText}</span>
          </div>
        </div>

        {/* Skills/Tags */}
        {!isMinimal && profileData.skills && profileData.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profileData.skills.slice(0, compact ? 3 : 6).map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profileData.skills.length > (compact ? 3 : 6) && (
              <Badge variant="secondary" className="text-xs">
                +{profileData.skills.length - (compact ? 3 : 6)}
              </Badge>
            )}
          </div>
        )}

        {/* Services/Offerings (for providers) */}
        {!isMinimal && profileType === 'provider' && profileData.services && (
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-1">Services:</p>
            <div className="flex flex-wrap gap-1">
              {profileData.services.slice(0, 3).map((service: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {typeof service === 'string' ? service : service.name}
                </Badge>
              ))}
              {profileData.services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profileData.services.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Interests (for seekers) */}
        {!isMinimal && profileType === 'seeker' && profileData.interests && (
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-1">Interests:</p>
            <div className="flex flex-wrap gap-1">
              {profileData.interests.slice(0, 3).map((interest: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profileData.interests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profileData.interests.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Portfolio/Work Samples */}
        {isDetailed && profileData.portfolio && profileData.portfolio.length > 0 && (
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-2">Recent Work:</p>
            <div className="grid grid-cols-2 gap-2">
              {profileData.portfolio.slice(0, 4).map((item: any, index: number) => (
                <div key={index} className="relative group">
                  <img 
                    src={item.thumbnail || item.image} 
                    alt={item.title}
                    className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(item.url, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {isDetailed && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t text-center">
            <div>
              <p className="text-lg font-semibold">{totalInteractions || 0}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{completionPercentage}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{qualityScore.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {onConnect && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onConnect(profile.id)}
              >
                Connect
              </Button>
            )}
            
            {onMessage && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onMessage(profile.id)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
            
            {onViewProfile && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewProfile(profile.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}