import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  Heart, 
  MessageSquare, 
  Eye, 
  User,
  X,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation
} from '@/store/api/notificationApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { formatTimeAgo, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

const NOTIFICATION_ICONS: Record<string, any> = {
  interest_received: Heart,
  interest_accepted: CheckCircle2,
  message: MessageSquare,
  profile_view: Eye,
  match: User,
};

export function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  const dispatch = useAppDispatch();

  const { data, isLoading } = useGetNotificationsQuery({
    page: 1,
    limit: 50,
    unreadOnly: activeTab === 'unread',
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  const allNotifications = notifications;
  const unreadNotifications = notifications.filter((n: any) => !n.isRead);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId).unwrap();
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to mark notification as read',
      }));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'All Read',
        message: 'All notifications marked as read',
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to mark all as read',
      }));
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Deleted',
        message: 'Notification deleted',
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to delete notification',
      }));
    }
  };

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case 'interest_received':
      case 'interest_accepted':
        return `/activity?tab=received`;
      case 'message':
        return notification.metadata?.profileId ? `/chat/${notification.metadata.profileId}` : '/chat';
      case 'profile_view':
        return `/activity?tab=views`;
      case 'match':
        return notification.metadata?.profileId ? `/profile/${notification.metadata.profileId}` : '/matches';
      default:
        return null;
    }
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
          <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notifications
          </h1>
          <p className="text-text-secondary mt-1">
            Stay updated with your account activity
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {allNotifications.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {allNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="error" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : allNotifications.length > 0 ? (
            <div className="space-y-3">
              {allNotifications.map((notification: any) => {
                const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
                const link = getNotificationLink(notification);

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={cn(
                      'hover:shadow-md transition-all',
                      !notification.isRead && 'border-primary-200 bg-primary-50/30'
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                            !notification.isRead 
                              ? 'bg-primary-100 text-primary' 
                              : 'bg-champagne text-text-muted'
                          )}>
                            <IconComponent className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className={cn(
                                  'text-sm font-medium',
                                  !notification.isRead ? 'text-text' : 'text-text-secondary'
                                )}>
                                  {notification.title}
                                </p>
                                {notification.message && (
                                  <p className="text-xs text-text-muted mt-1">
                                    {notification.message}
                                  </p>
                                )}
                                <p className="text-xs text-text-muted mt-2">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(notification.id)}
                                  className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {link && (
                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <Link to={link}>
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No Notifications"
              description="You're all caught up! No notifications to display."
            />
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : unreadNotifications.length > 0 ? (
            <div className="space-y-3">
              {unreadNotifications.map((notification: any) => {
                const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
                const link = getNotificationLink(notification);

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-primary-200 bg-primary-50/30 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-text">
                                  {notification.title}
                                </p>
                                {notification.message && (
                                  <p className="text-xs text-text-muted mt-1">
                                    {notification.message}
                                  </p>
                                )}
                                <p className="text-xs text-text-muted mt-2">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(notification.id)}
                                  className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {link && (
                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <Link to={link}>
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="All Caught Up!"
              description="You have no unread notifications."
            />
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

