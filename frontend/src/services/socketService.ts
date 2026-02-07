import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

type SocketCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, SocketCallback[]> = new Map();

  connect(token: string): Socket {
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

  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: SocketCallback): void {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)?.push(callback);
    }
  }

  off(event: string, callback?: SocketCallback): void {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (callback && this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      }
    }
  }

  // Chat events
  joinChat(chatId: string): void {
    this.emit('chat:join', { chatId });
  }

  leaveChat(chatId: string): void {
    this.emit('chat:leave', { chatId });
  }

  // Message events
  sendMessage(chatId: string, content: string, type: string = 'text', tempId?: string, replyToId?: string): void {
    this.emit('message:send', { chatId, content, type, tempId, replyToId });
  }

  markDelivered(messageId: string, chatId: string): void {
    console.log('[SocketService] Emitting message:delivered', { messageId, chatId });
    this.emit('message:delivered', { messageId, chatId });
  }

  markRead(messageId: string, chatId: string): void {
    console.log('[SocketService] Emitting message:read', { messageId, chatId });
    this.emit('message:read', { messageId, chatId });
  }

  addReaction(messageId: string, chatId: string, emoji: string): void {
    this.emit('message:reaction:add', { messageId, chatId, emoji });
  }

  removeReaction(messageId: string, chatId: string, emoji: string): void {
    this.emit('message:reaction:remove', { messageId, chatId, emoji });
  }

  deleteMessage(messageId: string, chatId: string): void {
    this.emit('message:delete', { messageId, chatId });
  }

  editMessage(messageId: string, chatId: string, content: string): void {
    this.emit('message:edit', { messageId, chatId, content });
  }

  // Typing events
  startTyping(chatId: string): void {
    this.emit('typing:start', { chatId });
  }

  stopTyping(chatId: string): void {
    this.emit('typing:stop', { chatId });
  }

  // Presence events
  updatePresence(userIds: string[]): void {
    this.emit('presence:update', { userIds });
  }
}

export const socketService = new SocketService();

