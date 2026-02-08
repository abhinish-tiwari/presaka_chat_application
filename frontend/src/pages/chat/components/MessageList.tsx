import { AnimatePresence, motion } from 'framer-motion';
import MessageActions from '@/components/MessageActions';
import { Badge } from '@components/ui';
import { formatMessageTime } from '@utils/formatters';
import { Message } from '@/types';

interface MessageListProps {
  chatMessages: Message[];
  loading: boolean;
  userId?: string | null;
  hoveredMessageId: string | null;
  setHoveredMessageId: (id: string | null) => void;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onReaction: (emoji: string, msgId: string) => void;
}

const MessageList = ({
  chatMessages,
  loading,
  userId,
  hoveredMessageId,
  setHoveredMessageId,
  onCopy,
  onDelete,
  onReply,
  onEdit,
  onReaction,
}: MessageListProps) => {
  if (loading) return <div className="px-3 space-y-4 pt-2">Loading...</div>;

  if (chatMessages.length === 0) {
    return (
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
    );
  }

  return (
    <AnimatePresence initial={false}>
      {chatMessages.map((msg) => {
        const isOwn = msg.senderId === userId;
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
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}
          >
            <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <MessageActions
                  onCopy={() => onCopy(msg.content)}
                  onDelete={() => onDelete(msg.id)}
                  onReply={() => onReply(msg)}
                  onEdit={() => onEdit(msg)}
                  onReaction={(emoji) => onReaction(emoji, msg.id)}
                  canDelete={isOwn}
                  isOwn={isOwn}
                />
              </div>

              <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                isOwn
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-bl-none'
              }`}>
                {msg.replyTo && (
                  <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${isOwn ? 'bg-blue-700/50 border-blue-300' : 'bg-gray-100 dark:bg-gray-700 border-blue-500'}`}>
                    <p className="font-bold mb-0.5">{msg.replyTo.senderName}</p>
                    <p className="truncate opacity-80">{msg.replyTo.content}</p>
                  </div>
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

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
  );
};

export default MessageList;
