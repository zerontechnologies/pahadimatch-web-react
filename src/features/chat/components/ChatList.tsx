import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatTimeAgo, getInitials, truncateText } from '@/lib/utils';
import type { Chat } from '@/types';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="divide-y divide-border">
      {chats.map((chat, index) => (
        <motion.button
          key={chat.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelectChat(chat.id)}
          className={cn(
            'w-full flex items-center gap-3 p-4 text-left transition-colors',
            selectedChatId === chat.id
              ? 'bg-primary-50 border-l-4 border-primary'
              : 'hover:bg-champagne'
          )}
        >
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={chat.participant.profilePhoto} />
              <AvatarFallback>
                {getInitials(chat.participant.firstName || '', chat.participant.lastName || '')}
              </AvatarFallback>
            </Avatar>
            {chat.participant.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-text truncate">
                {chat.participant.firstName || ''} {chat.participant.lastName || 'Unknown'}
              </span>
              <span className="text-xs text-text-muted flex-shrink-0">
                {formatTimeAgo(chat.lastMessageAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary truncate">
                {truncateText(chat.lastMessage.content, 35)}
              </p>
              {chat.unreadCount > 0 && (
                <Badge className="ml-2 flex-shrink-0 bg-primary text-white">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

