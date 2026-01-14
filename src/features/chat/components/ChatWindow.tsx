import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MoreVertical, Phone, Video, Info, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { useGetChatMessagesQuery, useSendMessageMutation, useMarkMessagesAsReadMutation, useGetChatListQuery } from '@/store/api/chatApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import type { Chat } from '@/types';

interface ChatWindowProps {
  chat: Chat;
  onBack: () => void;
  onChatCreated?: (chatId: string) => void;
}

export function ChatWindow({ chat, onBack, onChatCreated }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Check if this is a connection chat (no real chat ID yet)
  const isConnectionChat = chat.id.startsWith('connection-');
  const realChatId = isConnectionChat ? null : chat.id;
  
  const { data, isLoading, refetch } = useGetChatMessagesQuery(
    { chatId: realChatId || '', limit: 50 },
    { skip: isConnectionChat } // Skip query for connection chats
  );
  const { refetch: refetchChatList } = useGetChatListQuery();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  const messages = data?.data || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read when chat opens (only for real chats)
  useEffect(() => {
    if (!isConnectionChat && chat.unreadCount > 0 && realChatId) {
      markAsRead(realChatId);
    }
  }, [chat.id, chat.unreadCount, markAsRead, isConnectionChat, realChatId]);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const result = await sendMessage({
        profileId: chat.participant.profileId,
        data: { content: message.trim() }
      }).unwrap();
      
      setMessage('');
      
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
      dispatch(addToast({
        type: 'error',
        title: 'Failed to send',
        message: err?.data?.message || 'Could not send message. Make sure you are connected and have premium membership.',
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
            <h3 className="font-semibold text-text">
              {chat.participant.firstName || ''} {chat.participant.lastName || 'Unknown'}
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
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Video className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-error">
                Block User
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

      {/* Input */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Smile className="w-5 h-5 text-text-muted" />
          </Button>
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
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

