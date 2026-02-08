import { motion } from 'framer-motion';
import { Avatar, Badge } from '@components/ui';
import { Chat, User } from '@/types';
import { formatMessageTime } from '@/utils/formatters';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  isOnline: boolean;
  otherParticipant: User | undefined;
  onClick: () => void;
}

const ChatItem = ({ chat, isActive, isOnline, otherParticipant, onClick }: ChatItemProps) => {
  return (
    <motion.div
      onClick={onClick}
      className={`group relative flex items-center px-3 py-3.5 cursor-pointer rounded-2xl transition-all duration-300 ${
        isActive ? 'bg-blue-500/15 dark:bg-blue-500/20 border-l-4 border-blue-500 shadow-sm hover:shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="relative flex-shrink-0 mr-3.5">
        <Avatar
          alt={otherParticipant?.name || 'User'}
          fallback={otherParticipant?.name?.[0] || otherParticipant?.phone?.[0] || '?'}
          size="md"
          status={isOnline ? 'online' : 'offline'}
          className={`rounded-full transition-transform duration-300 ${isActive ? 'ring-2 ring-blue-500/30' : ''}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-bold truncate text-sm tracking-tight ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'}`}>
            {otherParticipant?.name || 'Set Name'}
          </h3>
          {chat.lastMessage && (
            <span className={`text-[10px] font-medium whitespace-nowrap ml-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {formatMessageTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={`text-xs truncate leading-relaxed ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
            {chat.lastMessage?.content || 'No messages yet'}
          </p>
          {chat.unreadCount > 0 && !isActive && (
            <Badge variant="primary" size="sm" className="bg-blue-500 text-white border-0 shadow-sm animate-in fade-in zoom-in h-5 min-w-[20px] px-1.5 font-bold flex items-center justify-center rounded-full">
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatItem;
