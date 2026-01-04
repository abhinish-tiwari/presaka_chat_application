import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  setupDefaultListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Chat events
  joinChat(chatId) {
    this.emit('chat:join', { chatId });
  }

  leaveChat(chatId) {
    this.emit('chat:leave', { chatId });
  }

  // Message events
  sendMessage(chatId, content, type = 'text', tempId) {
    this.emit('message:send', { chatId, content, type, tempId });
  }

  markDelivered(messageId, chatId) {
    this.emit('message:delivered', { messageId, chatId });
  }

  markRead(messageId, chatId) {
    this.emit('message:read', { messageId, chatId });
  }

  deleteMessage(messageId, chatId) {
    this.emit('message:delete', { messageId, chatId });
  }

  // Typing events
  startTyping(chatId) {
    this.emit('typing:start', { chatId });
  }

  stopTyping(chatId) {
    this.emit('typing:stop', { chatId });
  }

  // Presence events
  updatePresence(userIds) {
    this.emit('presence:update', { userIds });
  }
}

export const socketService = new SocketService();

