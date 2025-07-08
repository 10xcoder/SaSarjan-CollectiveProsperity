import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MapPin, Clock, DollarSign, Star, Heart, Share2 } from 'lucide-react';
import { UserBrandProfile } from '@sasarjan/shared/types/brand';

export interface Listing {
  id: string;
  title: string;
  description: string;
  provider: UserBrandProfile;
  category: string;
  tags: string[];
  location?: {
    city: string;
    country: string;
    remote?: boolean;
  };
  pricing?: {
    type: 'fixed' | 'hourly' | 'negotiable' | 'free';
    amount?: number;
    currency?: string;
  };
  duration?: {
    type: 'short_term' | 'long_term' | 'project_based';
    estimate?: string;
  };
  requirements: string[];
  benefits?: string[];
  deadline?: string;
  applicationsCount: number;
  maxApplications?: number;
  isBookmarked?: boolean;
  rating?: number;
  reviewsCount?: number;
  urgency?: 'low' | 'medium' | 'high';
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListingCardProps {
  listing: Listing;
  onApply?: (listingId: string) => void;
  onBookmark?: (listingId: string) => void;
  onShare?: (listingId: string) => void;
  onViewProfile?: (providerId: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

export function ListingCard({
  listing,
  onApply,
  onBookmark,
  onShare,
  onViewProfile,
  compact = false,
  showActions = true
}: ListingCardProps) {
  const {
    title,
    description,
    provider,
    category,
    tags,
    location,
    pricing,
    duration,
    requirements,
    benefits,
    deadline,
    applicationsCount,
    maxApplications,
    isBookmarked,
    rating,
    reviewsCount,
    urgency,
    featured,
    createdAt
  } = listing;

  const formatPrice = () => {
    if (!pricing) return null;
    
    switch (pricing.type) {
      case 'fixed':
        return `${pricing.currency || '$'}${pricing.amount}`;
      case 'hourly':
        return `${pricing.currency || '$'}${pricing.amount}/hr`;
      case 'negotiable':
        return 'Negotiable';
      case 'free':
        return 'Free';
      default:
        return null;
    }
  };

  const getUrgencyColor = () => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApplicationStatus = () => {
    if (!maxApplications) return null;
    
    const percentage = (applicationsCount / maxApplications) * 100;
    
    if (percentage >= 90) {
      return { status: 'Almost Full', color: 'text-red-600' };
    } else if (percentage >= 70) {
      return { status: 'Filling Fast', color: 'text-yellow-600' };
    } else if (percentage >= 50) {
      return { status: 'Moderate Interest', color: 'text-blue-600' };
    }
    
    return null;
  };

  const applicationStatus = getApplicationStatus();
  const price = formatPrice();
  const timeAgo = new Date(createdAt).toLocaleDateString();

  return (
    <Card className={`group relative transition-all duration-200 hover:shadow-lg ${
      featured ? 'ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50' : ''
    } ${compact ? 'p-3' : 'p-4'}`}>
      {featured && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full font-medium">
          Featured
        </div>
      )}

      <CardHeader className={compact ? 'p-0 pb-2' : 'p-0 pb-4'}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              {urgency && (
                <Badge variant="outline" className={`text-xs ${getUrgencyColor()}`}>
                  {urgency} priority
                </Badge>
              )}
              {applicationStatus && (
                <span className={`text-xs font-medium ${applicationStatus.color}`}>
                  {applicationStatus.status}
                </span>
              )}
            </div>
            
            <CardTitle className={`${compact ? 'text-base' : 'text-lg'} line-clamp-2 group-hover:text-blue-600 transition-colors`}>
              {title}
            </CardTitle>
            
            <p className={`text-muted-foreground mt-1 ${compact ? 'text-sm line-clamp-2' : 'line-clamp-3'}`}>
              {description}
            </p>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBookmark?.(listing.id)}
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                  isBookmarked ? 'text-red-500 opacity-100' : ''
                }`}
              >
                <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare?.(listing.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        {/* Provider Info */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
          onClick={() => onViewProfile?.(provider.id)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={provider.profileData.avatar} />
            <AvatarFallback>
              {provider.profileData.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-1">
              {provider.profileData.name || 'Anonymous'}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{rating.toFixed(1)}</span>
                  {reviewsCount && <span>({reviewsCount})</span>}
                </div>
              )}
              {provider.isVerified && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-2'} text-sm`}>
          {location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">
                {location.remote ? 'Remote' : `${location.city}, ${location.country}`}
              </span>
            </div>
          )}
          
          {duration && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="line-clamp-1">
                {duration.estimate || duration.type.replace('_', ' ')}
              </span>
            </div>
          )}
          
          {price && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium text-foreground">{price}</span>
            </div>
          )}
          
          {deadline && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Due: {new Date(deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {!compact && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Requirements Preview */}
        {!compact && requirements.length > 0 && (
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-1">Requirements:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {requirements.slice(0, 2).map((req, index) => (
                <li key={index} className="line-clamp-1">{req}</li>
              ))}
              {requirements.length > 2 && (
                <li className="text-blue-600">+{requirements.length - 2} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Benefits Preview */}
        {!compact && benefits && benefits.length > 0 && (
          <div className="text-sm">
            <p className="font-medium text-green-700 mb-1">Benefits:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {benefits.slice(0, 2).map((benefit, index) => (
                <li key={index} className="line-clamp-1">{benefit}</li>
              ))}
              {benefits.length > 2 && (
                <li className="text-blue-600">+{benefits.length - 2} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <span>{applicationsCount} applications</span>
            {maxApplications && (
              <span className="text-blue-600">
                {maxApplications - applicationsCount} spots left
              </span>
            )}
          </div>
          
          {showActions && onApply && (
            <Button 
              size="sm"
              onClick={() => onApply(listing.id)}
              disabled={maxApplications ? applicationsCount >= maxApplications : false}
              className="ml-auto"
            >
              {maxApplications && applicationsCount >= maxApplications ? 'Full' : 'Apply'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}