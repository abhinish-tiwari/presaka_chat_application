import { motion } from 'framer-motion';
import { ChatListSkeleton } from '@components/ui';
import { Chat, User } from '@/types';
import ChatItem from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  activeChat: string | null;
  onlineUsers: string[];
  onChatClick: (chat: Chat) => void;
  getOtherParticipant: (chat: Chat) => User | undefined;
  isUserOnline: (userId: string) => boolean;
}

const ChatList = ({
  chats,
  loading,
  activeChat,
  onChatClick,
  getOtherParticipant,
  isUserOnline,
}: ChatListProps) => {
  if (loading) {
    return (
      <div className="px-3 space-y-4 pt-2">
        <ChatListSkeleton count={6} />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center mb-6 text-blue-500/50">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-gray-900 dark:text-white font-bold mb-1">No chats found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] leading-relaxed">
          Connect with friends by clicking the '+' button above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 px-2">
      {chats.map((chat) => {
        const otherParticipant = getOtherParticipant(chat);
        const isActive = activeChat === chat.id;
        const isOnline = otherParticipant ? isUserOnline(otherParticipant.id) : false;

        return (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={isActive}
            isOnline={isOnline}
            otherParticipant={otherParticipant}
            onClick={() => onChatClick(chat)}
          />
        );
      })}
    </div>
  );
};

export default ChatList;
