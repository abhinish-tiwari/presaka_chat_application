import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useChatStore } from '@store/chatStore';
import { useAuthStore } from '@store/authStore';
import { chatService } from '@services/chatService';
import { useSocket } from '@/contexts/SocketContext';
import { formatMessageTime } from '@utils/formatters';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import MessageActions from '@/components/MessageActions';
import EmojiPicker from '@/components/EmojiPicker';
import { Message } from '@/types';

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const socket = useSocket();
  const { user } = useAuthStore();
  const { messages, setMessages, addMessage, setActiveChat, typingUsers } = useChatStore();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const markedAsReadRef = useRef(new Set<string>());
  const messageRefs = useRef<Record<string, HTMLDivElement>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const chatMessages = useMemo(() => messages[chatId || ''] || [], [messages, chatId]);
  const chatTypingUsers = useMemo(() => typingUsers[chatId || ''] || [], [typingUsers, chatId]);
  const isTyping = chatTypingUsers.length > 0;

  const loadMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const response = await chatService.getChatMessages(chatId);

      // Ensure all messages have a status field
      const messagesWithStatus = response.messages.map(msg => ({
        ...msg,
        status: msg.status || 'sent',
      }));

      setMessages(chatId, messagesWithStatus);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatId, setMessages]);

  useEffect(() => {
    if (!chatId) return;

    setActiveChat(chatId);
    loadMessages();
    socket.joinChat(chatId);

    // Clear marked messages when switching chats
    markedAsReadRef.current = new Set();

    return () => {
      socket.leaveChat(chatId);

      // Clean up typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (isTypingRef.current) {
        socket.stopTyping(chatId);
        isTypingRef.current = false;
      }
    };
  }, [chatId, setActiveChat, loadMessages, socket]);

  // Mark all unread messages as read when viewing chat
  const markMessagesAsRead = useCallback(() => {
    if (!chatId || !user?.id) return;

    chatMessages.forEach((msg: any) => {
      // Only mark messages from others as read
      if (msg.sender_id !== user.id && msg.senderId !== user.id) {
        // Check if we haven't already marked this message
        if (msg.id && !markedAsReadRef.current.has(msg.id)) {
          socket.markRead(msg.id, chatId);
          markedAsReadRef.current.add(msg.id);
        }
      }
    });
  }, [chatMessages, user?.id, socket, chatId]);

  useEffect(() => {
    scrollToBottom();
    markMessagesAsRead();
  }, [chatMessages, markMessagesAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      const messageContent = messageElement.querySelector('.message-content');
      if (messageContent) {
        messageContent.classList.add('message-highlight');
        setTimeout(() => {
          messageContent.classList.remove('message-highlight');
        }, 2000);
      }
    }
  };

  // Handle message URL navigation
  useEffect(() => {
    const hash = location.hash;
    if (hash.startsWith('#message-')) {
      const messageId = hash.replace('#message-', '');
      // Wait for messages to load
      setTimeout(() => {
        scrollToMessage(messageId);
      }, 500);
    }
  }, [location.hash, chatMessages]);

  const handleCopyMessageUrl = (msg: Message) => {
    const messageUrl = `${window.location.origin}/chat/${chatId}#message-${msg.id}`;
    navigator.clipboard.writeText(messageUrl);
    toast.success('Message link copied to clipboard');
    setHoveredMessageId(null);
  };

  const handleDeleteMessage = async (msg: Message) => {
    if (!chatId || !msg.id) return;

    try {
      socket.deleteMessage(msg.id, chatId);
      setHoveredMessageId(null);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !chatId || !user) return;

    const tempId = uuidv4();
    const tempMessage: Message = {
      id: tempId,
      tempId,
      chatId,
      senderId: user.id,
      content: message,
      status: 'sending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to UI immediately (optimistic update)
    addMessage(chatId, tempMessage);

    // Send via socket
    socket.sendMessage(chatId, message, 'text', tempId);

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current) {
      socket.stopTyping(chatId);
      isTypingRef.current = false;
    }

    // Clear input
    setMessage('');
  };

  const handleTyping = () => {
    if (!chatId) return;

    // Only send typing:start if not already typing
    if (!isTypingRef.current) {
      socket.startTyping(chatId);
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (chatId) {
        socket.stopTyping(chatId);
      }
      isTypingRef.current = false;
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Get other user info from location state
  const otherUser = location.state?.otherUser;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">
          {otherUser?.name || otherUser?.phone || 'Chat'}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
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
            const isOwn = msg.senderId === user?.id;
            const isHovered = hoveredMessageId === msg.id;
            return (
              <div
                key={msg.id || msg.tempId}
                id={`message-${msg.id}`}
                ref={(el) => {
                  if (msg.id && el) messageRefs.current[msg.id] = el;
                }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className={`flex items-center gap-2 ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Three-dot button - appears on opposite side based on message owner */}
                  {isHovered && msg.id && (
                    <MessageActions
                      onCopy={() => handleCopyMessageUrl(msg)}
                      onDelete={() => handleDeleteMessage(msg)}
                      canDelete={isOwn}
                      isOwn={isOwn}
                    />
                  )}

                  <div
                    className={`message-content max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow transition-all ${
                      isOwn
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatMessageTime(msg.createdAt)}
                      </p>
                      {isOwn && (
                        <span className="text-xs">
                          {msg.status === 'sending' && <span className="text-blue-200 opacity-70">⏳</span>}
                          {msg.status === 'sent' && <span className="text-blue-200">✓</span>}
                          {msg.status === 'delivered' && <span className="text-blue-100">✓✓</span>}
                          {msg.status === 'read' && <span className="text-green-300 font-semibold">✓✓</span>}
                          {!msg.status && <span className="text-blue-200">✓</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-500">{otherUser?.name || 'User'} is typing...</span>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
              title="Add emoji"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>

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
          <button
            type="submit"
            disabled={!message.trim()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-3"
            title="Send message"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ transform: 'rotate(90deg)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
