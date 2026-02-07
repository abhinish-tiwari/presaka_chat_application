import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message, MessageStatus } from '@/types';

// Chat State Interface
interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  onlineUsers: string[];
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  onlineUsers: [],
};

/**
 * Utility to sync the last message of a chat and move it to the top of the list
 */
const syncChatList = (state: ChatState, chatId: string, updatedMessage?: Message) => {
  const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
  if (chatIndex < 0) return;

  const chat = state.chats[chatIndex];
  
  // Update last message if provided, or find it from message history
  if (updatedMessage) {
    chat.lastMessage = updatedMessage;
  } else {
    const chatMessages = state.messages[chatId] || [];
    chat.lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : undefined;
  }

  // Move chat to top if not already there
  if (chatIndex !== 0) {
    state.chats.splice(chatIndex, 1);
    state.chats.unshift(chat);
  }
};

/**
 * Utility to find and update a specific message in state
 */
const findMessage = (state: ChatState, chatId: string, messageId: string) => {
  const chatMessages = state.messages[chatId] || [];
  const index = chatMessages.findIndex((m) => m.id === messageId || m.tempId === messageId);
  return { chatMessages, index };
};

// Chat Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      const existingIndex = state.chats.findIndex((c) => c.id === action.payload.id);
      if (existingIndex >= 0) {
        state.chats[existingIndex] = action.payload;
      } else {
        state.chats.unshift(action.payload);
      }
    },
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChat = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: Message[] }>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
      syncChatList(state, chatId, message);
    },
    updateMessage: (state, action: PayloadAction<{ chatId: string; tempId: string; message: Partial<Message> }>) => {
      const { chatId, tempId, message } = action.payload;
      const { chatMessages, index } = findMessage(state, chatId, tempId);

      if (index >= 0) {
        chatMessages[index] = { ...chatMessages[index], ...message };
        
        // Sync last message if this was the last one
        if (index === chatMessages.length - 1) {
          syncChatList(state, chatId, chatMessages[index]);
        }
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ chatId: string; messageId: string; status: MessageStatus }>) => {
      const { chatId, messageId, status } = action.payload;
      const { chatMessages, index } = findMessage(state, chatId, messageId);

      if (index >= 0) {
        chatMessages[index].status = status;
        if (index === chatMessages.length - 1) {
          syncChatList(state, chatId, chatMessages[index]);
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload;
      if (!state.messages[chatId]) return;
      
      state.messages[chatId] = state.messages[chatId].filter((msg) => msg.id !== messageId);
      syncChatList(state, chatId);
    },
    setTyping: (state, action: PayloadAction<{ chatId: string; userId: string; isTyping: boolean }>) => {
      const { chatId, userId, isTyping } = action.payload;
      const currentTyping = state.typingUsers[chatId] || [];

      if (isTyping) {
        state.typingUsers[chatId] = [...currentTyping.filter(id => id !== userId), userId];
      } else {
        state.typingUsers[chatId] = currentTyping.filter(id => id !== userId);
      }
    },
    updateChatLastMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      syncChatList(state, action.payload.chatId, action.payload.message);
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) chat.unreadCount += 1;
    },
    resetUnreadCount: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) chat.unreadCount = 0;
    },
    addReaction: (state, action: PayloadAction<{ chatId: string; messageId: string; emoji: string; userId: string }>) => {
      const { chatId, messageId, emoji, userId } = action.payload;
      const { chatMessages, index } = findMessage(state, chatId, messageId);
      
      if (index >= 0) {
        const msg = chatMessages[index];
        if (!msg.reactions) msg.reactions = [];
        // Unique reaction per user+emoji
        msg.reactions = msg.reactions.filter(r => r.userId !== userId || r.emoji !== emoji);
        msg.reactions.push({ emoji, userId });
      }
    },
    removeReaction: (state, action: PayloadAction<{ chatId: string; messageId: string; emoji: string; userId: string }>) => {
      const { chatId, messageId, emoji, userId } = action.payload;
      const { chatMessages, index } = findMessage(state, chatId, messageId);
      
      if (index >= 0 && chatMessages[index].reactions) {
        chatMessages[index].reactions = chatMessages[index].reactions!.filter(
          (r) => !(r.emoji === emoji && r.userId === userId)
        );
      }
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const {
  setChats,
  addChat,
  setActiveChat,
  setMessages,
  addMessage,
  updateMessage,
  updateMessageStatus,
  deleteMessage,
  setTyping,
  updateChatLastMessage,
  incrementUnreadCount,
  resetUnreadCount,
  addReaction,
  removeReaction,
  setOnlineUsers,
} = chatSlice.actions;

export default chatSlice.reducer;
