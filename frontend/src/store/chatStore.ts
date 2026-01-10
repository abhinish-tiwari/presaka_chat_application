import { create } from 'zustand';
import { ChatState } from '@/types';

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},

  // Set chats
  setChats: (chats) => set({
    chats: chats.map(chat => ({
      ...chat,
      lastMessage: chat.lastMessage
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

  // Delete message
  deleteMessage: (chatId, messageId) =>
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const newMessages = chatMessages.filter((msg) => msg.id !== messageId);

      // Update the chat's lastMessage to the new last message
      const lastMessage = newMessages.length > 0 ? newMessages[newMessages.length - 1] : undefined;
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

  // Set typing users for a chat
  setTyping: (chatId, userId, isTyping) =>
    set((state) => {
      const currentTyping = state.typingUsers[chatId] || [];
      const newTyping = isTyping
        ? [...currentTyping.filter(id => id !== userId), userId]
        : currentTyping.filter(id => id !== userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: newTyping,
        },
      };
    }),

  // Update chat's last message
  updateChatLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, lastMessage: message } : chat
      ),
    })),

  // Increment unread count
  incrementUnreadCount: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, unreadCount: chat.unreadCount + 1 }
          : chat
      ),
    })),

  // Reset unread count
  resetUnreadCount: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ),
    })),
}));

