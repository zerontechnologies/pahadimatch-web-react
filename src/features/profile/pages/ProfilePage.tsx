import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Edit, 
  Camera, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Heart,
  Shield,
  Eye,
  Settings,
  CheckCircle2,
  XCircle,
  Calendar,
  Ruler,
  Users as UsersIcon,
  Home,
  UtensilsCrossed,
  Sparkles,
  Moon,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useGetOwnProfileQuery } from '@/store/api/profileApi';
import { useGetMyPhotosQuery } from '@/store/api/photoApi';
import { useGetKundaliQuery } from '@/store/api/kundaliApi';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatHeight, formatIncome, getInitials, capitalize } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';
import { ImageIcon } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useGetOwnProfileQuery();
  const { data: photosData } = useGetMyPhotosQuery();
  const { data: kundaliData } = useGetKundaliQuery();
  
  const profileData = profile?.data;
  const photos = photosData?.data || [];
  const profilePhoto = photos.find((p) => p.isProfilePhoto) || photos[0];
  const kundali = kundaliData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 py-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <EmptyState
        icon={User}
        title="Profile Not Found"
        description="Unable to load your profile. Please try again."
        action={{
          label: 'Go to Dashboard',
          onClick: () => navigate('/dashboard'),
        }}
      />
    );
  }

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = profileData.dateOfBirth ? calculateAge(profileData.dateOfBirth) : profileData.age;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-2"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            My Profile
          </h1>
          <p className="text-text-secondary mt-1">
            View and manage your profile information
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/photos">
              <Camera className="w-4 h-4 mr-2" />
              Manage Photos
            </Link>
          </Button>
          <Button asChild>
            <Link to="/profile/edit">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-primary-200">
                <AvatarImage src={profilePhoto?.url} alt={`${profileData.firstName} ${profileData.lastName}`} />
                <AvatarFallback className="text-3xl bg-primary-50 text-primary">
                  {getInitials(profileData.firstName, profileData.lastName)}
                </AvatarFallback>
              </Avatar>
              {profileData.isVerified && (
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
                <h2 className="text-2xl sm:text-3xl font-display font-semibold text-text">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-secondary">
                  {age && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {age} years</span>}
                  {profileData.height && <span className="flex items-center gap-1"><Ruler className="w-4 h-4" /> {formatHeight(profileData.height)}</span>}
                  {profileData.city && profileData.state && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {profileData.city}, {profileData.state}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Completeness */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-secondary">Profile Completeness</span>
                  <span className="text-sm font-semibold text-primary">
                    {profileData.profileCompleteness || 0}%
                  </span>
                </div>
                <Progress value={profileData.profileCompleteness || 0} className="h-2" />
                {profileData.profileCompleteness && profileData.profileCompleteness < 100 && (
                  <p className="text-xs text-text-muted mt-2">
                    Complete your profile to get more visibility
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/profile/edit">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/photos">
                    <Camera className="w-4 h-4 mr-2" />
                    Photos ({photos.length})
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
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
                    {capitalize(profileData.gender || '')}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Date of Birth</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profileData.dateOfBirth ? formatDate(profileData.dateOfBirth) : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Marital Status</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profileData.maritalStatus ? capitalize(profileData.maritalStatus.replace('_', ' ')) : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Religion</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {capitalize(profileData.religion || '')}
                  </p>
                </div>
                {profileData.caste && (
                  <div>
                    <label className="text-xs text-text-muted">Caste</label>
                    <p className="text-sm font-medium text-text mt-1">{profileData.caste}</p>
                  </div>
                )}
                {profileData.motherTongue && (
                  <div>
                    <label className="text-xs text-text-muted">Mother Tongue</label>
                    <p className="text-sm font-medium text-text mt-1">{profileData.motherTongue}</p>
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
                    {profileData.education ? capitalize(profileData.education.replace('_', ' ')) : 'Not set'}
                  </p>
                  {profileData.educationDetail && (
                    <p className="text-xs text-text-secondary mt-1">{profileData.educationDetail}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-text-muted">Occupation</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profileData.occupation ? capitalize(profileData.occupation.replace('_', ' ')) : 'Not set'}
                  </p>
                  {profileData.occupationDetail && (
                    <p className="text-xs text-text-secondary mt-1">{profileData.occupationDetail}</p>
                  )}
                </div>
                {profileData.company && (
                  <div>
                    <label className="text-xs text-text-muted">Company</label>
                    <p className="text-sm font-medium text-text mt-1">{profileData.company}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-text-muted">Annual Income</label>
                  <p className="text-sm font-medium text-text mt-1">
                    {profileData.income ? formatIncome(profileData.income) : 'Not disclosed'}
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
                  <p className="text-sm font-medium text-text mt-1">{profileData.city || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">State</label>
                  <p className="text-sm font-medium text-text mt-1">{profileData.state || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Country</label>
                  <p className="text-sm font-medium text-text mt-1">{profileData.country || 'India'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family & Lifestyle */}
          {(profileData.familyType || profileData.diet || profileData.smoking || profileData.drinking) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  Family & Lifestyle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {profileData.familyType && (
                    <div>
                      <label className="text-xs text-text-muted">Family Type</label>
                      <p className="text-sm font-medium text-text mt-1">
                        {capitalize(profileData.familyType.replace('_', ' '))}
                      </p>
                    </div>
                  )}
                  {profileData.diet && (
                    <div>
                      <label className="text-xs text-text-muted">Diet</label>
                      <p className="text-sm font-medium text-text mt-1">
                        {capitalize(profileData.diet.replace('_', ' '))}
                      </p>
                    </div>
                  )}
                  {profileData.smoking && (
                    <div>
                      <label className="text-xs text-text-muted">Smoking</label>
                      <p className="text-sm font-medium text-text mt-1">
                        {capitalize(profileData.smoking)}
                      </p>
                    </div>
                  )}
                  {profileData.drinking && (
                    <div>
                      <label className="text-xs text-text-muted">Drinking</label>
                      <p className="text-sm font-medium text-text mt-1">
                        {capitalize(profileData.drinking)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* About Me */}
          {profileData.aboutMe && (
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                  {profileData.aboutMe}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Photos Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Photos
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/photos">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 6).map((photo) => (
                    <Link
                      key={photo.id || `photo-${Math.random()}`}
                      to="/photos"
                      className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = '/photos';
                      }}
                    >
                      <img
                        src={photo.url}
                        alt="Profile photo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary mb-4">No photos yet</p>
                  <Button size="sm" asChild>
                    <Link to="/photos">Upload Photos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kundali Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Kundali Details
                </CardTitle>
                {!kundali && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/kundali/create">
                      Add Kundali
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {kundali ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-text-muted">Rashi (Moon Sign)</label>
                      <p className="text-sm font-medium text-text mt-1">{kundali.rashi || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Nakshatra</label>
                      <p className="text-sm font-medium text-text mt-1">{kundali.nakshatra || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Nadi</label>
                      <p className="text-sm font-medium text-text mt-1">{kundali.nadi || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Gana</label>
                      <p className="text-sm font-medium text-text mt-1">{kundali.gana || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Manglik Status</label>
                      <p className="text-sm font-medium text-text mt-1">
                        {kundali.manglikStatus || 'Not set'}
                        {kundali.manglikPercentage !== undefined && kundali.manglikPercentage > 0 && (
                          <span className="text-xs text-text-muted ml-2">
                            ({kundali.manglikPercentage}%)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted">Place of Birth</label>
                      <p className="text-sm font-medium text-text mt-1">{kundali.placeOfBirth || 'Not set'}</p>
                    </div>
                  </div>
                  <Separator />
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/kundali">
                      View Full Kundali
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Moon className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-secondary mb-4">
                    Add your Kundali details for better match compatibility
                  </p>
                  <Button asChild>
                    <Link to="/kundali/create">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Kundali
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Phone Number</span>
                <Badge variant={profileData.privacySettings?.phonePrivate ? 'outline' : 'success'}>
                  {profileData.privacySettings?.phonePrivate ? 'Private' : 'Visible'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Photos</span>
                <Badge variant={profileData.privacySettings?.photosPrivate ? 'outline' : 'success'}>
                  {profileData.privacySettings?.photosPrivate ? 'Private' : 'Visible'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Income</span>
                <Badge variant={profileData.privacySettings?.incomePrivate ? 'outline' : 'success'}>
                  {profileData.privacySettings?.incomePrivate ? 'Private' : 'Visible'}
                </Badge>
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/settings?tab=privacy">
                  Manage Privacy
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Profile Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Last Active</span>
                <span className="font-medium text-text">
                  {profileData.lastActive ? formatDate(profileData.lastActive) : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Profile ID</span>
                <span className="font-mono text-xs text-text-muted">
                  {profileData.profileId || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

