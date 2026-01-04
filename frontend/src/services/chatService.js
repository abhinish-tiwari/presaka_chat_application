import api from './api';

export const chatService = {
  // Get all chats
  async getChats(limit = 20, offset = 0) {
    const response = await api.get('/chats', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Create private chat
  async createPrivateChat(recipientId) {
    const response = await api.post('/chats/private', { recipientId });
    return response.data;
  },

  // Get chat details
  async getChatDetails(chatId) {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  // Get chat messages
  async getChatMessages(chatId, limit = 50, before = null) {
    const response = await api.get(`/messages/chats/${chatId}/messages`, {
      params: { limit, before },
    });
    return response.data;
  },
};

