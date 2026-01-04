import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  unreadCounts: {},
  onlineUsers: new Set(),

  // Set chats
  setChats: (chats) => set({
    chats: chats.map(chat => ({
      ...chat,
      lastMessage: chat.lastMessage || chat.last_message
    }))
  }),

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
    set((state) => {
      // Update messages
      const updatedMessages = {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      };

      // Update the chat's lastMessage and move it to the top
      const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex >= 0) {
        const updatedChat = { ...state.chats[chatIndex], lastMessage: message };
        const updatedChats = [
          updatedChat,
          ...state.chats.slice(0, chatIndex),
          ...state.chats.slice(chatIndex + 1),
        ];

        return {
          messages: updatedMessages,
          chats: updatedChats,
        };
      }

      return {
        messages: updatedMessages,
        chats: state.chats,
      };
    }),

  // Update message (for optimistic updates)
  updateMessage: (chatId, tempId, message) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const index = chatMessages.findIndex((m) => m.tempId === tempId || m.id === tempId);

      if (index >= 0) {
        const newMessages = [...chatMessages];
        newMessages[index] = { ...newMessages[index], ...message };

        // If this is the last message, update the chat's lastMessage
        const isLastMessage = index === chatMessages.length - 1;
        const updatedChats = isLastMessage
          ? state.chats.map((chat) =>
              chat.id === chatId
                ? { ...chat, lastMessage: newMessages[index] }
                : chat
            )
          : state.chats;

        return {
          messages: {
            ...state.messages,
            [chatId]: newMessages,
          },
          chats: updatedChats,
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

      // If the updated message is the last message, update the chat's lastMessage status
      const lastMessage = newMessages[newMessages.length - 1];
      const updatedChats = lastMessage?.id === messageId
        ? state.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, lastMessage: { ...chat.lastMessage, status } }
              : chat
          )
        : state.chats;

      return {
        messages: {
          ...state.messages,
          [chatId]: newMessages,
        },
        chats: updatedChats,
      };
    }),

  // Delete message
  deleteMessage: (chatId, messageId) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const newMessages = chatMessages.filter((msg) => msg.id !== messageId);

      // Update the chat's lastMessage to the new last message
      const lastMessage = newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;
      const updatedChats = state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage }
          : chat
      );

      return {
        messages: {
          ...state.messages,
          [chatId]: newMessages,
        },
        chats: updatedChats,
      };
    }),
}));

