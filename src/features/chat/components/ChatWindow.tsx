import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MoreVertical, Info, Smile, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerificationBadge } from '@/components/shared/VerificationBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, getInitials } from '@/lib/utils';
import { useGetChatMessagesQuery, useSendMessageMutation, useMarkMessagesAsReadMutation, useGetChatListQuery, useGetPredefinedMessagesQuery } from '@/store/api/chatApi';
import { useBlockProfileMutation } from '@/store/api/activityApi';
import { useGetMembershipSummaryQuery } from '@/store/api/membershipApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import type { Chat, MessageType } from '@/types';

interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
  onChatCreated?: (chatId: string) => void;
}

export function ChatWindow({ chat, onBack, onChatCreated }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const [message, setMessage] = useState('');
  const [showPredefinedMessages, setShowPredefinedMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if this is a connection chat (no real chat ID yet)
  const isConnectionChat = chat.id.startsWith('connection-');
  const realChatId = isConnectionChat ? null : chat.id;
  
  const { data, refetch } = useGetChatMessagesQuery(
    { chatId: realChatId || '', limit: 50 },
    { skip: isConnectionChat } // Skip query for connection chats
  );
  const { refetch: refetchChatList } = useGetChatListQuery();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();
  const { data: membership } = useGetMembershipSummaryQuery();
  const { data: predefinedMessagesData, isLoading: isLoadingPredefined } = useGetPredefinedMessagesQuery();
  const [blockProfile, { isLoading: isBlocking }] = useBlockProfileMutation();
  
  // Get predefined messages from API, fallback to empty array
  const predefinedMessages = predefinedMessagesData?.data || [];
  
  // Check if user can send messages
  // Premium users can send custom messages to any chat they can see
  // Non-premium users can only send predefined messages to connections
  // The backend will validate permissions (connection, membership, etc.)
  const isPremium = membership?.data?.isPremium || false;
  // Having a chat (realChatId) or connection chat means they can see this conversation
  const hasChat = !!realChatId || isConnectionChat;
  // Premium users with any chat can send custom messages
  // Non-premium users can only send predefined messages (not custom)
  const canSendCustomMessages = isPremium && hasChat;
  // All users (premium or not) can send predefined messages to connections
  const canSendPredefinedMessages = hasChat; // Connections can always send predefined messages

  const messages = data?.data || [];

  const handleBlockUser = async () => {
    const profileId = chat?.participant?.profileId;
    if (!profileId) {
      dispatch(addToast({
        type: 'error',
        title: 'Unable to block',
        message: 'Profile not found for this chat',
      }));
      return;
    }
    try {
      await blockProfile({ profileId, reason: 'blocked_from_chat' }).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'User blocked',
        message: 'This user has been blocked.',
      }));
      await refetchChatList();
      onBack?.();
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Block failed',
        message: err?.data?.message || 'Could not block user',
      }));
    }
  };

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages.length, messages[messages.length - 1]?.id]);

  // Scroll to bottom on new messages (throttled for performance)
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [memoizedMessages]);

  // Mark as read when chat opens (only for real chats)
  useEffect(() => {
    if (!isConnectionChat && chat.unreadCount > 0 && realChatId) {
      markAsRead(realChatId);
    }
  }, [chat.id, chat.unreadCount, markAsRead, isConnectionChat, realChatId]);

  const handleSend = async (predefinedMessage?: string) => {
    const messageToSend = predefinedMessage || message.trim();
    if (!messageToSend) return;

    // Check if this is a predefined message
    // If predefinedMessage parameter is provided, it's definitely a predefined message
    // Otherwise, check if the typed message exactly matches a predefined message
    const isPredefinedMessage = predefinedMessage !== undefined || predefinedMessages.includes(messageToSend);
    const messageType: MessageType = isPredefinedMessage ? 'predefined' : 'custom';
    
    // If trying to send predefined message but not allowed (not connected), show error
    if (isPredefinedMessage && !canSendPredefinedMessages) {
      dispatch(addToast({
        type: 'error',
        title: 'Cannot Send Message',
        message: 'You must be connected to send messages.',
      }));
      return;
    }

    // If not premium and trying to send custom message (not predefined), show error
    if (!isPredefinedMessage && !canSendCustomMessages) {
      dispatch(addToast({
        type: 'error',
        title: 'Premium Required',
        message: 'Upgrade to premium to send custom messages. Use predefined messages instead.',
      }));
      setShowPredefinedMessages(true);
      return;
    }

    try {
      await sendMessage({
        profileId: chat.participant.profileId,
        data: { 
          content: messageToSend,
          messageType: messageType
        }
      }).unwrap();
      
      setMessage('');
      setShowPredefinedMessages(false);
      
      // If this was a connection chat, refresh chat list to get the new chat
      if (isConnectionChat) {
        // Wait a bit for the backend to create the chat
        setTimeout(async () => {
          const chatListResult = await refetchChatList();
          // Find the new chat by profileId
          const newChat = chatListResult.data?.data?.find(
            (c: Chat) => c.participant.profileId === chat.participant.profileId
          );
          if (newChat && onChatCreated) {
            onChatCreated(newChat.id);
          }
        }, 500);
      } else {
        // Refresh messages for existing chat
        refetch();
      }
      
      dispatch(addToast({
        type: 'success',
        title: 'Message sent',
        message: 'Your message has been sent successfully',
      }));
    } catch (err: any) {
      // Handle specific error codes from backend
      const errorCode = err?.data?.code || err?.data?.error?.code;
      const errorMessage = err?.data?.message || err?.data?.error?.details || 'Could not send message.';
      
      let title = 'Failed to send';
      let message = errorMessage;
      
      if (errorCode === 'PREMIUM_REQUIRED') {
        title = 'Premium Required';
        message = 'Upgrade to premium to send custom messages. You can send predefined messages instead.';
        setShowPredefinedMessages(true);
      } else if (errorCode === 'INTEREST_REQUIRED') {
        title = 'Connection Required';
        message = 'Both users must accept interest before chatting.';
      } else if (errorCode === 'INVALID_PREDEFINED_MESSAGE') {
        title = 'Invalid Message';
        message = 'Invalid predefined message. Please select from available options.';
      }
      
      dispatch(addToast({
        type: 'error',
        title,
        message,
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSendCustomMessages) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-champagne text-text-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={chat.participant.profilePhoto} />
            <AvatarFallback>
              {getInitials(chat.participant.firstName || '', chat.participant.lastName || '')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-text flex items-center gap-1">
              {chat.participant.hasViewedContact && chat.participant.firstName && chat.participant.lastName
                ? `${chat.participant.firstName} ${chat.participant.lastName}`
                : chat.participant.lastName || chat.participant.profileId}
              <VerificationBadge isVerified={chat.participant.isVerified} size="sm" />
            </h3>
            <p className="text-xs text-text-muted">
              {chat.participant.isOnline ? (
                <span className="text-success">Online</span>
              ) : (
                `ID: ${chat.participant.profileId}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/profile/${chat.participant.profileId}`)}>
                <Info className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-error" onClick={handleBlockUser} disabled={isBlocking}>
                <Shield className="w-4 h-4 mr-2" />
                {isBlocking ? 'Blocking...' : 'Block User'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-champagne/30">
        <div className="space-y-4">
          {isConnectionChat && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-text-secondary mb-2">Start a conversation</p>
                <p className="text-sm text-text-muted">Send a message to begin chatting</p>
              </div>
            </div>
          )}
          
          {!isConnectionChat && (
            <div className="flex items-center justify-center">
              <span className="px-3 py-1 text-xs text-text-muted bg-surface rounded-full">
                Today
              </span>
            </div>
          )}

          {messages.map((msg: any, index: number) => {
            const isOwn = msg.senderId === user?.id;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2.5',
                  isOwn
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-surface border border-border rounded-bl-sm'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className={cn(
                    'flex items-center justify-end gap-1 mt-1 text-xs',
                    isOwn ? 'text-white/70' : 'text-text-muted'
                  )}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    {isOwn && (
                      <span>
                        {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Predefined Messages Quick Replies (always show for connections) */}
      {canSendPredefinedMessages && predefinedMessages.length > 0 && !showPredefinedMessages && (
        <div className="px-4 pt-2 pb-1 border-t border-border bg-champagne/20">
          <p className="text-xs text-text-muted mb-2">Quick Messages:</p>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {predefinedMessages.slice(0, 4).map((msg, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => handleSend(msg)}
                disabled={isSending || isLoadingPredefined}
                className="text-xs whitespace-nowrap"
              >
                {msg}
              </Button>
            ))}
            {predefinedMessages.length > 4 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPredefinedMessages(true)}
                className="text-xs text-primary"
              >
                Show more...
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Predefined Messages Full List (when "Show more" is clicked) */}
      {canSendPredefinedMessages && showPredefinedMessages && (
        <div className="p-4 border-t border-border bg-champagne/30">
          <div className="space-y-2">
            <p className="text-xs text-text-muted mb-2">Select a predefined message:</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {isLoadingPredefined ? (
                <p className="text-xs text-text-muted">Loading messages...</p>
              ) : predefinedMessages.length > 0 ? (
                predefinedMessages.map((msg, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    onClick={() => handleSend(msg)}
                    disabled={isSending}
                    className="text-xs"
                  >
                    {msg}
                  </Button>
                ))
              ) : (
                <p className="text-xs text-text-muted">No predefined messages available</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPredefinedMessages(false)}
              className="text-xs text-text-muted"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-surface">
        {!canSendCustomMessages && canSendPredefinedMessages && !showPredefinedMessages && (
          <div className="mb-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-text-secondary text-center">
              Upgrade to premium to send custom messages. 
              <button
                onClick={() => setShowPredefinedMessages(true)}
                className="ml-1 text-primary hover:underline font-medium"
              >
                Use predefined messages
              </button>
            </p>
          </div>
        )}
        {!canSendPredefinedMessages && (
          <div className="mb-2 p-2 rounded-lg bg-error/10 border border-error/20">
            <p className="text-xs text-error text-center">
              You must be connected to send messages.
            </p>
          </div>
        )}
        <div className="flex items-end gap-2">
          {canSendCustomMessages && (
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <Smile className="w-5 h-5 text-text-muted" />
            </Button>
          )}
          {canSendCustomMessages ? (
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-champagne/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 max-h-32"
                style={{ minHeight: '44px' }}
              />
            </div>
          ) : canSendPredefinedMessages ? (
            <div className="flex-1">
              <button
                onClick={() => setShowPredefinedMessages(true)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-champagne/50 text-sm text-text-muted text-left hover:bg-champagne/70 transition-colors"
              >
                Select a predefined message...
              </button>
            </div>
          ) : (
            <div className="flex-1">
              <div className="w-full px-4 py-2.5 rounded-xl border border-border bg-champagne/30 text-sm text-text-muted text-center">
                Connect to send messages
              </div>
            </div>
          )}
          {canSendCustomMessages && (
            <Button
              onClick={() => handleSend()}
              disabled={!message.trim() || isSending}
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

