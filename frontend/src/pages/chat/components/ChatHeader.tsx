import { Avatar, Button, Dropdown, DropdownDivider, DropdownItem } from '@components/ui';
import { formatLastSeen } from '@utils/formatters';
import { User } from '@/types';

export type ConversationAction = 'copy-phone' | 'clear-chat' | 'block-user' | 'delete-chat';

interface ChatHeaderProps {
  otherUser: User | null;
  isOtherUserOnline: boolean;
  isTyping: boolean;
  onBack: () => void;
  onConversationAction: (action: ConversationAction) => void;
}

const ChatHeader = ({
  otherUser,
  isOtherUserOnline,
  isTyping,
  onBack,
  onConversationAction,
}: ChatHeaderProps) => {
  const actionMenuTrigger = (
    <Button
      variant="ghost"
      className="rounded-full w-10 h-10 p-0 text-gray-500"
      title="Conversation actions"
      aria-label="Conversation actions"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </Button>
  );

  return (
    <header className="flex-shrink-0 px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
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
            {otherUser?.name || otherUser?.phone || 'Chat'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isTyping ? (
              <span className="text-blue-500 font-medium animate-pulse">typing...</span>
            ) : isOtherUserOnline ? (
              'Online'
            ) : otherUser?.lastSeen ? (
              `Last seen ${formatLastSeen(otherUser.lastSeen)}`
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-gray-500" title="Voice call" aria-label="Voice call">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </Button>
        <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-gray-500" title="Video call" aria-label="Video call">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </Button>
        <Dropdown trigger={actionMenuTrigger} align="right" className="flex-shrink-0">
          <DropdownItem
            onClick={() => onConversationAction('copy-phone')}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h4a2 2 0 012 2v2H7v12H5a2 2 0 01-2-2V5zm8 0a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2V5z" />
              </svg>
            }
          >
            Copy number
          </DropdownItem>
          <DropdownItem
            onClick={() => onConversationAction('clear-chat')}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12h8l1-12" />
              </svg>
            }
          >
            Clear chat
          </DropdownItem>
          <DropdownItem
            onClick={() => onConversationAction('block-user')}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8l8 8" />
              </svg>
            }
          >
            Block user
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem
            onClick={() => onConversationAction('delete-chat')}
            danger
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Delete chat
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};

export default ChatHeader;
