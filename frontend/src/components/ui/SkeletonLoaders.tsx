import { Skeleton } from './Skeleton';

/**
 * Skeleton loader for chat list items
 */
export const ChatItemSkeleton = () => {
  return (
    <div className="p-3 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <Skeleton variant="circular" width={48} height={48} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <Skeleton variant="text" width="60%" height={16} className="mb-2" />
          {/* Last message */}
          <Skeleton variant="text" width="80%" height={14} />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for multiple chat items
 */
export const ChatListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ChatItemSkeleton key={index} />
      ))}
    </>
  );
};

/**
 * Skeleton loader for message bubbles
 */
export const MessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Message bubble */}
        <Skeleton 
          variant="rounded" 
          width={Math.random() * 100 + 150} 
          height={60} 
        />
        {/* Timestamp */}
        <Skeleton variant="text" width={60} height={12} />
      </div>
    </div>
  );
};

/**
 * Skeleton loader for multiple messages
 */
export const MessageListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} isOwn={index % 2 === 0} />
      ))}
    </div>
  );
};

/**
 * Skeleton loader for user search results
 */
export const UserSearchSkeleton = () => {
  return (
    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <Skeleton variant="circular" width={40} height={40} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <Skeleton variant="text" width="50%" height={16} className="mb-1" />
          {/* Phone */}
          <Skeleton variant="text" width="70%" height={14} />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for multiple user search results
 */
export const UserSearchListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <UserSearchSkeleton key={index} />
      ))}
    </>
  );
};

/**
 * Skeleton loader for profile card
 */
export const ProfileSkeleton = () => {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center">
        {/* Avatar */}
        <Skeleton variant="circular" width={96} height={96} className="mb-4" />
        {/* Name */}
        <Skeleton variant="text" width={150} height={24} className="mb-2" />
        {/* Phone */}
        <Skeleton variant="text" width={120} height={16} />
      </div>
    </div>
  );
};

/**
 * Skeleton loader for card content
 */
export const CardSkeleton = () => {
  return (
    <div className="p-6">
      {/* Title */}
      <Skeleton variant="text" width="40%" height={24} className="mb-4" />
      {/* Content lines */}
      <Skeleton variant="text" lines={3} />
    </div>
  );
};

