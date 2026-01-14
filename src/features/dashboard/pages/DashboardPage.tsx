import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  MessageSquare, 
  Eye, 
  Sparkles, 
  Crown,
  ChevronRight,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProfileCard } from '@/components/shared/ProfileCard';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useGetOwnProfileQuery, useGetProfileViewsQuery } from '@/store/api/profileApi';
import { useGetMatchesByCategoryQuery } from '@/store/api/matchApi';
import { useGetMembershipSummaryQuery } from '@/store/api/membershipApi';
import { useGetReceivedInterestsQuery } from '@/store/api/activityApi';
import { useGetChatListQuery, useGetUnreadCountQuery } from '@/store/api/chatApi';
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
  const user = useAppSelector(selectCurrentUser);
  const { data: profile, isLoading: profileLoading } = useGetOwnProfileQuery();
  const { data: membership } = useGetMembershipSummaryQuery();
  const { data: newMatches, isLoading: matchesLoading } = useGetMatchesByCategoryQuery({
    category: 'new_matches',
    limit: 4
  });
  const { data: interests } = useGetReceivedInterestsQuery({ status: 'pending', limit: 5 });
  const { data: profileViews } = useGetProfileViewsQuery({ page: 1, limit: 1 });
  const { data: chats } = useGetChatListQuery();
  const { data: unreadCount } = useGetUnreadCountQuery();

  const profileData = profile?.data;
  const membershipData = membership?.data;
  const matchesData = newMatches?.data || [];
  const pendingInterests = interests?.data || [];
  const totalProfileViews = profileViews?.pagination?.total || 0;
  const totalChats = chats?.data?.length || 0;
  const unreadMessages = unreadCount?.data?.unreadCount || 0;

  // Quick Stats
  const stats = [
    { 
      label: 'Profile Views', 
      value: totalProfileViews.toString(), 
      icon: Eye, 
      color: 'text-primary',
      bgColor: 'bg-primary-50'
    },
    { 
      label: 'Interests Received', 
      value: pendingInterests.length.toString(), 
      icon: Heart, 
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    { 
      label: 'Matches', 
      value: newMatches?.pagination?.total ? (newMatches.pagination.total > 50 ? '50+' : newMatches.pagination.total.toString()) : '0', 
      icon: Users, 
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      label: 'Messages', 
      value: unreadMessages > 0 ? `${unreadMessages}` : totalChats.toString(), 
      icon: MessageSquare, 
      color: 'text-accent',
      bgColor: 'bg-accent-50'
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
          {!membershipData?.isPremium && (
            <Button variant="accent" asChild>
              <Link to="/membership">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{stat.value}</p>
                  <p className="text-sm text-text-muted">{stat.label}</p>
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
                <Link to="/matches/new" className="flex items-center gap-1">
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
                  <Link to="/profile/preferences">Update Preferences</Link>
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
                    className="flex items-center justify-between p-3 rounded-xl bg-champagne/50 hover:bg-champagne transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {interest.profile.lastName?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-text">
                          {interest.profile.lastName}
                        </p>
                        <p className="text-sm text-text-muted">
                          {interest.profile.age} yrs • {interest.profile.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm">Accept</Button>
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

