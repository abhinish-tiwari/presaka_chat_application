import { createContext, useContext, useEffect, ReactNode } from 'react';
import { socketService } from '@services/socketService';
import { useAuthStore } from '@store/authStore';
import { useChatStore } from '@store/chatStore';
import toast from 'react-hot-toast';
import { Message, MessageStatus } from '@/types';

const SocketContext = createContext<typeof socketService | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { accessToken } = useAuthStore();
  const { addMessage, updateMessage, updateMessageStatus, setTyping, deleteMessage } = useChatStore();

  useEffect(() => {
    if (!accessToken) return;

    // Connect socket
    socketService.connect(accessToken);

    // Setup event listeners
    socketService.on('message:receive', (message: Message) => {
      const chatId = message.chatId;
      console.log('Message received:', message, 'chatId:', chatId);

      // Ensure message has a status field
      const messageWithStatus: Message = {
        ...message,
        status: message.status || 'sent',
      };

      addMessage(chatId, messageWithStatus);

      // Automatically mark as delivered
      if (message.id) {
        socketService.markDelivered(message.id, chatId);
      }

      toast.success('New message received');
    });

    socketService.on('message:sent', ({ tempId, message }: { tempId: string; message: Message }) => {
      const chatId = message.chatId;
      console.log('Message sent confirmation:', message, 'chatId:', chatId);
      updateMessage(chatId, tempId, message);
    });

    socketService.on('message:status', ({ messageId, status, chatId }: { messageId: string; status: MessageStatus; chatId: string }) => {
      console.log('Message status updated:', messageId, status, 'chatId:', chatId);
      updateMessageStatus(chatId, messageId, status);
    });

    socketService.on('user:typing', ({ chatId, userId }: { chatId: string; userId: string }) => {
      setTyping(chatId, userId, true);

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setTyping(chatId, userId, false);
      }, 3000);
    });

    socketService.on('user:stopped-typing', ({ chatId, userId }: { chatId: string; userId: string }) => {
      setTyping(chatId, userId, false);
    });

    // Handle bulk online users list (sent on connect)
    socketService.on('users:online', ({ userIds }: { userIds: string[] }) => {
      console.log('Online users:', userIds);
    });

    // Handle single user coming online
    socketService.on('user:online', ({ userId }: { userId: string }) => {
      console.log('User online:', userId);
    });

    // Handle user going offline
    socketService.on('user:offline', ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
      console.log('User offline:', userId, lastSeen);
    });

    socketService.on('message:deleted', ({ messageId, chatId }: { messageId: string; chatId: string }) => {
      deleteMessage(chatId, messageId);
      console.log('Message deleted:', messageId);
      toast.success('Message deleted');
    });

    socketService.on('error', (error: { message?: string }) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Socket error occurred');
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [accessToken, addMessage, updateMessage, updateMessageStatus, setTyping, deleteMessage]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};

