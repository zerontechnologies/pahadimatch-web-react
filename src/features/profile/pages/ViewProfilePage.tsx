import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Heart, 
  MessageSquare, 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  GraduationCap, 
  CheckCircle2,
  Crown,
  Eye,
  Phone,
  Calendar,
  Ruler,
  Lock,
  User,
  Camera,
  Sparkles,
  TrendingUp,
  Info,
  Clock,
  X,
  Briefcase,
  Home,
  Users,
  Droplet,
  Scale,
  Smile,
  Coffee,
  Cigarette,
  Wine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { 
  useGetProfileQuery 
} from '@/store/api/profileApi';
import { 
  useSendInterestMutation, 
  useShortlistProfileMutation, 
  useRemoveFromShortlistMutation 
} from '@/store/api/activityApi';
import { useCheckCanChatQuery } from '@/store/api/chatApi';
import { useLazyGetKundaliMatchQuery } from '@/store/api/kundaliApi';
import { useGetMembershipSummaryQuery, useViewContactMutation } from '@/store/api/membershipApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { formatHeight, formatIncome, getInitials, capitalize } from '@/lib/utils';
import { PhotoGalleryModal } from '@/components/shared/PhotoGalleryModal';

export function ViewProfilePage() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: profileData, isLoading, error } = useGetProfileQuery(profileId!, {
    skip: !profileId,
  });
  
  const [sendInterest, { isLoading: isSendingInterest }] = useSendInterestMutation();
  const [shortlistProfile] = useShortlistProfileMutation();
  const [removeFromShortlist] = useRemoveFromShortlistMutation();
  const { data: canChatData } = useCheckCanChatQuery({ profileId: profileId! }, {
    skip: !profileId,
  });
  const { data: membershipData } = useGetMembershipSummaryQuery();
  const [getKundaliMatch, { data: kundaliMatchData, isLoading: isKundaliLoading }] = useLazyGetKundaliMatchQuery();
  const [viewContact, { isLoading: isViewingContact }] = useViewContactMutation();

  const profile = profileData?.data;
  const canChat = canChatData?.data?.allowed || false;
  const [localShortlisted, setLocalShortlisted] = useState(false);
  const [showKundaliMatch, setShowKundaliMatch] = useState(false);
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const isPremium = membershipData?.data?.isPremium || false;
  const kundaliMatch = kundaliMatchData?.data;
  const contactsRemaining = membershipData?.data?.contactsRemaining || 0;

  const handleSendInterest = async () => {
    if (!profileId) return;
    
    try {
      await sendInterest({ profileId }).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Interest Sent',
        message: 'Your interest has been sent successfully',
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to send interest',
      }));
    }
  };

  const handleShortlist = async () => {
    if (!profileId) return;
    
    try {
      if (localShortlisted) {
        await removeFromShortlist(profileId).unwrap();
        setLocalShortlisted(false);
        dispatch(addToast({
          type: 'success',
          title: 'Removed from Shortlist',
          message: 'Profile removed from your shortlist',
        }));
      } else {
        await shortlistProfile({ profileId }).unwrap();
        setLocalShortlisted(true);
        dispatch(addToast({
          type: 'success',
          title: 'Shortlisted',
          message: 'Profile added to your shortlist',
        }));
      }
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to update shortlist',
      }));
    }
  };

  const handleViewContact = async () => {
    if (!profileId) return;
    
    if (!isPremium) {
      dispatch(addToast({
        type: 'info',
        title: 'Premium Required',
        message: 'Premium membership required to view contact details',
      }));
      navigate('/membership');
      return;
    }

    if (contactsRemaining <= 0) {
      dispatch(addToast({
        type: 'error',
        title: 'Contact Limit Reached',
        message: 'You have used all your contact views. Please upgrade your plan.',
      }));
      navigate('/membership');
      return;
    }

    try {
      const result = await viewContact(profileId).unwrap();
      const responseData = result.data as any;
      dispatch(addToast({
        type: 'success',
        title: 'Contact Unlocked',
        message: responseData?.alreadyViewed 
          ? 'Contact already unlocked' 
          : `Contact unlocked! ${responseData?.contactsRemaining || contactsRemaining - 1} contacts remaining.`,
      }));
      // Refetch profile to get unlocked data
      window.location.reload(); // Simple refresh to get updated profile
    } catch (err: any) {
      if (err?.data?.error?.code === 'CONTACT_LIMIT_REACHED') {
        dispatch(addToast({
          type: 'error',
          title: 'Contact Limit Reached',
          message: 'You have used all your contact views. Please upgrade your plan.',
        }));
        navigate('/membership');
      } else if (err?.data?.error?.code === 'PREMIUM_REQUIRED') {
        dispatch(addToast({
          type: 'info',
          title: 'Premium Required',
          message: 'Premium membership required to view contact details',
        }));
        navigate('/membership');
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Error',
          message: err?.data?.message || 'Failed to view contact',
        }));
      }
    }
  };

  const handleViewKundaliMatch = async () => {
    if (!profileId) return;
    
    if (!isPremium) {
      dispatch(addToast({
        type: 'info',
        title: 'Premium Required',
        message: 'Kundali matching is available for premium members only',
      }));
      navigate('/membership');
      return;
    }

    try {
      await getKundaliMatch(profileId).unwrap();
      setShowKundaliMatch(true);
    } catch (err: any) {
      if (err?.data?.error?.code === 'PREMIUM_REQUIRED') {
        dispatch(addToast({
          type: 'info',
          title: 'Premium Required',
          message: 'Kundali matching requires premium membership',
        }));
        navigate('/membership');
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Error',
          message: err?.data?.message || 'Failed to get Kundali match',
        }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <EmptyState
        icon={Eye}
        title="Profile Not Found"
        description="This profile doesn't exist or you don't have permission to view it."
        action={{
          label: 'Go Back',
          onClick: () => navigate(-1),
        }}
      />
    );
  }

  // Check if premium is required
  if (profile.isPremiumRequired) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 py-2"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        </div>
        <Card className="border-accent">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 mx-auto bg-accent-50 rounded-full flex items-center justify-center">
                <Lock className="w-12 h-12 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-semibold text-text mb-2">
                  Premium Membership Required
                </h2>
                <p className="text-text-secondary mb-4">
                  {profile.message || 'Upgrade to premium to view full profile details'}
                </p>
                <div className="bg-champagne rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-text">
                    Profile ID: <span className="font-mono">{profile.profileId}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-text">Premium Benefits:</h3>
                  <ul className="text-sm text-text-secondary space-y-2 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      View full profile details
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      See contact information
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      Unlimited interests
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      Priority listing
                    </li>
                  </ul>
                </div>
                <Button
                  variant="accent"
                  size="lg"
                  className="mt-6"
                  onClick={() => navigate('/membership')}
                  leftIcon={<Crown className="w-5 h-5" />}
                >
                  View Membership Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const profilePhoto = profile.photos?.find((p: any) => p.isProfilePhoto) || profile.photos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleShortlist}
            leftIcon={localShortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          >
            {localShortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-primary-200 rounded-full">
                <AvatarImage src={profilePhoto?.url} alt={`${profile.firstName || ''} ${profile.lastName || ''}`} className="rounded-full object-cover" />
                <AvatarFallback className="text-3xl bg-primary-50 text-primary rounded-full">
                  {getInitials(profile.firstName || '', profile.lastName || '')}
                </AvatarFallback>
              </Avatar>
              {profile.isVerified && (
                <div className="flex items-center justify-center mt-2">
                  <Badge variant="success" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                {/* Name - Show if hasViewedContact or if name is available */}
                {(profile.requiresPremiumForName && !profile.hasViewedContact) || (!profile.firstName && !profile.lastName && !profile.hasViewedContact) ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-text-muted" />
                      <h2 className="text-2xl sm:text-3xl font-display font-semibold text-text">
                        Profile ID: {profile.profileId}
                      </h2>
                    </div>
                    {isPremium ? (
                      <div className="space-y-2">
                        <p className="text-sm text-text-secondary">
                          Use "View Contact" to see full name and contact details
                        </p>
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={handleViewContact}
                          isLoading={isViewingContact}
                          disabled={isViewingContact || contactsRemaining <= 0}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          View Contact & Name
                        </Button>
                        {contactsRemaining > 0 && (
                          <p className="text-xs text-text-muted">
                            {contactsRemaining} contacts remaining
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <Badge variant="gold" className="flex items-center gap-1 w-fit">
                          <Crown className="w-3 h-3" />
                          Premium Required to View Name
                        </Badge>
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => navigate('/membership')}
                          className="mt-2"
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          Upgrade to Premium
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-display font-semibold text-text">
                    {profile.firstName ? `${profile.firstName} ${profile.lastName}` : profile.lastName}
                  </h2>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-secondary">
                  {profile.age && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {profile.age} years</span>}
                  {profile.height && <span className="flex items-center gap-1"><Ruler className="w-4 h-4" /> {formatHeight(profile.height)}</span>}
                  {profile.city && profile.state && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {profile.city}, {profile.state}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                {profile.isConnected ? (
                  <Badge variant="success" className="px-4 py-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Connected
                  </Badge>
                ) : profile.alreadySentInterest ? (
                  <Badge variant={
                    profile.sentInterestStatus === 'accepted' ? 'success' :
                    profile.sentInterestStatus === 'declined' ? 'error' : 'outline'
                  } className="px-4 py-2 text-sm">
                    {profile.sentInterestStatus === 'accepted' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Connected
                      </>
                    ) : profile.sentInterestStatus === 'declined' ? (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Declined
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-1" />
                        Sent
                      </>
                    )}
                  </Badge>
                ) : (
                  <Button
                    onClick={handleSendInterest}
                    isLoading={isSendingInterest}
                    leftIcon={<Heart className="w-4 h-4" />}
                  >
                    Send Interest
                  </Button>
                )}
                {canChat && (
                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link to={`/chat/${profileId}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleViewKundaliMatch}
                  isLoading={isKundaliLoading}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  {showKundaliMatch ? 'Hide' : 'View'} Kundali Match
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted">Gender</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {capitalize(profile.gender || '')}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Date of Birth</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Age</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profile.age ? `${profile.age} years` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Height</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profile.height ? formatHeight(profile.height) : 'Not set'}
                  </p>
                </div>
                {profile.weight && (
                  <div>
                    <label className="text-xs text-text-muted">Weight</label>
                    <p className="text-sm font-medium text-text mt-1">{profile.weight} kg</p>
                  </div>
                )}
                {profile.bodyType && (
                  <div>
                    <label className="text-xs text-text-muted">Body Type</label>
                    <p className="text-sm font-medium text-text mt-1">{capitalize(profile.bodyType.replace('_', ' '))}</p>
                  </div>
                )}
                {profile.complexion && (
                  <div>
                    <label className="text-xs text-text-muted">Complexion</label>
                    <p className="text-sm font-medium text-text mt-1">{capitalize(profile.complexion.replace('_', ' '))}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-text-muted">Marital Status</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profile.maritalStatus ? capitalize(profile.maritalStatus.replace('_', ' ')) : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Religion</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {capitalize(profile.religion || '')}
                  </p>
                </div>
                {profile.caste && (
                  <div>
                    <label className="text-xs text-text-muted">Caste</label>
                    <p className="text-sm font-medium text-text mt-1">{capitalize(profile.caste)}</p>
                  </div>
                )}
                {profile.subCaste && (
                  <div>
                    <label className="text-xs text-text-muted">Sub Caste</label>
                    <p className="text-sm font-medium text-text mt-1">{profile.subCaste}</p>
                  </div>
                )}
                {profile.gothra && (
                  <div>
                    <label className="text-xs text-text-muted">Gothra</label>
                    <p className="text-sm font-medium text-text mt-1">{profile.gothra}</p>
                  </div>
                )}
                {profile.motherTongue && (
                  <div>
                    <label className="text-xs text-text-muted">Mother Tongue</label>
                    <p className="text-sm font-medium text-text mt-1">{profile.motherTongue}</p>
                  </div>
                )}
                {(profile.community || profile.origin) && (
                  <div>
                    <label className="text-xs text-text-muted">Community</label>
                    <p className="text-sm font-medium text-text mt-1">{capitalize(profile.community || profile.origin || '')}</p>
                  </div>
                )}
                {profile.accountCreatedBy && (
                  <div>
                    <label className="text-xs text-text-muted">Account Created By</label>
                    <p className="text-sm font-medium text-text mt-1">{capitalize(profile.accountCreatedBy)}</p>
                  </div>
                )}
                {profile.manglik && (
                  <div>
                    <label className="text-xs text-text-muted">Manglik</label>
                    <p className="text-sm font-medium text-text mt-1">{capitalize(profile.manglik.replace('_', ' '))}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education & Career */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education & Career
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted">Education</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profile.education ? capitalize(profile.education.replace('_', ' ')) : 'Not set'}
                  </p>
                </div>
                {profile.educationDetail && (
                  <div>
                    <label className="text-xs text-text-muted">Education Detail</label>
                    <p className="text-sm font-medium text-text mt-1">{profile.educationDetail}</p>
                  </div>
                )}
                {profile.college && (
                  <div>
                    <label className="text-xs text-text-muted">College</label>
                    <p className="text-sm font-medium text-text mt-1">{profile.college}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-text-muted">Occupation</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profile.occupation ? capitalize(profile.occupation.replace('_', ' ')) : 'Not set'}
                  </p>
                </div>
                {profile.occupationDetail && (
                  <div>
                    <label className="text-xs text-text-muted">Occupation Detail</label>
                    <p className="text-sm font-medium text-text mt-1">{profile.occupationDetail}</p>
                  </div>
                )}
                {profile.company && (
                  <div>
                    <label className="text-xs text-text-muted">Company</label>
                    <p className="text-sm font-medium text-text mt-1">{profile.company}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-text-muted">Annual Income</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {/* If hasViewedContact, show income regardless of privacy */}
                    {profile.hasViewedContact && profile.income ? (
                      formatIncome(profile.income)
                    ) : profile.incomeLocked ? (
                      <span className="flex items-center gap-1 text-text-muted">
                        <Lock className="w-3 h-3" />
                        Not disclosed
                      </span>
                    ) : profile.income ? (
                      formatIncome(profile.income)
                    ) : (
                      'Not disclosed'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted">City</label>
                  <p className="text-sm font-medium text-text mt-1">{profile.city || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">State</label>
                  <p className="text-sm font-medium text-text mt-1">{profile.state || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Country</label>
                  <p className="text-sm font-medium text-text mt-1">{profile.country || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family Information */}
          {(profile.familyType || profile.familyStatus || profile.fatherName || profile.motherName || profile.siblings !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  Family Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.familyType && (
                    <div>
                      <label className="text-xs text-text-muted">Family Type</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.familyType)}</p>
                    </div>
                  )}
                  {profile.familyStatus && (
                    <div>
                      <label className="text-xs text-text-muted">Family Status</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.familyStatus.replace('_', ' '))}</p>
                    </div>
                  )}
                  {profile.fatherName && (
                    <div>
                      <label className="text-xs text-text-muted">Father's Name</label>
                      <p className="text-sm font-medium text-text mt-1">{profile.fatherName}</p>
                    </div>
                  )}
                  {profile.fatherAlive && (
                    <div>
                      <label className="text-xs text-text-muted">Father's Status</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.fatherAlive)}</p>
                    </div>
                  )}
                  {profile.fatherEmploymentStatus && (
                    <div>
                      <label className="text-xs text-text-muted">Father's Employment</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.fatherEmploymentStatus.replace('_', ' '))}</p>
                    </div>
                  )}
                  {profile.fatherOccupation && (
                    <div>
                      <label className="text-xs text-text-muted">Father's Occupation</label>
                      <p className="text-sm font-medium text-text mt-1">{profile.fatherOccupation}</p>
                    </div>
                  )}
                  {profile.motherName && (
                    <div>
                      <label className="text-xs text-text-muted">Mother's Name</label>
                      <p className="text-sm font-medium text-text mt-1">{profile.motherName}</p>
                    </div>
                  )}
                  {profile.motherAlive && (
                    <div>
                      <label className="text-xs text-text-muted">Mother's Status</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.motherAlive)}</p>
                    </div>
                  )}
                  {profile.motherEmploymentStatus && (
                    <div>
                      <label className="text-xs text-text-muted">Mother's Employment</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.motherEmploymentStatus.replace('_', ' '))}</p>
                    </div>
                  )}
                  {profile.motherOccupation && (
                    <div>
                      <label className="text-xs text-text-muted">Mother's Occupation</label>
                      <p className="text-sm font-medium text-text mt-1">{profile.motherOccupation}</p>
                    </div>
                  )}
                  {profile.siblings !== undefined && (
                    <div>
                      <label className="text-xs text-text-muted">Siblings</label>
                      <p className="text-sm font-medium text-text mt-1">{profile.siblings}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lifestyle */}
          {(profile.diet || profile.smoking || profile.drinking) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-primary" />
                  Lifestyle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.diet && (
                    <div>
                      <label className="text-xs text-text-muted">Diet</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.diet.replace('_', ' '))}</p>
                    </div>
                  )}
                  {profile.smoking && (
                    <div>
                      <label className="text-xs text-text-muted">Smoking</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.smoking)}</p>
                    </div>
                  )}
                  {profile.drinking && (
                    <div>
                      <label className="text-xs text-text-muted">Drinking</label>
                      <p className="text-sm font-medium text-text mt-1">{capitalize(profile.drinking)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hobbies */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Hobbies & Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* About Me */}
          {profile.aboutMe && (
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                  {profile.aboutMe}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Photos */}
          {profile.photosLocked ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-champagne rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-sm font-medium text-text mb-2">Photos are Private</p>
                <p className="text-xs text-text-secondary mb-4">
                  Connect with this profile to view photos
                </p>
                {!canChat && (
                  <Button
                    size="sm"
                    onClick={handleSendInterest}
                    isLoading={isSendingInterest}
                    leftIcon={<Heart className="w-4 h-4" />}
                  >
                    Send Interest to View
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : profile.photos && profile.photos.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Photos ({profile.photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {profile.photos.map((photo: any, index: number) => (
                    <button
                      key={photo.url || index}
                      onClick={() => {
                        setSelectedPhotoIndex(index);
                        setPhotoGalleryOpen(true);
                      }}
                      className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* If hasViewedContact, show everything regardless of privacy settings */}
              {profile.hasViewedContact ? (
                <>
                  <div>
                    <label className="text-xs text-text-muted">Phone Number</label>
                    <p className="text-sm font-medium text-text mt-1">
                      {profile.phone || 'Not available'}
                    </p>
                  </div>
                  <Separator />
                  <p className="text-xs text-text-muted">
                    Contact information unlocked via View Contact.
                  </p>
                </>
              ) : profile.requiresPremiumForContact || profile.phoneLocked ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto bg-champagne rounded-full flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6 text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text mb-1">
                    {profile.requiresPremiumForContact ? 'Premium Required' : 'Contact is Private'}
                  </p>
                  <p className="text-xs text-text-secondary mb-4">
                    {profile.requiresPremiumForContact 
                      ? 'Upgrade to premium to view contact details'
                      : 'Connect with this profile to view contact details'}
                  </p>
                  {profile.requiresPremiumForContact && isPremium && !profile.hasViewedContact && (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={handleViewContact}
                      isLoading={isViewingContact}
                      disabled={isViewingContact || contactsRemaining <= 0}
                      leftIcon={<Phone className="w-4 h-4" />}
                    >
                      View Contact
                    </Button>
                  )}
                  {profile.requiresPremiumForContact && !isPremium && (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => navigate('/membership')}
                      leftIcon={<Crown className="w-4 h-4" />}
                    >
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-text-muted">Phone Number</label>
                    <p className="text-sm font-medium text-text mt-1">
                      {profile.phone || 'Not available'}
                    </p>
                  </div>
                  <Separator />
                  <p className="text-xs text-text-muted">
                    Contact information is visible to all users.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Kundali Match Score */}
      {showKundaliMatch && kundaliMatch && (
        <Card className="border-accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Kundali Match Score
                {!isPremium && (
                  <Badge variant="gold" className="ml-2">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent-50 to-primary-50 border border-accent-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-accent" />
                <span className="text-sm font-medium text-text-secondary">Overall Compatibility</span>
              </div>
              <div className="text-5xl font-display font-bold text-accent mb-2">
                {kundaliMatch.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-text-secondary">
                {kundaliMatch.totalScore} / {kundaliMatch.maxScore} Points
              </div>
              <div className="mt-4">
                <Badge variant={kundaliMatch.percentage >= 70 ? 'success' : kundaliMatch.percentage >= 50 ? 'warning' : 'error'} className="text-sm">
                  {kundaliMatch.conclusion}
                </Badge>
              </div>
            </div>

            {/* Detailed Scores */}
            <div>
              <h4 className="text-sm font-semibold text-text mb-4">Detailed Compatibility</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'varnaScore', label: 'Varna', icon: '👑' },
                  { key: 'vasyaScore', label: 'Vasya', icon: '💪' },
                  { key: 'taraScore', label: 'Tara', icon: '⭐' },
                  { key: 'yoniScore', label: 'Yoni', icon: '🦌' },
                  { key: 'grahaScore', label: 'Graha', icon: '🪐' },
                  { key: 'ganaScore', label: 'Gana', icon: '🧘' },
                  { key: 'bhakootScore', label: 'Bhakoot', icon: '💕' },
                  { key: 'nadiScore', label: 'Nadi', icon: '🌙' },
                ].map(({ key, label, icon }) => {
                  const score = kundaliMatch[key as keyof typeof kundaliMatch] as any;
                  if (!score) return null;
                  const percentage = (score.score / score.max) * 100;
                  
                  return (
                    <div key={key} className="p-4 rounded-lg border border-border bg-surface">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <span className="text-sm font-medium text-text">{label}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {score.score}/{score.max}
                        </span>
                      </div>
                      <div className="h-2 bg-champagne rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full transition-all ${
                            percentage >= 70 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-muted">{score.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manglik Compatibility */}
            {kundaliMatch.manglikCompatibility && (
              <div className="p-4 rounded-lg border border-border bg-surface">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-text">Manglik Compatibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={kundaliMatch.manglikCompatibility.compatible ? 'success' : 'error'}>
                    {kundaliMatch.manglikCompatibility.compatible ? 'Compatible' : 'Not Compatible'}
                  </Badge>
                  <span className="text-xs text-text-muted">
                    {kundaliMatch.manglikCompatibility.description}
                  </span>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {kundaliMatch.recommendations && kundaliMatch.recommendations.length > 0 && (
              <div className="p-4 rounded-lg border border-primary-200 bg-primary-50">
                <h4 className="text-sm font-semibold text-text mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {kundaliMatch.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photo Gallery Modal */}
      {profile.photos && profile.photos.length > 0 && (
        <PhotoGalleryModal
          photos={profile.photos}
          isOpen={photoGalleryOpen}
          onClose={() => setPhotoGalleryOpen(false)}
          initialIndex={selectedPhotoIndex}
        />
      )}
    </motion.div>
  );
}

