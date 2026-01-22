import { useState, useEffect, useRef } from 'react';
import { webSocketService } from '@/lib/websocket';
import type { SocketTyping } from '@/types';

// Global typing state to avoid handler conflicts
const typingState = new Map<string, { setIsTyping: (value: boolean) => void; timeoutRef: { current: ReturnType<typeof setTimeout> | null } }>();

// Global typing handler that routes to the correct chat
const globalTypingHandler = (data: SocketTyping) => {
  const state = typingState.get(data.chatId);
  if (state) {
    state.setIsTyping(true);
    
    // Clear existing timeout
    if (state.timeoutRef.current) {
      clearTimeout(state.timeoutRef.current);
    }
    
    // Hide typing indicator after 3 seconds
    state.timeoutRef.current = setTimeout(() => {
      state.setIsTyping(false);
    }, 3000);
  }
};

export function useTypingIndicator(chatId: string | null) {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!chatId) {
      setIsTyping(false);
      return;
    }

    // Register this chat's typing state
    typingState.set(chatId, {
      setIsTyping,
      timeoutRef,
    });

    // Set up global typing handler if not already set
    webSocketService.setHandlers({
      onTyping: globalTypingHandler,
    });

    return () => {
      // Clean up
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      typingState.delete(chatId);
    };
  }, [chatId]);

  return isTyping;
}

