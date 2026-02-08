import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  setMessages,
  addMessage,
  resetUnreadCount,
  setActiveChat,
} from "@store/chatStore";
import { chatService } from "@services/chatService";
import { useSocket } from "@/contexts/SocketContext";
import { formatMessageTime, formatLastSeen } from "@utils/formatters";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import MessageActions from "@/components/MessageActions";
import EmojiPicker from "@/components/EmojiPicker";
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageComposer from './components/MessageComposer';
import { Message } from "@/types";
import { PageTransition } from "@components/PageTransition";
import { MessageListSkeleton, Avatar, Button, Input, Badge } from "@components/ui";

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const messages = useAppSelector((state) => state.chat.messages);
  const typingUsers = useAppSelector((state) => state.chat.typingUsers);
  const chats = useAppSelector((state) => state.chat.chats);
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const markedAsReadRef = useRef(new Set<string>());
  const typingTimeoutRef = useRef<any | null>(null);
  const isTypingRef = useRef(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const chatMessages = useMemo(
    () => messages[chatId || ""] || [],
    [messages, chatId],
  );
  
  const chatTypingUsers = useMemo(
    () => typingUsers[chatId || ""] || [],
    [typingUsers, chatId],
  );
  
  const isTyping = chatTypingUsers.length > 0;

  // Get current chat from store
  const currentChat = useMemo(() => {
    return chats.find((chat) => chat.id === chatId);
  }, [chats, chatId]);

  // Get other user info
  const otherUser = useMemo(() => {
    if (location.state?.otherUser) return location.state.otherUser;
    if (currentChat?.participants) {
      return currentChat.participants.find((p) => p.id !== user?.id);
    }
    return null;
  }, [location.state?.otherUser, currentChat, user?.id]);

  const isOtherUserOnline = useMemo(() => {
    return otherUser ? onlineUsers.includes(otherUser.id) : false;
  }, [otherUser, onlineUsers]);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      if (chatMessages.length === 0) setLoading(true);
      const response = await chatService.getChatMessages(chatId);
      const messagesWithStatus = response.messages.map((msg: any) => ({
        ...msg,
        status: msg.status || "sent",
      }));
      dispatch(setMessages({ chatId, messages: messagesWithStatus }));
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }, [chatId, dispatch, chatMessages.length]);

  useEffect(() => {
    if (chatId) {
      loadMessages();
      socket.joinChat(chatId);
      dispatch(resetUnreadCount(chatId));
      dispatch(setActiveChat(chatId));
    }
    return () => {
      if (chatId) socket.leaveChat(chatId);
      dispatch(setActiveChat(null));
    };
  }, [chatId, socket, dispatch]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(chatMessages.length <= 10 ? "auto" : "smooth");
  }, [chatMessages.length, isTyping]);

  const markMessagesAsRead = useCallback(() => {
    if (!chatId || !user?.id) return;
    chatMessages.forEach((msg: Message) => {
      if (msg.senderId !== user.id && msg.status !== "read" && !markedAsReadRef.current.has(msg.id)) {
        socket.markRead(msg.id, chatId);
        markedAsReadRef.current.add(msg.id);
      }
    });
  }, [chatMessages, user?.id, socket, chatId]);

  useEffect(() => {
    markMessagesAsRead();
  }, [chatMessages, markMessagesAsRead]);

  const scrollToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-blue-500", "ring-offset-2");
      }, 2000);
    }
  }, []);

  // Handle message URL navigation
  useEffect(() => {
    const hash = location.hash;
    if (hash.startsWith("#message-") && chatMessages.length > 0) {
      const messageId = hash.replace("#message-", "");
      const timer = setTimeout(() => scrollToMessage(messageId), 500);
      return () => clearTimeout(timer);
    }
  }, [location.hash, chatMessages, scrollToMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chatId || !user) return;

    if (editingMessage) {
      socket.editMessage(editingMessage.id, chatId, message.trim());
      setEditingMessage(null);
    } else {
      const tempId = uuidv4();
      const newMessage: Message = {
        id: tempId,
        tempId,
        chatId,
        content: message.trim(),
        senderId: user.id,
        status: "sending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replyTo: replyingTo ? {
          id: replyingTo.id,
          content: replyingTo.content,
          senderId: replyingTo.senderId,
          senderName: (replyingTo.senderId === user.id ? "You" : otherUser?.name) || "User",
        } : undefined,
      };

      dispatch(addMessage({ chatId, message: newMessage }));
      socket.sendMessage(chatId, message.trim(), "text", tempId, replyingTo?.id);
    }

    setMessage("");
    setReplyingTo(null);
  };

  const handleTyping = () => {
    if (!chatId) return;
    if (!isTypingRef.current) {
      socket.startTyping(chatId);
      isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (chatId) socket.stopTyping(chatId);
      isTypingRef.current = false;
    }, 3000);
  };

  return (
    <PageTransition>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        {/* Chat Header */}
        <ChatHeader
          otherUser={otherUser}
          isOtherUserOnline={isOtherUserOnline}
          isTyping={isTyping}
          onBack={() => navigate('/')}
        />

        {/* Message Area - Using the legacy beige background for familiarity in light mode */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth bg-[#efeae2] dark:bg-gray-950/50">
          <MessageList
            chatMessages={chatMessages}
            loading={loading}
            userId={user?.id}
            hoveredMessageId={hoveredMessageId}
            setHoveredMessageId={setHoveredMessageId}
            onCopy={(text) => {
              navigator.clipboard.writeText(text);
              toast.success('Copied to clipboard');
            }}
            onDelete={(id) => socket.deleteMessage(id, chatId!)}
            onReply={(msg) => {
              setReplyingTo(msg);
              setEditingMessage(null);
              document.querySelector('input')?.focus();
            }}
            onEdit={(msg) => {
              setEditingMessage(msg);
              setReplyingTo(null);
              setMessage(msg.content);
              document.querySelector('input')?.focus();
            }}
            onReaction={(emoji, id) => socket.addReaction(id, chatId!, emoji)}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageComposer
          message={message}
          setMessage={setMessage}
          onSend={handleSendMessage}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          editingMessage={editingMessage}
          setEditingMessage={setEditingMessage}
          handleTyping={handleTyping}
          chatId={chatId}
        />
      </div>
    </PageTransition>
  );
};

export default ChatPage;
