/**
 * Core Type Definitions
 */

// User Types
export interface User {
  id: string;
  phone: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  isOnline: boolean;
  lastSeen?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateUserData {
  name?: string;
  bio?: string;
  profilePicture?: string;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface OTPRequestResponse {
  requestId: string;
  expiresAt: string;
}

// Message Types
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  tempId?: string;
  readBy?: string[];
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
  };
  reactions?: {
    emoji: string;
    userId: string;
  }[];
  isEdited?: boolean;
}

export interface SendMessageData {
  content: string;
  tempId?: string;
}

// Chat Types
export type ChatType = 'private' | 'group';

export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateChatData {
  type: ChatType;
  participantIds: string[];
  name?: string;
}

// Typing Indicator Types
export interface TypingIndicator {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

// Socket Event Types
export interface SocketEvents {
  // Outgoing events
  'join-chat': (chatId: string) => void;
  'leave-chat': (chatId: string) => void;
  'send-message': (data: { chatId: string; content: string; tempId?: string }) => void;
  'typing': (data: { chatId: string; isTyping: boolean }) => void;
  'mark-read': (data: { chatId: string; messageIds: string[] }) => void;
  
  // Incoming events
  'message': (message: Message) => void;
  'message-sent': (data: { tempId: string; message: Message }) => void;
  'message-deleted': (data: { messageId: string; chatId: string }) => void;
  'user-typing': (data: TypingIndicator) => void;
  'user-online': (userId: string) => void;
  'user-offline': (userId: string) => void;
  'messages-read': (data: { chatId: string; messageIds: string[]; readBy: string }) => void;
}

// API Error Types
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Store Types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (userData: UpdateUserData) => void;
}

export interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  setActiveChat: (chatId: string | null) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, tempId: string, message: Message) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: MessageStatus) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  updateChatLastMessage: (chatId: string, message: Message) => void;
  incrementUnreadCount: (chatId: string) => void;
  resetUnreadCount: (chatId: string) => void;
}

export interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

