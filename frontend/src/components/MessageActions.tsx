import { Dropdown, DropdownItem, DropdownDivider } from '@components/ui';

interface MessageActionsProps {
  onCopy: () => void;
  onDelete: () => void;
  onReply: () => void;
  onEdit: () => void;
  onReaction: (emoji: string) => void;
  canDelete: boolean;
  isOwn: boolean;
}

const MessageActions = ({ 
  onCopy, 
  onDelete, 
  onReply, 
  onEdit, 
  onReaction, 
  canDelete, 
  isOwn 
}: MessageActionsProps) => {
  const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const trigger = (
    <button
      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      title="Message options"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    </button>
  );

  return (
    <Dropdown 
      trigger={trigger} 
      align={isOwn ? 'right' : 'left'}
      className="flex-shrink-0"
    >
      {/* Quick Reactions */}
      <div className="flex items-center justify-around px-2 pb-2 mb-1 border-b border-gray-100 dark:border-gray-700">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReaction(emoji)}
            className="text-xl hover:scale-125 transition-transform p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {emoji}
          </button>
        ))}
      </div>

      <DropdownItem
        onClick={onReply}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        }
      >
        Reply
      </DropdownItem>

      {isOwn && (
        <DropdownItem
          onClick={onEdit}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        >
          Edit
        </DropdownItem>
      )}

      <DropdownItem
        onClick={onCopy}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        }
      >
        Copy Link
      </DropdownItem>

      {canDelete && (
        <>
          <DropdownDivider />
          <DropdownItem
            onClick={onDelete}
            danger
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Delete
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
};

export default MessageActions;
