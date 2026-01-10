import api from './api';
import { Chat, Message } from '@/types';

export const chatService = {
  // Get all chats
  async getChats(limit: number = 20, offset: number = 0): Promise<{ chats: Chat[] }> {
    const response = await api.get<{ chats: Chat[] }>('/chats', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Create private chat
  async createPrivateChat(recipientId: string): Promise<{ chat: Chat }> {
    const response = await api.post<{ chat: Chat }>('/chats/private', { recipientId });
    return response.data;
  },

  // Get chat details
  async getChatDetails(chatId: string): Promise<{ chat: Chat }> {
    const response = await api.get<{ chat: Chat }>(`/chats/${chatId}`);
    return response.data;
  },

  // Get chat messages
  async getChatMessages(chatId: string, limit: number = 50, before: string | null = null): Promise<{ messages: Message[] }> {
    const response = await api.get<{ messages: Message[] }>(`/messages/chats/${chatId}/messages`, {
      params: { limit, before },
    });
    return response.data;
  },

  // Delete message
  async deleteMessage(messageId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/messages/${messageId}`);
    return response.data;
  },
};

