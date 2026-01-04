import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '@store/chatStore';
import { useAuthStore } from '@store/authStore';
import { chatService } from '@services/chatService';
import { useSocket } from '@/contexts/SocketContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const ChatPage = () => {
  const { chatId } = useParams();
  const socket = useSocket();
  const { user } = useAuthStore();
  const { messages, setMessages, addMessage, setActiveChat } = useChatStore();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const chatMessages = messages[chatId] || [];

  useEffect(() => {
    setActiveChat(chatId);
    loadMessages();
    socket.joinChat(chatId);

    return () => {
      socket.leaveChat(chatId);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChatMessages(chatId);
      setMessages(chatId, response.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const tempId = uuidv4();
    const tempMessage = {
      tempId,
      chatId,
      senderId: user.id,
      content: message,
      type: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
      sender: user,
    };

    // Add to UI immediately (optimistic update)
    addMessage(chatId, tempMessage);

    // Send via socket
    socket.sendMessage(chatId, message, 'text', tempId);

    // Clear input
    setMessage('');
  };

  const handleTyping = () => {
    socket.startTyping(chatId);
    
    // Auto-stop after 3 seconds
    setTimeout(() => {
      socket.stopTyping(chatId);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isOwn = msg.senderId === user.id;
            return (
              <div
                key={msg.id || msg.tempId}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isOwn && msg.status && (
                      <span className="ml-2">
                        {msg.status === 'sending' && '⏳'}
                        {msg.status === 'sent' && '✓'}
                        {msg.status === 'delivered' && '✓✓'}
                        {msg.status === 'read' && '✓✓'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;

