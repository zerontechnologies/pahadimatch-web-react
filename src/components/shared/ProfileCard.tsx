import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  GraduationCap, 
  Briefcase,
  CheckCircle2,
  Crown,
  Eye,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatHeight, formatTimeAgo, getInitials, capitalize } from '@/lib/utils';
import { useSendInterestMutation, useShortlistProfileMutation, useRemoveFromShortlistMutation } from '@/store/api/activityApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import type { SearchResultProfile } from '@/types';

interface ProfileCardProps {
  profile: SearchResultProfile;
  variant?: 'grid' | 'list';
  isShortlisted?: boolean;
  showMatchScore?: boolean;
}

export const ProfileCard = memo(function ProfileCard({ 
  profile, 
  variant = 'grid', 
  isShortlisted = false,
  showMatchScore = false 
}: ProfileCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [localShortlisted, setLocalShortlisted] = useState(isShortlisted);
  
  const [sendInterest, { isLoading: isSendingInterest }] = useSendInterestMutation();
  const [shortlistProfile] = useShortlistProfileMutation();
  const [removeFromShortlist] = useRemoveFromShortlistMutation();

  const handleSendInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (profile.isPremiumRequired) {
      dispatch(addToast({
        type: 'info',
        title: 'Premium Required',
        message: 'Upgrade to premium to send interest',
      }));
      navigate('/membership');
      return;
    }
    
    try {
      await sendInterest({ profileId: profile.profileId }).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Interest Sent',
        message: `Your interest has been sent to ${profile.lastName || 'this profile'}`,
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed',
        message: err?.data?.message || 'Could not send interest',
      }));
    }
  };

  const handleToggleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (localShortlisted) {
        await removeFromShortlist(profile.profileId).unwrap();
        setLocalShortlisted(false);
        dispatch(addToast({
          type: 'info',
          title: 'Removed',
          message: 'Profile removed from shortlist',
        }));
      } else {
        await shortlistProfile({ profileId: profile.profileId }).unwrap();
        setLocalShortlisted(true);
        dispatch(addToast({
          type: 'success',
          title: 'Shortlisted',
          message: 'Profile added to shortlist',
        }));
      }
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed',
        message: err?.data?.message || 'Action failed',
      }));
    }
  };

  // Get profile photo from photos array or profilePhoto
  // Photos are visible if: not locked OR (locked but interest accepted)
  const canSeePhotos = !profile.photosLocked;
  const profilePhoto = canSeePhotos 
    ? (profile.photos?.find(p => p.isProfilePhoto)?.url || profile.photos?.[0]?.url || profile.profilePhoto)
    : undefined;

  // Premium Required - Locked Card
  if (profile.isPremiumRequired) {
    if (variant === 'list') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 p-4 bg-surface rounded-xl border border-border opacity-75"
        >
          <div className="w-20 h-20 rounded-xl bg-champagne flex items-center justify-center">
            <Lock className="w-8 h-8 text-text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-muted">Premium Required</h3>
                  <Badge variant="gold">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Profile ID: {profile.profileId}
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="accent" 
              className="mt-3"
              onClick={(e) => {
                e.preventDefault();
                navigate('/membership');
              }}
            >
              <Crown className="w-4 h-4 mr-1" />
              Upgrade to View
            </Button>
          </div>
        </motion.div>
      );
    }

    // Grid variant - Locked
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-2xl border border-border overflow-hidden opacity-75"
      >
        <div className="relative aspect-[4/5] bg-champagne flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-16 h-16 text-text-muted mx-auto mb-2" />
            <Badge variant="gold" className="mb-2">
              <Crown className="w-3 h-3 mr-1" />
              Premium Required
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-text-muted mb-2">
              Profile ID: {profile.profileId}
            </p>
            <Button 
              size="sm" 
              variant="accent" 
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                navigate('/membership');
              }}
            >
              <Crown className="w-4 h-4 mr-1" />
              Upgrade to View Details
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'list') {
    return (
      <Link to={`/profile/${profile.profileId}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="flex gap-4 p-4 bg-surface rounded-xl border border-border hover:border-primary-200 hover:shadow-md transition-all duration-200"
        >
          {/* Photo */}
          <Avatar className="w-20 h-20 rounded-xl">
            {canSeePhotos && profilePhoto ? (
              <AvatarImage src={profilePhoto} />
            ) : (
              <div className="w-full h-full bg-champagne flex items-center justify-center">
                <Lock className="w-8 h-8 text-text-muted" />
              </div>
            )}
            <AvatarFallback className="rounded-xl text-lg">
              {getInitials('', profile.lastName || '')}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {profile.requiresPremiumForName || !profile.lastName ? (
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-text-muted" />
                      <h3 className="font-semibold text-text truncate">
                        Profile ID: {profile.profileId}
                      </h3>
                    </div>
                  ) : (
                    <h3 className="font-semibold text-text truncate">
                      {profile.lastName}
                    </h3>
                  )}
                  {profile.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-success fill-success/20" />
                  )}
                </div>
                {profile.age && profile.height && (
                  <p className="text-sm text-text-secondary">
                    {profile.age} yrs, {formatHeight(profile.height)}
                  </p>
                )}
              </div>
              <Badge variant={profile.isVerified ? 'success' : 'outline'} className="flex-shrink-0">
                {profile.profileId}
              </Badge>
            </div>

            {profile.city && profile.state && (
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.city}, {profile.state}
                </span>
                {profile.education && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {capitalize(profile.education.replace(/_/g, ' '))}
                  </span>
                )}
                {profile.occupation && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {capitalize(profile.occupation.replace(/_/g, ' '))}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              {!profile.alreadySentInterest && (
                <Button size="sm" onClick={handleSendInterest} isLoading={isSendingInterest}>
                  <Heart className="w-4 h-4 mr-1" />
                  Send Interest
                </Button>
              )}
              {profile.alreadySentInterest && (
                <Badge variant={profile.sentInterestStatus === 'accepted' ? 'success' : 'outline'}>
                  {profile.sentInterestStatus === 'accepted' ? 'Connected' : 
                   profile.sentInterestStatus === 'declined' ? 'Declined' : 'Pending'}
                </Badge>
              )}
              {profile.isConnected && (
                <Button size="sm" variant="outline" onClick={() => navigate(`/chat/${profile.profileId}`)}>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              )}
              <button
                onClick={handleToggleShortlist}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  localShortlisted
                    ? 'text-accent bg-accent-50'
                    : 'text-text-muted hover:bg-champagne'
                )}
              >
                {localShortlisted ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Grid variant - Full Profile
  return (
    <Link to={`/profile/${profile.profileId}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="group bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary-200 hover:shadow-lg transition-all duration-300"
      >
        {/* Photo */}
        <div className="relative aspect-[4/5] bg-champagne overflow-hidden">
          {canSeePhotos && profilePhoto ? (
            <img
              src={profilePhoto}
              alt={profile.firstName || 'Profile'}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : profile.photosLocked ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-champagne to-primary-50">
              <Lock className="w-12 h-12 text-text-muted mb-2" />
              <p className="text-xs text-text-secondary text-center px-2">
                Photos Private
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
              <span className="text-6xl font-display text-primary/30">
                {getInitials('', profile.lastName || '')}
              </span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            {profile.isVerified && (
              <Badge variant="success" className="backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {showMatchScore && profile.matchScore && (
              <Badge variant="premium" className="backdrop-blur-sm">
                {Math.round(profile.matchScore)}% Match
              </Badge>
            )}
          </div>

          {/* Shortlist Button */}
          <button
            onClick={handleToggleShortlist}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200',
              localShortlisted
                ? 'bg-accent text-white'
                : 'bg-white/80 text-text-muted hover:bg-white hover:text-accent'
            )}
          >
            {localShortlisted ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Action Buttons - Show on Hover */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {!profile.alreadySentInterest ? (
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSendInterest}
                isLoading={isSendingInterest}
              >
                <Heart className="w-4 h-4 mr-1" />
                Interest
              </Button>
            ) : (
              <Badge 
                variant={profile.sentInterestStatus === 'accepted' ? 'success' : 'outline'}
                className="flex-1 justify-center"
              >
                {profile.sentInterestStatus === 'accepted' ? 'Connected' : 
                 profile.sentInterestStatus === 'declined' ? 'Declined' : 'Pending'}
              </Badge>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/profile/${profile.profileId}`);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              {profile.requiresPremiumForName || !profile.firstName ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-text-muted" />
                    <h3 className="font-semibold text-text-muted group-hover:text-primary transition-colors">
                      Profile ID: {profile.profileId}
                    </h3>
                  </div>
                  <Badge variant="gold" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              ) : (
                <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                  {profile.firstName} {profile.lastName}
                </h3>
              )}
              {profile.age && profile.height && (
                <p className="text-sm text-text-secondary">
                  {profile.age} yrs, {formatHeight(profile.height)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-text-secondary">
            {profile.city && profile.state && (
              <p className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{profile.city}, {profile.state}</span>
              </p>
            )}
            {profile.occupation && (
              <p className="flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{capitalize(profile.occupation.replace(/_/g, ' '))}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            {profile.lastActive && (
              <span className="text-xs text-text-muted">
                Active {formatTimeAgo(profile.lastActive)}
              </span>
            )}
            <Badge variant="outline" className="text-xs">
              {profile.profileId}
            </Badge>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if these props change
  return (
    prevProps.profile.profileId === nextProps.profile.profileId &&
    prevProps.profile.profilePhoto === nextProps.profile.profilePhoto &&
    prevProps.profile.lastName === nextProps.profile.lastName &&
    prevProps.profile.isPremiumRequired === nextProps.profile.isPremiumRequired &&
    prevProps.profile.photosLocked === nextProps.profile.photosLocked &&
    prevProps.profile.alreadySentInterest === nextProps.profile.alreadySentInterest &&
    prevProps.variant === nextProps.variant &&
    prevProps.isShortlisted === nextProps.isShortlisted &&
    prevProps.showMatchScore === nextProps.showMatchScore
  );
});

