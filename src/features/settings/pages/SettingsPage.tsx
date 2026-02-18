import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Phone, 
  Key,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetOwnProfileQuery, useUpdatePrivacyMutation, useUpdateNotificationSettingsMutation } from '@/store/api/profileApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, updateUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useChangePhoneMutation, useVerifyPhoneChangeMutation } from '@/store/api/authApi';

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { data: profile } = useGetOwnProfileQuery();
  const [updatePrivacy, { isLoading: isUpdatingPrivacy }] = useUpdatePrivacyMutation();
  const [updateNotificationSettings, { isLoading: isUpdatingNotifications }] = useUpdateNotificationSettingsMutation();
  const [changePhone, { isLoading: isSendingPhoneOtp }] = useChangePhoneMutation();
  const [verifyPhoneChange, { isLoading: isVerifyingPhone }] = useVerifyPhoneChangeMutation();

  const profileData = profile?.data;
  const privacySettings = profileData?.privacySettings || {
    phonePrivate: false,
    photosPrivate: false,
    incomePrivate: false,
  };

  const notificationSettings = profileData?.notificationSettings || {
    email: true,
    matches: true,
    interests: true,
    messages: true,
    profileViews: false,
    shortlist: true,
  };

  const [privacy, setPrivacy] = useState(privacySettings);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'enter' | 'verify'>('enter');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [phoneOtp, setPhoneOtp] = useState('');

  // Sync settings when profile data changes
  useEffect(() => {
    if (profileData?.privacySettings) {
      setPrivacy(profileData.privacySettings);
    }
    if (profileData?.notificationSettings) {
      setNotifications(profileData.notificationSettings);
    }
  }, [profileData]);

  const resetPhoneDialog = () => {
    setPhoneStep('enter');
    setNewPhone(user?.phone || '');
    setPhoneOtp('');
  };

  const handlePrivacyChange = async (field: keyof typeof privacy, value: boolean) => {
    const updatedPrivacy = { ...privacy, [field]: value };
    setPrivacy(updatedPrivacy);

    try {
      await updatePrivacy(updatedPrivacy).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Privacy Updated',
        message: 'Your privacy settings have been saved successfully',
      }));
    } catch (err: any) {
      // Revert on error
      setPrivacy(privacy);
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to update privacy settings',
      }));
    }
  };

  const handleNotificationChange = async (field: keyof typeof notifications, value: boolean) => {
    const updatedNotifications = { ...notifications, [field]: value };
    setNotifications(updatedNotifications);

    try {
      await updateNotificationSettings(updatedNotifications).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Notifications Updated',
        message: 'Your notification preferences have been saved successfully',
      }));
    } catch (err: any) {
      // Revert on error
      setNotifications(notifications);
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to update notification settings',
      }));
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!newPhone) {
      dispatch(addToast({
        type: 'error',
        title: 'Invalid Phone',
        message: 'Please enter a valid phone number',
      }));
      return;
    }

    try {
      await changePhone({ newPhone }).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'OTP Sent',
        message: 'We have sent an OTP to your new phone number',
      }));
      setPhoneStep('verify');
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to send OTP. Please try again.',
      }));
    }
  };

  const handleVerifyPhoneChange = async () => {
    if (!phoneOtp) {
      dispatch(addToast({
        type: 'error',
        title: 'Invalid OTP',
        message: 'Please enter the OTP sent to your new phone number',
      }));
      return;
    }

    try {
      await verifyPhoneChange({ newPhone, otp: phoneOtp }).unwrap();
      dispatch(updateUser({ phone: newPhone }));
      dispatch(addToast({
        type: 'success',
        title: 'Phone Updated',
        message: 'Your phone number has been updated successfully',
      }));
      setIsPhoneDialogOpen(false);
      resetPhoneDialog();
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to verify OTP. Please try again.',
      }));
    }
  };

  const handleEmailChangeClick = () => {
    dispatch(addToast({
      type: 'info',
      title: 'Coming Soon',
      message: 'Email change functionality is not available yet.',
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-2"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="privacy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-text-secondary" />
                    <label className="text-sm font-medium">Hide Phone Number</label>
                  </div>
                  <p className="text-xs text-text-muted">
                    Only show phone number to accepted connections
                  </p>
                </div>
                <Switch
                  checked={privacy.phonePrivate}
                  onCheckedChange={(checked) => handlePrivacyChange('phonePrivate', checked)}
                  disabled={isUpdatingPrivacy}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-text-secondary" />
                    <label className="text-sm font-medium">Hide Photos</label>
                  </div>
                  <p className="text-xs text-text-muted">
                    Only show photos to accepted connections
                  </p>
                </div>
                <Switch
                  checked={privacy.photosPrivate}
                  onCheckedChange={(checked) => handlePrivacyChange('photosPrivate', checked)}
                  disabled={isUpdatingPrivacy}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-text-secondary" />
                    <label className="text-sm font-medium">Hide Income</label>
                  </div>
                  <p className="text-xs text-text-muted">
                    Keep your income information private
                  </p>
                </div>
                <Switch
                  checked={privacy.incomePrivate}
                  onCheckedChange={(checked) => handlePrivacyChange('incomePrivate', checked)}
                  disabled={isUpdatingPrivacy}
                />
              </div>

              <Separator />

            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Account Information
              </CardTitle>
              <CardDescription>
                View and manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Phone Number</label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={user?.phone || 'Not set'}
                    disabled
                    className="bg-champagne"
                  />
                  <Dialog
                    open={isPhoneDialogOpen}
                    onOpenChange={(open) => {
                      setIsPhoneDialogOpen(open);
                      if (!open) {
                        resetPhoneDialog();
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Phone Number</DialogTitle>
                        <DialogDescription>
                          Update your phone number. We&apos;ll send an OTP to your new number for verification.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div>
                          <label className="text-sm font-medium text-text-secondary">Current Phone</label>
                          <Input
                            value={user?.phone || 'Not set'}
                            disabled
                            className="bg-champagne mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-secondary">New Phone Number</label>
                          <Input
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            className="mt-1"
                            disabled={phoneStep === 'verify' || isSendingPhoneOtp || isVerifyingPhone}
                            placeholder="Enter new phone number"
                          />
                        </div>
                        {phoneStep === 'verify' && (
                          <div>
                            <label className="text-sm font-medium text-text-secondary">OTP</label>
                            <Input
                              value={phoneOtp}
                              onChange={(e) => setPhoneOtp(e.target.value)}
                              className="mt-1"
                              placeholder="Enter OTP sent to your new phone"
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        {phoneStep === 'enter' ? (
                          <Button
                            onClick={handleSendPhoneOtp}
                            disabled={isSendingPhoneOtp}
                          >
                            {isSendingPhoneOtp ? 'Sending OTP...' : 'Send OTP'}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleVerifyPhoneChange}
                            disabled={isVerifyingPhone}
                          >
                            {isVerifyingPhone ? 'Verifying...' : 'Verify & Update'}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* <div>
                { <label className="text-sm font-medium text-text-secondary">Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value="Not available"
                    disabled
                    className="bg-champagne"
                  />
                  <Button variant="outline" size="sm" onClick={handleEmailChangeClick}>
                    Change
                  </Button>
                </div> }
              </div> */}

              {/* <Separator /> */}

              {/* <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text">Account Deletion</p>
                    <p className="text-xs text-text-muted mt-1">
                      Deleting your account will permanently remove all your data. This action cannot be undone.
                    </p>
                    <Button variant="danger" size="sm" className="mt-3">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-xs text-text-muted">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  disabled={isUpdatingNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">New Matches</label>
                  <p className="text-xs text-text-muted">
                    Get notified when new matches are found
                  </p>
                </div>
                <Switch 
                  checked={notifications.matches} 
                  onCheckedChange={(checked) => handleNotificationChange('matches', checked)}
                  disabled={isUpdatingNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Interest Received</label>
                  <p className="text-xs text-text-muted">
                    Notify when someone shows interest
                  </p>
                </div>
                <Switch 
                  checked={notifications.interests} 
                  onCheckedChange={(checked) => handleNotificationChange('interests', checked)}
                  disabled={isUpdatingNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Messages</label>
                  <p className="text-xs text-text-muted">
                    Get notified of new messages
                  </p>
                </div>
                <Switch 
                  checked={notifications.messages} 
                  onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                  disabled={isUpdatingNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Profile Views</label>
                  <p className="text-xs text-text-muted">
                    Notify when someone views your profile
                  </p>
                </div>
                <Switch 
                  checked={notifications.profileViews} 
                  onCheckedChange={(checked) => handleNotificationChange('profileViews', checked)}
                  disabled={isUpdatingNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Shortlisted</label>
                  <p className="text-xs text-text-muted">
                    Notify when someone shortlists your profile
                  </p>
                </div>
                <Switch 
                  checked={notifications.shortlist} 
                  onCheckedChange={(checked) => handleNotificationChange('shortlist', checked)}
                  disabled={isUpdatingNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

