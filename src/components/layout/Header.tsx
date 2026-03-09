import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  Search, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  Crown,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, logout } from '@/store/slices/authSlice';
import { toggleMobileMenu, addToast } from '@/store/slices/uiSlice';
import { useGetUnreadCountQuery } from '@/store/api/chatApi';
import { useGetNotificationUnreadCountQuery } from '@/store/api/notificationApi';
import { useGetMembershipSummaryQuery } from '@/store/api/membershipApi';
import { useGetOwnProfileQuery } from '@/store/api/profileApi';
import { getInitials } from '@/lib/utils';

export function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { data: profile } = useGetOwnProfileQuery(undefined, { skip: !user });
  
  const { data: chatUnread } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const { data: notificationUnread } = useGetNotificationUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const { data: membership } = useGetMembershipSummaryQuery();

  const unreadMessages = chatUnread?.data?.unreadCount || 0;
  const unreadNotifications = notificationUnread?.data?.unreadCount || 0;
  const isPremium = membership?.data?.isPremium || false;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast({
      type: 'success',
      title: 'Logged Out',
      message: 'See you soon!',
    }));
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="lg:hidden p-2 rounded-lg hover:bg-champagne text-text-secondary"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src="/pahadi_match_logo_mobile.png" 
              alt="PahadiMatch" 
              className="h-8 w-auto lg:hidden object-contain"
            />
            <img 
              src="/pahadi_match_full.png" 
              alt="PahadiMatch" 
              className="h-10 w-auto hidden lg:block object-contain"
            />
          </Link>
        </div>

        {/* Center - Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by Profile ID..."
              className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-champagne/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    navigate(`/profile/${target.value.trim()}`);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Upgrade Button */}
          {!isPremium && (
            <Button
              variant="accent"
              size="sm"
              className="hidden sm:flex"
              onClick={() => navigate('/membership')}
              leftIcon={<Crown className="w-4 h-4" />}
            >
              Upgrade
            </Button>
          )}

          {/* Messages */}
          <Link to="/chat" className="relative p-2 rounded-lg hover:bg-champagne transition-colors">
            <MessageSquare className="w-5 h-5 text-text-secondary" />
            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-champagne transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center font-medium">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-champagne transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {profile?.data?.firstName && profile?.data?.lastName
                      ? getInitials(profile.data.firstName, profile.data.lastName)
                      : user?.profileId?.slice(0, 2) || 'PM'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">My Account</span>
                  <span className="text-xs text-text-muted font-normal">{user?.profileId}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/membership')}>
                <Crown className="w-4 h-4 mr-2" />
                Membership
                {isPremium && <Badge variant="gold" className="ml-auto">Premium</Badge>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-error focus:text-error">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

