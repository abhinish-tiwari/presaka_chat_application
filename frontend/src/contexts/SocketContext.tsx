import { createContext, useContext, useEffect, ReactNode, useRef } from 'react';
import { socketService } from '@services/socketService';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { addChat, addMessage, updateMessage, updateMessageStatus, setTyping, deleteMessage, incrementUnreadCount, addReaction, removeReaction, setOnlineUsers } from '@store/chatStore';
import { chatService } from '@services/chatService';
import { RootState } from '@store/index';
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
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const chats = useAppSelector((state) => state.chat.chats);
  const activeChat = useAppSelector((state) => state.chat.activeChat);

  // Use refs to avoid re-running the effect when chats or activeChat change
  const chatsRef = useRef(chats);
  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!accessToken) return;

    // Connect socket
    socketService.connect(accessToken);

    // Setup event listeners
    socketService.on('message:receive', async (message: Message) => {
      const chatId = message.chatId;
      console.log('Message received:', message, 'chatId:', chatId);

      // Check if chat exists in store using ref
      const chatExists = chatsRef.current.some(chat => chat.id === chatId);

      // If chat doesn't exist, fetch it from backend
      if (!chatExists) {
        try {
          console.log('Chat not found in store, fetching details for:', chatId);
          const response = await chatService.getChatDetails(chatId);
          dispatch(addChat(response.chat));
          console.log('Chat added to store:', response.chat);
        } catch (error) {
          console.error('Error fetching chat details:', error);
        }
      }

      // Ensure message has a status field
      const messageWithStatus: Message = {
        ...message,
        status: message.status || 'sent',
      };

      dispatch(addMessage({ chatId, message: messageWithStatus }));

      // Handle unread count and read status
      if (activeChatRef.current === chatId) {
        // If chat is active, mark as read immediately
        if (message.id) {
          socketService.markRead(message.id, chatId);
        }
      } else {
        // If chat is NOT active, increment unread count
        dispatch(incrementUnreadCount(chatId));
      }

      // Automatically mark as delivered
      if (message.id) {
        socketService.markDelivered(message.id, chatId);
      }

      toast.success('New message received');
    });

    socketService.on('message:sent', ({ tempId, message }: { tempId: string; message: Message }) => {
      const chatId = message.chatId;
      console.log('Message sent confirmation:', message, 'chatId:', chatId);
      dispatch(updateMessage({ chatId, tempId, message }));
    });

    socketService.on('message:status', ({ messageId, status, chatId }: { messageId: string; status: MessageStatus; chatId: string }) => {
      console.log('Message status updated:', messageId, status, 'chatId:', chatId);
      dispatch(updateMessageStatus({ chatId, messageId, status }));
    });

    socketService.on('user:typing', ({ chatId, userId }: { chatId: string; userId: string }) => {
      dispatch(setTyping({ chatId, userId, isTyping: true }));

      // Auto-clear after 3 seconds
      setTimeout(() => {
        dispatch(setTyping({ chatId, userId, isTyping: false }));
      }, 3000);
    });

    socketService.on('user:stopped-typing', ({ chatId, userId }: { chatId: string; userId: string }) => {
      dispatch(setTyping({ chatId, userId, isTyping: false }));
    });

    // Handle bulk online users list (sent on connect)
    socketService.on('users:online', ({ userIds }: { userIds: string[] }) => {
      console.log('Initial online users:', userIds);
      dispatch(setOnlineUsers(userIds));
    });

    // Handle single user coming online
    socketService.on('user:online', ({ userId }: { userId: string }) => {
      console.log('User online:', userId);
      dispatch((dispatch, getState) => {
        const { onlineUsers } = (getState() as RootState).chat;
        if (!onlineUsers.includes(userId)) {
          dispatch(setOnlineUsers([...onlineUsers, userId]));
        }
      });
    });

    // Handle user going offline
    socketService.on('user:offline', ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
      console.log('User offline:', userId, lastSeen);
      dispatch((dispatch, getState) => {
        const { onlineUsers } = (getState() as RootState).chat;
        dispatch(setOnlineUsers(onlineUsers.filter(id => id !== userId)));
      });
    });

    socketService.on('message:deleted', ({ messageId, chatId }: { messageId: string; chatId: string }) => {
      dispatch(deleteMessage({ chatId, messageId }));
      console.log('Message deleted:', messageId);
      toast.success('Message deleted');
    });

    socketService.on('message:edited', ({ messageId, chatId, content, isEdited }: { messageId: string; chatId: string; content: string; isEdited: boolean }) => {
      dispatch(updateMessage({ chatId, tempId: messageId, message: { content, isEdited } }));
      toast.success('Message edited');
    });

    socketService.on('message:reaction:added', ({ messageId, chatId, userId, emoji }: { messageId: string; chatId: string; userId: string; emoji: string }) => {
      dispatch(addReaction({ chatId, messageId, userId, emoji }));
    });

    socketService.on('message:reaction:removed', ({ messageId, chatId, userId, emoji }: { messageId: string; chatId: string; userId: string; emoji: string }) => {
      dispatch(removeReaction({ chatId, messageId, userId, emoji }));
    });

    socketService.on('error', (error: { message?: string }) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Socket error occurred');
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [accessToken, dispatch]);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};
