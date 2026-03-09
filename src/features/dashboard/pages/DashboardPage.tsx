import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart,
  MessageSquare, 
  Eye, 
  Sparkles, 
  Crown,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProfileCard } from '@/components/shared/ProfileCard';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useGetOwnProfileQuery, useGetProfileViewsQuery } from '@/store/api/profileApi';
import { useGetMatchesByCategoryQuery } from '@/store/api/matchApi';
import { useGetMembershipSummaryQuery } from '@/store/api/membershipApi';
import { useGetReceivedInterestsQuery, useGetSentInterestsQuery, useAcceptInterestMutation, useDeclineInterestMutation } from '@/store/api/activityApi';
import { useGetChatListQuery, useGetUnreadCountQuery } from '@/store/api/chatApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { formatDate } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: profile } = useGetOwnProfileQuery();
  const { data: membership } = useGetMembershipSummaryQuery();
  const { data: newMatches, isLoading: matchesLoading } = useGetMatchesByCategoryQuery({
    category: 'new_matches',
    limit: 4
  });
  const { data: interests } = useGetReceivedInterestsQuery({ status: 'pending', limit: 5 });
  const { data: sentInterests } = useGetSentInterestsQuery({ limit: 1 });
  const { data: profileViews } = useGetProfileViewsQuery({ page: 1, limit: 1 });
  const { data: chats } = useGetChatListQuery();
  const { data: unreadCount } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  
  const [acceptInterest, { isLoading: isAccepting }] = useAcceptInterestMutation();
  const [declineInterest, { isLoading: isDeclining }] = useDeclineInterestMutation();

  const profileData = profile?.data;
  const membershipData = membership?.data;
  const isPremium = membershipData?.isPremium || false;
  const matchesData = newMatches?.data || [];
  const pendingInterests = interests?.data || [];
  const sentInterestsCount = sentInterests?.pagination?.total || 0;
  const totalProfileViews = profileViews?.pagination?.total || 0;
  const totalChats = chats?.data?.length || 0;
  const unreadMessages = unreadCount?.data?.unreadCount || 0;

  const handleAcceptInterest = async (e: React.MouseEvent, interestId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await acceptInterest(interestId).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Interest Accepted',
        message: 'You can now chat with this person!',
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed',
        message: err?.data?.message || 'Could not accept interest',
      }));
    }
  };

  const handleDeclineInterest = async (e: React.MouseEvent, interestId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await declineInterest(interestId).unwrap();
      dispatch(addToast({
        type: 'info',
        title: 'Interest Declined',
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed',
        message: err?.data?.message || 'Could not decline interest',
      }));
    }
  };

  // Quick Stats
  const stats = [
    // Profile Views - only show if premium, otherwise show warning
    isPremium ? {
      label: 'Profile Views', 
      value: totalProfileViews.toString(), 
      icon: Eye, 
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      isWarning: false
    } : {
      label: 'Profile Views', 
      value: 'Premium', 
      icon: Crown, 
      color: 'text-accent',
      bgColor: 'bg-accent-50',
      isWarning: true,
      warningMessage: 'Upgrade to see who viewed your profile'
    },
    { 
      label: 'Interests Received', 
      value: pendingInterests.length.toString(), 
      icon: Heart, 
      color: 'text-error',
      bgColor: 'bg-error/10',
      isWarning: false
    },
    { 
      label: 'Interest Sent', 
      value: sentInterestsCount.toString(), 
      icon: Heart, 
      color: 'text-success',
      bgColor: 'bg-success/10',
      isWarning: false
    },
    { 
      label: 'Messages', 
      value: unreadMessages > 0 ? `${unreadMessages}` : totalChats.toString(), 
      icon: MessageSquare, 
      color: 'text-accent',
      bgColor: 'bg-accent-50',
      isWarning: false
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 py-2"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text">
              Welcome back, {profileData?.firstName || 'User'} 👋
            </h1>
            <p className="text-text-secondary mt-1">
              Here's what's happening with your profile today
            </p>
          </div>
          {/* {!membershipData?.isPremium && (
            <Button variant="accent" asChild>
              <Link to="/membership">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Link>
            </Button>
          )} */}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className={`hover:shadow-md transition-shadow ${stat.isWarning ? 'border-accent/50' : ''}`}
            onClick={stat.isWarning ? () => navigate('/membership') : undefined}
            style={stat.isWarning ? { cursor: 'pointer' } : {}}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  {stat.isWarning ? (
                    <>
                      <p className="text-lg font-bold text-text mb-1">{stat.value}</p>
                      <p className="text-xs text-text-secondary leading-tight">{stat.warningMessage}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-text">{stat.value}</p>
                      <p className="text-sm text-text-muted">{stat.label}</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Profile Completion & Membership */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
        {/* Profile Completion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-text-secondary">Completeness</span>
                  <span className="text-sm font-semibold text-primary">
                    {profileData?.profileCompleteness || 0}%
                  </span>
                </div>
                <Progress value={profileData?.profileCompleteness || 0} />
              </div>
              <p className="text-sm text-text-secondary">
                Complete your profile to get more visibility and better matches
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/profile/edit">Complete Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Membership Status */}
        <Card className={membershipData?.isPremium ? 'border-accent' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className={`w-5 h-5 ${membershipData?.isPremium ? 'text-accent' : 'text-text-muted'}`} />
                Membership
              </CardTitle>
              {membershipData?.isPremium && (
                <Badge variant="gold">Premium</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {membershipData?.isPremium ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Plan</span>
                    <span className="font-medium capitalize">{membershipData.currentPlan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Expires</span>
                    <span className="font-medium">{formatDate(membershipData.expiresAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Contacts Used</span>
                    <span className="font-medium">
                      {membershipData.contactsUsed} / {membershipData.contactsAllowed}
                    </span>
                  </div>
                  <Progress 
                    value={(membershipData.contactsUsed / membershipData.contactsAllowed) * 100} 
                    className="h-2"
                  />
                </>
              ) : (
                <>
                  <p className="text-sm text-text-secondary">
                    Upgrade to premium to unlock unlimited messaging, view contacts, and more!
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/membership">View Plans</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* New Matches */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                New Matches
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/matches/new_matches" className="flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <ProfileCardSkeleton key={i} />
                ))}
              </div>
            ) : matchesData.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {matchesData.slice(0, 4).map((match: any) => (
                  <ProfileCard key={match.profileId} profile={match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">No new matches yet. Update your preferences!</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/profile/edit">Update Preferences</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Interests */}
      {pendingInterests.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-error" />
                  Pending Interests ({pendingInterests.length})
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/activity?tab=received" className="flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInterests.slice(0, 3).map((interest: any) => (
                  <div 
                    key={interest.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-champagne/50 hover:bg-champagne transition-colors cursor-pointer"
                    onClick={() => navigate(`/profile/${interest.profile?.profileId || interest.profileId}`)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="font-medium text-primary">
                          {(interest.profile?.lastName || interest.profile?.profileId || '?')?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text truncate">
                          {interest.profile?.lastName || interest.profile?.profileId || 'Unknown'}
                        </p>
                        <p className="text-sm text-text-muted truncate">
                          {interest.profile?.age && `${interest.profile.age} yrs`}
                          {interest.profile?.age && interest.profile?.city && ' • '}
                          {interest.profile?.city || ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/profile/${interest.profile?.profileId || interest.profileId}`);
                        }}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => handleDeclineInterest(e, interest.id)}
                        isLoading={isDeclining}
                        disabled={isAccepting || isDeclining}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={(e) => handleAcceptInterest(e, interest.id)}
                        isLoading={isAccepting}
                        disabled={isAccepting || isDeclining}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

