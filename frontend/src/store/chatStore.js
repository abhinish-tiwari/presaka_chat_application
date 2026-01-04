import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  unreadCounts: {},
  onlineUsers: new Set(),

  // Set chats
  setChats: (chats) => set({ chats }),

  // Add or update chat
  addChat: (chat) =>
    set((state) => {
      const existingIndex = state.chats.findIndex((c) => c.id === chat.id);
      if (existingIndex >= 0) {
        const newChats = [...state.chats];
        newChats[existingIndex] = chat;
        return { chats: newChats };
      }
      return { chats: [chat, ...state.chats] };
    }),

  // Set active chat
  setActiveChat: (chatId) => set({ activeChat: chatId }),

  // Set messages for a chat
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),

  // Add message to chat
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  // Update message (for optimistic updates)
  updateMessage: (chatId, tempId, message) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const index = chatMessages.findIndex((m) => m.tempId === tempId || m.id === tempId);
      
      if (index >= 0) {
        const newMessages = [...chatMessages];
        newMessages[index] = { ...newMessages[index], ...message };
        return {
          messages: {
            ...state.messages,
            [chatId]: newMessages,
          },
        };
      }
      return state;
    }),

  // Set typing users for a chat
  setTypingUsers: (chatId, userIds) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: userIds,
      },
    })),

  // Set unread count for a chat
  setUnreadCount: (chatId, count) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: count,
      },
    })),

  // Clear unread count
  clearUnreadCount: (chatId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [chatId]: 0,
      },
    })),

  // Set user online
  setUserOnline: (userId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.add(userId);
      return { onlineUsers: newOnlineUsers };
    }),

  // Set user offline
  setUserOffline: (userId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    }),

  // Check if user is online
  isUserOnline: (userId) => get().onlineUsers.has(userId),

  // Update message status
  updateMessageStatus: (chatId, messageId, status) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const newMessages = chatMessages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      );
      return {
        messages: {
          ...state.messages,
          [chatId]: newMessages,
        },
      };
    }),

  // Delete message
  deleteMessage: (chatId, messageId) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const newMessages = chatMessages.filter((msg) => msg.id !== messageId);
      return {
        messages: {
          ...state.messages,
          [chatId]: newMessages,
        },
      };
    }),
}));

