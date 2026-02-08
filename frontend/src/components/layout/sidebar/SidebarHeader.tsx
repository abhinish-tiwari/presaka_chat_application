import { Avatar, Button, Input } from '@components/ui';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openProfileModal, openNewChatModal } from '@store/uiStore';
import { useState } from 'react';
import SidebarMoreMenu from './SidebarMoreMenu';

interface SidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SidebarHeader = ({ searchQuery, onSearchChange }: SidebarHeaderProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
      {/* User Info & Actions */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => dispatch(openProfileModal())}
        >
          <div className="relative">
            <Avatar
              alt={user?.name || 'User'}
              fallback={user?.name?.[0] || user?.phone?.[0] || 'U'}
              size="md"
              className="rounded-full ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all duration-300 shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px] leading-tight text-sm">
              {user?.name || 'Set Name'}
            </h1>
            <p className="text-[10px] text-green-500 font-medium uppercase tracking-wider">Online</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(openNewChatModal())}
            className="rounded-xl w-9 h-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            title="New Chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          <SidebarMoreMenu showMenu={showMoreMenu} onMenuToggle={setShowMoreMenu} />
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search chats, people..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        size="sm"
        fullWidth
        className="bg-gray-50/50 dark:bg-gray-800/50 border-none rounded-xl focus:ring-1"
        leftIcon={
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />
    </div>
  );
};

export default SidebarHeader;
