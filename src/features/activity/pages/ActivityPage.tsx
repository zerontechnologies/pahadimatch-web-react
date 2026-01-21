import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, Bookmark, Ban, Check, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationBadge } from '@/components/shared/VerificationBadge';
import { 
  useGetReceivedInterestsQuery, 
  useGetSentInterestsQuery,
  useAcceptInterestMutation,
  useDeclineInterestMutation,
  useGetShortlistedProfilesQuery,
  useGetBlockedProfilesQuery,
  useUnblockProfileMutation,
  useGetConnectionsQuery,
  useGetInterestLimitQuery
} from '@/store/api/activityApi';
import { MessageSquare } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { formatTimeAgo, getInitials } from '@/lib/utils';

export function ActivityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'received';
  const dispatch = useAppDispatch();
  const [page, setPage] = useState<Record<string, number>>({
    received: 1,
    sent: 1,
    connections: 1,
    shortlisted: 1,
    blocked: 1,
  });

  const getCurrentPage = (tab: string) => page[tab] || 1;

  const { data: receivedData, isLoading: receivedLoading } = useGetReceivedInterestsQuery({ page: getCurrentPage('received'), limit: 20 });
  const { data: sentData, isLoading: sentLoading } = useGetSentInterestsQuery({ page: getCurrentPage('sent'), limit: 20 });
  const { data: shortlistedData, isLoading: shortlistedLoading } = useGetShortlistedProfilesQuery({ page: getCurrentPage('shortlisted'), limit: 20 });
  const { data: blockedData, isLoading: blockedLoading } = useGetBlockedProfilesQuery({ page: getCurrentPage('blocked'), limit: 20 });
  const { data: connectionsData, isLoading: connectionsLoading } = useGetConnectionsQuery({ page: getCurrentPage('connections'), limit: 20 });
  const { data: interestLimitData } = useGetInterestLimitQuery();

  const [acceptInterest] = useAcceptInterestMutation();
  const [declineInterest] = useDeclineInterestMutation();
  const [unblockProfile] = useUnblockProfileMutation();

  const handleAccept = async (interestId: string) => {
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

  const handleDecline = async (interestId: string) => {
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

  const handleUnblock = async (profileId: string) => {
    try {
      await unblockProfile(profileId).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Profile Unblocked',
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed',
        message: err?.data?.message || 'Could not unblock profile',
      }));
    }
  };

  const tabs = [
    { id: 'received', label: 'Received', icon: Heart, count: receivedData?.pagination?.total || receivedData?.data?.length || 0 },
    { id: 'sent', label: 'Sent', icon: Users, count: sentData?.pagination?.total || sentData?.data?.length || 0 },
    { id: 'connections', label: 'Connections', icon: MessageSquare, count: connectionsData?.pagination?.total || connectionsData?.data?.length || 0 },
    { id: 'shortlisted', label: 'Shortlisted', icon: Bookmark, count: shortlistedData?.pagination?.total || shortlistedData?.data?.length || 0 },
    { id: 'blocked', label: 'Blocked', icon: Ban, count: blockedData?.pagination?.total || blockedData?.data?.length || 0 },
  ];

  // Reset page when tab changes
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
    setPage({ ...page, [tab]: 1 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-2"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text">
            Activity Center
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your interests, connections, and blocked profiles
          </p>
        </div>
        {interestLimitData?.data && (
          <Badge variant="outline" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            {interestLimitData.data.dailyInterestRemaining === -1 || interestLimitData.data.dailyInterestRemaining === undefined
              ? 'Unlimited interests' 
              : `${interestLimitData.data.dailyInterestRemaining || 0} interests remaining today`}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Received Interests */}
        <TabsContent value="received">
          {receivedLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : (receivedData?.data?.length || 0) > 0 ? (
            <div className="space-y-4">
              {receivedData?.data?.map((interest: any) => (
                <Card key={interest.id} className="cursor-pointer hover:border-primary-200 transition-colors" onClick={() => window.location.href = `/profile/${interest.profile.profileId}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-14 h-14 rounded-full">
                          <AvatarImage src={interest.profile.profilePhoto} className="rounded-full object-cover" />
                          <AvatarFallback className="rounded-full">
                            {getInitials('', interest.profile.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-text flex items-center gap-1">
                            {interest.profile.lastName}
                            <VerificationBadge isVerified={interest.profile.isVerified} size="sm" />
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {interest.profile.age} yrs • {interest.profile.city}
                          </p>
                          {interest.message && (
                            <p className="text-sm text-text-muted mt-1 italic">
                              "{interest.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          interest.status === 'accepted' ? 'success' :
                          interest.status === 'declined' ? 'error' : 'outline'
                        }>
                          {interest.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {interest.status}
                        </Badge>
                        {interest.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleDecline(interest.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleAccept(interest.id)}>
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="No interests received"
              description="When someone expresses interest in your profile, it will appear here"
            />
          )}
          {/* Pagination */}
          {receivedData?.pagination && receivedData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={receivedData.pagination.page <= 1 || receivedLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (receivedData.pagination.page > 1) {
                    setPage({ ...page, received: getCurrentPage('received') - 1 });
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {receivedData.pagination.page} of {receivedData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={receivedData.pagination.page >= receivedData.pagination.totalPages || receivedLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (receivedData.pagination.page < receivedData.pagination.totalPages) {
                    setPage({ ...page, received: getCurrentPage('received') + 1 });
                  }
                }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Sent Interests */}
        <TabsContent value="sent">
          {sentLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : (sentData?.data?.length || 0) > 0 ? (
            <div className="space-y-4">
              {sentData?.data?.map((interest: any) => (
                <Card key={interest.id} className="cursor-pointer hover:border-primary-200 transition-colors" onClick={() => window.location.href = `/profile/${interest.profile.profileId}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-14 h-14 rounded-full">
                          <AvatarImage src={interest.profile.profilePhoto} className="rounded-full object-cover" />
                          <AvatarFallback className="rounded-full">
                            {getInitials('', interest.profile.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-text flex items-center gap-1">
                            {interest.profile.lastName}
                            <VerificationBadge isVerified={interest.profile.isVerified} size="sm" />
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {interest.profile.age} yrs • {interest.profile.city}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            Sent {formatTimeAgo(interest.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        interest.status === 'accepted' ? 'success' :
                        interest.status === 'declined' ? 'error' : 'outline'
                      }>
                        {interest.status === 'accepted' ? 'Connected' : 
                         interest.status === 'declined' ? 'Declined' : 'Pending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No interests sent"
              description="Express interest in profiles you like to start connecting"
            />
          )}
          {/* Pagination */}
          {sentData?.pagination && sentData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={sentData.pagination.page <= 1 || sentLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (sentData.pagination.page > 1) {
                    setPage({ ...page, sent: getCurrentPage('sent') - 1 });
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {sentData.pagination.page} of {sentData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={sentData.pagination.page >= sentData.pagination.totalPages || sentLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (sentData.pagination.page < sentData.pagination.totalPages) {
                    setPage({ ...page, sent: getCurrentPage('sent') + 1 });
                  }
                }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Connections */}
        <TabsContent value="connections">
          {connectionsLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : (connectionsData?.data?.length || 0) > 0 ? (
            <div className="space-y-4">
              {connectionsData?.data?.map((connection: any) => (
                <Card key={connection.profileId} className="cursor-pointer hover:border-primary-200 transition-colors" onClick={() => window.location.href = `/profile/${connection.profileId}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-14 h-14 rounded-full">
                          <AvatarImage src={connection.profilePhoto} className="rounded-full object-cover" />
                          <AvatarFallback className="rounded-full">
                            {getInitials('', connection.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-text flex items-center gap-1">
                              {connection.lastName}
                              <VerificationBadge isVerified={connection.isVerified} size="sm" />
                            </h3>
                            <Badge variant="success" className="text-xs">Connected</Badge>
                          </div>
                          <p className="text-sm text-text-secondary">
                            {connection.age} yrs • {connection.city}
                            {connection.state && `, ${connection.state}`}
                          </p>
                          {connection.education && (
                            <p className="text-xs text-text-muted mt-1">
                              {connection.education} • {connection.occupation}
                            </p>
                          )}
                          <p className="text-xs text-text-muted mt-1">
                            Connected {formatTimeAgo(connection.connectedAt)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/chat?profileId=${connection.profileId}`;
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {connection.canMessage ? 'Message' : 'View Profile'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No connections yet"
              description="Accept interests to start connecting with people"
            />
          )}
          {/* Pagination */}
          {connectionsData?.pagination && connectionsData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={connectionsData.pagination.page <= 1 || connectionsLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (connectionsData.pagination.page > 1) {
                    setPage({ ...page, connections: getCurrentPage('connections') - 1 });
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {connectionsData.pagination.page} of {connectionsData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={connectionsData.pagination.page >= connectionsData.pagination.totalPages || connectionsLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (connectionsData.pagination.page < connectionsData.pagination.totalPages) {
                    setPage({ ...page, connections: getCurrentPage('connections') + 1 });
                  }
                }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Shortlisted */}
        <TabsContent value="shortlisted">
          {shortlistedLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : (shortlistedData?.data?.length || 0) > 0 ? (
            <div className="space-y-4">
              {shortlistedData?.data?.map((profile: any) => (
                <Card key={profile.id} className="cursor-pointer hover:border-primary-200 transition-colors" onClick={() => window.location.href = `/profile/${profile.profileId}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-14 h-14 rounded-full">
                          <AvatarImage src={profile.profilePhoto} className="rounded-full object-cover" />
                          <AvatarFallback className="rounded-full">
                            {getInitials('', profile.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-text flex items-center gap-1">
                            {profile.lastName}
                            <VerificationBadge isVerified={profile.isVerified} size="sm" />
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {profile.age} yrs • {profile.city}
                          </p>
                          {profile.note && (
                            <p className="text-sm text-text-muted mt-1">
                              Note: {profile.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/profile/${profile.profileId}`;
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bookmark}
              title="No profile shortlisted"
              description="Shortlist profiles you like to find them here quickly"
            />
          )}
          {/* Pagination */}
          {shortlistedData?.pagination && shortlistedData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={shortlistedData.pagination.page <= 1 || shortlistedLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (shortlistedData.pagination.page > 1) {
                    setPage({ ...page, shortlisted: getCurrentPage('shortlisted') - 1 });
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {shortlistedData.pagination.page} of {shortlistedData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={shortlistedData.pagination.page >= shortlistedData.pagination.totalPages || shortlistedLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (shortlistedData.pagination.page < shortlistedData.pagination.totalPages) {
                    setPage({ ...page, shortlisted: getCurrentPage('shortlisted') + 1 });
                  }
                }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Blocked */}
        <TabsContent value="blocked">
          {blockedLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : (blockedData?.data?.length || 0) > 0 ? (
            <div className="space-y-4">
              {blockedData?.data?.map((profile: any) => (
                <Card key={profile.profileId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback>
                            {getInitials('', profile.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-text flex items-center gap-1">
                            {profile.lastName}
                            <VerificationBadge isVerified={profile.isVerified} size="sm" />
                          </h3>
                          <p className="text-xs text-text-muted">
                            Blocked {formatTimeAgo(profile.blockedAt)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUnblock(profile.profileId)}
                      >
                        Unblock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Ban}
              title="No blocked profiles"
              description="Profiles you block will appear here"
            />
          )}
          {/* Pagination */}
          {blockedData?.pagination && blockedData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={blockedData.pagination.page <= 1 || blockedLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (blockedData.pagination.page > 1) {
                    setPage({ ...page, blocked: getCurrentPage('blocked') - 1 });
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {blockedData.pagination.page} of {blockedData.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={blockedData.pagination.page >= blockedData.pagination.totalPages || blockedLoading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (blockedData.pagination.page < blockedData.pagination.totalPages) {
                    setPage({ ...page, blocked: getCurrentPage('blocked') + 1 });
                  }
                }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

