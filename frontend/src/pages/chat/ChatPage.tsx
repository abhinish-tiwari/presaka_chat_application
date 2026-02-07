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
        <header className="flex-shrink-0 px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <Avatar
              alt={otherUser?.name || 'User'}
              fallback={otherUser?.name?.[0] || otherUser?.phone?.[0] || '?'}
              size="md"
              status={isOtherUserOnline ? 'online' : 'offline'}
            />
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {otherUser?.name || otherUser?.phone || "Chat"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isTyping ? (
                  <span className="text-blue-500 font-medium animate-pulse">typing...</span>
                ) : isOtherUserOnline ? (
                  "Online"
                ) : otherUser?.lastSeen ? (
                  `Last seen ${formatLastSeen(otherUser.lastSeen)}`
                ) : (
                  "Offline"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </Button>
            <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          </div>
        </header>

        {/* Message Area - Using the legacy beige background for familiarity in light mode */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth bg-[#efeae2] dark:bg-gray-950/50">
          {loading ? (
            <MessageListSkeleton count={8} />
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-medium">No messages yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send a message to break the ice!</p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {chatMessages.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                const isHovered = hoveredMessageId === msg.id;

                return (
                  <motion.div
                    key={msg.id}
                    id={`message-${msg.id}`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} group relative`}
                  >
                    <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isOwn ? "flex-row" : "flex-row-reverse"}`}>
                      {/* Actions Menu */}
                      <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                        <MessageActions
                          onCopy={() => {
                            navigator.clipboard.writeText(msg.content);
                            toast.success("Copied to clipboard");
                          }}
                          onDelete={() => socket.deleteMessage(msg.id, chatId!)}
                          onReply={() => {
                            setReplyingTo(msg);
                            setEditingMessage(null);
                            document.querySelector('input')?.focus();
                          }}
                          onEdit={() => {
                            setEditingMessage(msg);
                            setReplyingTo(null);
                            setMessage(msg.content);
                            document.querySelector('input')?.focus();
                          }}
                          onReaction={(emoji) => socket.addReaction(msg.id, chatId!, emoji)}
                          canDelete={isOwn}
                          isOwn={isOwn}
                        />
                      </div>

                      <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                        isOwn 
                          ? "bg-blue-600 text-white rounded-br-none" 
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-bl-none"
                      }`}>
                        {/* Reply Preview */}
                        {msg.replyTo && (
                          <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${
                            isOwn ? "bg-blue-700/50 border-blue-300" : "bg-gray-100 dark:bg-gray-700 border-blue-500"
                          }`}>
                            <p className="font-bold mb-0.5">{msg.replyTo.senderName}</p>
                            <p className="truncate opacity-80">{msg.replyTo.content}</p>
                          </div>
                        )}
                        
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="absolute -bottom-3 right-0 flex -space-x-1">
                             <Badge variant="default" className="text-[10px] px-1.5 py-0.5 rounded-full border dark:border-gray-700 shadow-sm flex items-center gap-1 bg-white dark:bg-gray-800">
                               {Array.from(new Set(msg.reactions.map(r => r.emoji))).join('')}
                               <span className="text-gray-500 dark:text-gray-400 font-bold">{msg.reactions.length}</span>
                             </Badge>
                          </div>
                        )}

                        <div className="flex items-center justify-end mt-1 gap-1.5">
                          {msg.isEdited && <span className="text-[9px] opacity-60">edited</span>}
                          <span className="text-[10px] opacity-70">{formatMessageTime(msg.createdAt)}</span>
                          {isOwn && (
                            <div className="flex -space-x-1.5">
                              {/* Status Icons */}
                              {msg.status === 'read' ? (
                                <svg className="w-3.5 h-3.5 text-blue-300" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 11l-4 4-2-2m10-2l-4 4m0-4l4 4m-4-10l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : msg.status === 'delivered' ? (
                                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 11l-4 4-2-2m10-2l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-10 transition-all duration-300">
          <AnimatePresence>
            {replyingTo && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-blue-500 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Replying to</p>
                  <p className="text-sm truncate text-gray-600 dark:text-gray-300">{replyingTo.content}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-6xl mx-auto">
             <div className="relative">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="rounded-full w-10 h-10 p-0 text-gray-500 hover:text-blue-500"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-3 left-0">
                    <EmojiPicker 
                      onEmojiSelect={(emoji) => {
                        setMessage(p => p + emoji);
                        setShowEmojiPicker(false);
                      }} 
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
             </div>

             <div className="flex-1 relative">
                <Input
                  placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  fullWidth
                  className="bg-gray-50 dark:bg-gray-800 border-none shadow-inner focus:ring-1"
                />
             </div>

             <Button 
                type="submit" 
                variant="primary" 
                className={`rounded-full shadow-lg transition-all duration-300 ${message.trim() ? "w-12 h-12 p-0 scale-100" : "w-0 h-0 p-0 overflow-hidden scale-0"}`}
                disabled={!message.trim()}
             >
                <svg className="w-5 h-5 rotate-45 -mt-0.5 -mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
             </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default ChatPage;
