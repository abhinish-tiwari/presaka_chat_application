import { createContext, useContext, useEffect } from 'react';
import { socketService } from '@services/socketService';
import { useAuthStore } from '@store/authStore';
import { useChatStore } from '@store/chatStore';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { accessToken } = useAuthStore();
  const { addMessage, updateMessage, setTypingUsers, setUserOnline, setUserOffline, updateMessageStatus } = useChatStore();

  useEffect(() => {
    if (!accessToken) return;

    // Connect socket
    socketService.connect(accessToken);

    // Setup event listeners
    socketService.on('message:receive', (message) => {
      addMessage(message.chatId, message);
      toast.success('New message received');
    });

    socketService.on('message:sent', ({ tempId, message }) => {
      updateMessage(message.chatId, tempId, message);
    });

    socketService.on('message:status', ({ messageId, status, chatId }) => {
      // Update message status in store
      if (chatId && messageId) {
        updateMessageStatus(chatId, messageId, status);
      }
      console.log('Message status updated:', messageId, status);
    });

    socketService.on('user:typing', ({ chatId, userId }) => {
      setTypingUsers(chatId, [userId]);

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setTypingUsers(chatId, []);
      }, 3000);
    });

    socketService.on('user:stopped-typing', ({ chatId }) => {
      setTypingUsers(chatId, []);
    });

    // Handle bulk online users list (sent on connect)
    socketService.on('users:online', ({ userIds }) => {
      console.log('Online users:', userIds);
      userIds.forEach(userId => setUserOnline(userId));
    });

    // Handle single user coming online
    socketService.on('user:online', ({ userId }) => {
      setUserOnline(userId);
      console.log('User online:', userId);
    });

    // Handle user going offline
    socketService.on('user:offline', ({ userId, lastSeen }) => {
      setUserOffline(userId);
      console.log('User offline:', userId, lastSeen);
    });

    socketService.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Socket error occurred');
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [accessToken, addMessage, updateMessage, setTypingUsers, setUserOnline, setUserOffline, updateMessageStatus]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};

