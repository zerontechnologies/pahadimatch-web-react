import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MessageSquare, Users } from 'lucide-react';
import { ChatListSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';
import { useGetChatListQuery } from '@/store/api/chatApi';
import { useGetConnectionsQuery } from '@/store/api/activityApi';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, getInitials } from '@/lib/utils';
import type { Chat, Connection } from '@/types';

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const profileIdFromUrl = searchParams.get('profileId');
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(profileIdFromUrl);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnections, setShowConnections] = useState(false);
  
  // WebSocket is initialized in DashboardLayout, but we can use it here if needed
  // useWebSocket();
  
  // Handle profileId from URL
  useEffect(() => {
    if (profileIdFromUrl) {
      setSelectedProfileId(profileIdFromUrl);
      setSelectedChatId(null);
      // Remove from URL after setting
      setSearchParams({}, { replace: true });
    }
  }, [profileIdFromUrl, setSearchParams]);
  
  // Remove polling - WebSocket will handle real-time updates
  const { data, isLoading } = useGetChatListQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: connectionsData, isLoading: connectionsLoading } = useGetConnectionsQuery({ page: 1, limit: 50 });
  const chats = data?.data || [];
  const connections = connectionsData?.data || [];

  // Convert connections to chat format for display
  const connectionChats: Chat[] = useMemo(() => {
    return connections.map((conn: Connection) => {
      // Check if this connection already has a chat
      const existingChat = chats.find((c: Chat) => c.participant.profileId === conn.profileId);
      if (existingChat) return existingChat;

      // Create a chat-like object from connection
      return {
        id: `connection-${conn.profileId}`,
        participant: {
          profileId: conn.profileId,
          firstName: undefined, // Only if hasViewedContact
          lastName: conn.lastName, // Connected users show lastName
          profilePhoto: conn.profilePhoto,
          isOnline: false,
          hasViewedContact: false, // Will be updated from API if available
          isConnected: true, // Connection means interest is accepted
            isVerified: conn.isVerified,
        },
        lastMessage: {
          content: 'Start a conversation...',
          createdAt: conn.connectedAt,
          status: 'sent' as const,
        },
        lastMessageAt: conn.connectedAt,
        unreadCount: 0,
      };
    });
  }, [connections, chats]);

  // Combine existing chats and connection chats, removing duplicates
  const allChats = useMemo(() => {
    const chatMap = new Map<string, Chat>();
    
    // Add existing chats
    chats.forEach((chat: Chat) => {
      chatMap.set(chat.participant.profileId, chat);
    });
    
    // Add connection chats (only if not already in chats)
    connectionChats.forEach((chat: Chat) => {
      if (!chatMap.has(chat.participant.profileId)) {
        chatMap.set(chat.participant.profileId, chat);
      }
    });
    
    return Array.from(chatMap.values());
  }, [chats, connectionChats]);

  const filteredChats = allChats.filter((chat: Chat) => {
    const name = chat.participant.lastName || chat.participant.firstName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participant.profileId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedChat = allChats.find((c: Chat) => c.id === selectedChatId);
  
  // If selected by profileId (from connections), find or create chat
  const chatForProfile = useMemo(() => {
    if (!selectedProfileId) return null;
    return allChats.find((c: Chat) => c.participant.profileId === selectedProfileId) || null;
  }, [selectedProfileId, allChats]);

  const displayChat = selectedChat || chatForProfile;

  return (
    <div className="h-[calc(100vh-10rem)] flex rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
      {/* Chat List Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${
        selectedChatId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text">Messages</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConnections(!showConnections)}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              {showConnections ? 'Chats' : 'Connections'}
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-champagne/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* Chat List or Connections */}
        <div className="flex-1 overflow-y-auto">
          {showConnections ? (
            // Show Connections List
            connectionsLoading ? (
              <div className="p-4">
                <ChatListSkeleton />
              </div>
            ) : connections.length > 0 ? (
              <div className="divide-y divide-border">
                {connections
                  .filter((conn: Connection) => {
                    const name = conn.lastName || '';
                    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      conn.profileId.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((connection: Connection) => (
                    <button
                      key={connection.profileId}
                      onClick={() => {
                        setSelectedProfileId(connection.profileId);
                        setSelectedChatId(null);
                        setShowConnections(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-4 text-left transition-colors',
                        selectedProfileId === connection.profileId
                          ? 'bg-primary-50 border-l-4 border-primary'
                          : 'hover:bg-champagne'
                      )}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={connection.profilePhoto} />
                        <AvatarFallback>
                          {getInitials('', connection.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-text truncate">
                            {connection.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          {connection.age && <span>{connection.age} yrs</span>}
                          {connection.city && <span>• {connection.city}</span>}
                        </div>
                        {connection.canMessage && (
                          <Badge variant="success" className="mt-1 text-xs">
                            Can Message
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState
                  icon={Users}
                  title="No connections"
                  description="Accept interests to start connecting with people"
                />
              </div>
            )
          ) : (
            // Show Chat List
            isLoading ? (
              <div className="p-4">
                <ChatListSkeleton />
              </div>
            ) : filteredChats.length > 0 ? (
              <ChatList
                chats={filteredChats}
                selectedChatId={selectedChatId || (selectedProfileId ? `connection-${selectedProfileId}` : null)}
                onSelectChat={(chatId) => {
                  setSelectedChatId(chatId);
                  setSelectedProfileId(null);
                }}
              />
            ) : (
              <div className="p-4">
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations"
                  description="Start connecting with matches to begin chatting"
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${
        !displayChat ? 'hidden md:flex' : 'flex'
      }`}>
        {displayChat ? (
          <ChatWindow
            chat={displayChat}
            onBack={() => {
              setSelectedChatId(null);
              setSelectedProfileId(null);
            }}
            onChatCreated={(chatId) => {
              setSelectedChatId(chatId);
              setSelectedProfileId(null);
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-champagne/30">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Select a conversation</h3>
              <p className="text-text-secondary">Choose a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

