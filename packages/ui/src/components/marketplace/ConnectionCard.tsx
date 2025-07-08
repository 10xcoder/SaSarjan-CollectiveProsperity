import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  Star,
  MoreHorizontal,
  Eye,
  Download
} from 'lucide-react';
import { MarketplaceConnection, ConnectionStatus, UserBrandProfile } from '@sasarjan/shared/types/brand';

interface ConnectionCardProps {
  connection: MarketplaceConnection;
  currentUserId: string;
  seekerProfile?: UserBrandProfile;
  providerProfile?: UserBrandProfile;
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
  onMessage?: (connectionId: string) => void;
  onViewDetails?: (connectionId: string) => void;
  onCancel?: (connectionId: string) => void;
  onComplete?: (connectionId: string) => void;
  onLeaveReview?: (connectionId: string) => void;
  compact?: boolean;
  variant?: 'default' | 'detailed' | 'minimal';
}

export function ConnectionCard({
  connection,
  currentUserId,
  seekerProfile,
  providerProfile,
  onAccept,
  onReject,
  onMessage,
  onViewDetails,
  onCancel,
  onComplete,
  onLeaveReview,
  compact = false,
  variant = 'default'
}: ConnectionCardProps) {
  const {
    status,
    connectionType,
    connectionData,
    messagesCount,
    lastMessageAt,
    outcome,
    feedbackRating,
    feedbackText,
    createdAt,
    updatedAt
  } = connection;

  const isSeeker = seekerProfile?.userId === currentUserId;
  const isProvider = providerProfile?.userId === currentUserId;
  const otherProfile = isSeeker ? providerProfile : seekerProfile;
  const userRole = isSeeker ? 'seeker' : 'provider';

  const getStatusConfig = () => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        text: 'Pending'
      },
      accepted: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Accepted'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        text: 'Rejected'
      },
      completed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        text: 'Completed'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: XCircle,
        text: 'Cancelled'
      }
    };

    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  };

  const canAcceptReject = status === 'pending' && isProvider;
  const canCancel = ['pending', 'accepted'].includes(status);
  const canComplete = status === 'accepted' && (isProvider || userRole === 'admin');
  const canReview = status === 'completed' && !feedbackRating;
  const hasUnreadMessages = lastMessageAt && new Date(lastMessageAt) > new Date(updatedAt);

  return (
    <Card className={`group transition-all duration-200 hover:shadow-lg ${
      hasUnreadMessages ? 'ring-2 ring-blue-500/20' : ''
    }`}>
      <CardHeader className={`${compact ? 'pb-3' : 'pb-4'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Connection Type & Status */}
            <div className="flex flex-col gap-1">
              <Badge variant="outline" className="text-xs w-fit">
                {connectionType.replace('_', ' ')}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs w-fit ${statusConfig.color}`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.text}
              </Badge>
            </div>

            {/* Other User Info */}
            {otherProfile && (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherProfile.profileData.avatar} />
                  <AvatarFallback>
                    {otherProfile.profileData.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">
                    {otherProfile.profileData.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {otherProfile.profileData.title || otherProfile.profileType}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Connection Title/Description */}
        {connectionData.title && (
          <CardTitle className={`${compact ? 'text-sm' : 'text-base'} line-clamp-2 mt-2`}>
            {connectionData.title}
          </CardTitle>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Connection Details */}
        {connectionData.description && (
          <p className={`text-muted-foreground ${compact ? 'text-sm line-clamp-2' : 'line-clamp-3'}`}>
            {connectionData.description}
          </p>
        )}

        {/* Key Details Grid */}
        {variant !== 'minimal' && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {getTimeAgo(createdAt)}</span>
            </div>

            {connectionData.budget && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{connectionData.budget}</span>
              </div>
            )}

            {connectionData.deadline && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Due {formatDate(connectionData.deadline)}</span>
              </div>
            )}

            {messagesCount > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{messagesCount} messages</span>
                {hasUnreadMessages && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Requirements/Deliverables */}
        {variant === 'detailed' && connectionData.requirements && (
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-1">Requirements:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              {connectionData.requirements.slice(0, 3).map((req: string, index: number) => (
                <li key={index} className="line-clamp-1">{req}</li>
              ))}
              {connectionData.requirements.length > 3 && (
                <p className="text-blue-600">+{connectionData.requirements.length - 3} more</p>
              )}
            </ul>
          </div>
        )}

        {/* Progress/Status Updates */}
        {status === 'accepted' && connectionData.progress && (
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-muted-foreground">Progress</span>
              <span className="text-sm">{connectionData.progress.percentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${connectionData.progress.percentage || 0}%` }}
              />
            </div>
            {connectionData.progress.lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">
                Last update: {getTimeAgo(connectionData.progress.lastUpdate)}
              </p>
            )}
          </div>
        )}

        {/* Outcome/Review */}
        {status === 'completed' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            {outcome && (
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Outcome: {outcome}</span>
              </div>
            )}
            
            {feedbackRating && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{feedbackRating.toFixed(1)}</span>
              </div>
            )}
            
            {feedbackText && (
              <p className="text-sm text-muted-foreground italic">
                "{feedbackText}"
              </p>
            )}
          </div>
        )}

        {/* Rejection Reason */}
        {status === 'rejected' && connectionData.rejectionReason && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-red-800 mb-1">Reason for rejection:</p>
                <p className="text-sm text-red-700">{connectionData.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* Provider Actions */}
          {canAcceptReject && (
            <>
              <Button 
                size="sm" 
                onClick={() => onAccept?.(connection.id)}
                className="flex-1"
              >
                Accept
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onReject?.(connection.id)}
              >
                Decline
              </Button>
            </>
          )}

          {/* Common Actions */}
          {status === 'accepted' && onMessage && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onMessage(connection.id)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
              {hasUnreadMessages && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
              )}
            </Button>
          )}

          {canComplete && (
            <Button 
              size="sm"
              onClick={() => onComplete?.(connection.id)}
            >
              Mark Complete
            </Button>
          )}

          {canReview && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onLeaveReview?.(connection.id)}
            >
              <Star className="h-4 w-4 mr-2" />
              Leave Review
            </Button>
          )}

          {canCancel && onCancel && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onCancel(connection.id)}
              className="text-red-600 hover:text-red-700"
            >
              Cancel
            </Button>
          )}

          {/* View Details */}
          {onViewDetails && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onViewDetails(connection.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {/* Download attachments */}
          {connectionData.attachments && connectionData.attachments.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Handle download logic
                connectionData.attachments.forEach((attachment: any) => {
                  const link = document.createElement('a');
                  link.href = attachment.url;
                  link.download = attachment.name;
                  link.click();
                });
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}