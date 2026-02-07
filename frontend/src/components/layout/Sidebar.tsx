import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { logout } from '@store/authStore';
import { setChats, setActiveChat } from '@store/chatStore';
import { chatService } from '@services/chatService';
import NewChatModal from '@components/chat/NewChatModal';
import ProfileModal from '@components/profile/ProfileModal';
import toast from 'react-hot-toast';
import { Chat } from '@/types';
import { ChatListSkeleton, Avatar, Badge, Button, Input } from '@components/ui';
import { 
  openProfileModal, 
  closeProfileModal, 
  openNewChatModal, 
  closeNewChatModal 
} from '@store/uiStore';
import { formatMessageTime } from '@/utils/formatters';

type TabType = 'chats' | 'status' | 'settings';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const chats = useAppSelector((state) => state.chat.chats);
  const activeChat = useAppSelector((state) => state.chat.activeChat);
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);
  const { isProfileModalOpen, isNewChatModalOpen } = useAppSelector((state) => state.ui);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [loading, setLoading] = useState(true);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMoreMenu && !target.closest('.more-menu-container')) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChats();
      dispatch(setChats(response.chats));
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const otherParticipant = chat.participants?.find((p) => p.id !== user?.id);
      const nameMatch = otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = otherParticipant?.phone?.includes(searchQuery);
      return nameMatch || phoneMatch;
    });
  }, [chats, searchQuery, user?.id]);

  const handleChatClick = (chat: Chat) => {
    dispatch(setActiveChat(chat.id));
    navigate(`/chat/${chat.id}`);
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants?.find((p) => p.id !== user?.id);
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* Header - Glassmorphism */}
      <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
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
                className="ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all duration-300 shadow-sm"
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
            <div className="relative group more-menu-container">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl w-9 h-9 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                title="More"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreMenu(!showMoreMenu);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
              {/* Dropdown Menu */}
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={() => {
                      dispatch(openProfileModal());
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Search chats, people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Tabs */}
      <div className="flex px-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        {[
          { id: 'chats', label: 'Chats', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
          { id: 'status', label: 'Status', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { id: 'settings', label: 'Settings', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-3 px-1 text-[11px] font-semibold transition-all relative flex flex-col items-center gap-1.5 group ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'group-hover:bg-gray-50 dark:group-hover:bg-gray-800'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
            </div>
            {/* <span>{tab.label}</span> */}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-1px_4px_rgba(37,99,235,0.4)]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        <AnimatePresence mode="wait">
          {activeTab === 'chats' && (
            <motion.div
              key="chats-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="px-3 space-y-4 pt-2">
                  <ChatListSkeleton count={6} />
                </div>
              ) : filteredChats.length > 0 ? (
                <div className="space-y-0.5 px-2">
                  {filteredChats.map((chat) => {
                    const otherParticipant = getOtherParticipant(chat);
                    const isActive = activeChat === chat.id;
                    const isOnline = otherParticipant ? isUserOnline(otherParticipant.id) : false;

                    return (
                      <motion.div
                        key={chat.id}
                        onClick={() => handleChatClick(chat)}
                        className={`group relative flex items-center px-3 py-3.5 cursor-pointer rounded-2xl transition-all duration-300 ${
                          isActive
                              ? 'bg-blue-500/15 dark:bg-blue-500/20 border-l-4 border-blue-500 shadow-sm hover:shadow-md'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800/60 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="relative flex-shrink-0 mr-3.5  overflow-hidden">
                          <Avatar
                            alt={otherParticipant?.name || 'User'}
                            fallback={otherParticipant?.name?.[0] || otherParticipant?.phone?.[0] || '?'}
                            size="md"
                            status={isOnline ? 'online' : 'offline'}
                            className={`transition-transform duration-300 ${isActive ? 'scale-100 ring-2 ring-blue-500/30' : 'group-hover:scale-100'}`}
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
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center mb-6 text-blue-500/50">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-bold mb-1">No chats found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] leading-relaxed">
                    Connect with friends by clicking the '+' button above.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'status' && (
            <motion.div
              key="status-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="px-6 py-8 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 mx-auto mb-6 flex items-center justify-center p-1 shadow-xl">
                   <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden border-4 border-transparent bg-clip-padding">
                   <Avatar alt={user?.name || ""} size="xl" className="rounded-full w-full h-full" />
                 </div>
                 <div className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-1.5 border-2 border-white dark:border-gray-900 shadow-md">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                   </svg>
                 </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">My Status</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[220px] mx-auto">
                Share what's on your mind with your contacts through stories.
              </p>
              
              <div className="text-left space-y-4 opacity-50 select-none grayscale cursor-not-allowed">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-2">Recent Updates</p>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                  <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-2 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="px-3 py-3 space-y-4"
            >
              <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar size="lg" alt={user?.name || ""} className="rounded-full shadow-md" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{user?.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
                    <button 
                      onClick={() => dispatch(openProfileModal())}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 hover:underline"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <button 
                    onClick={() => dispatch(openProfileModal())}
                    className="w-full flex items-center justify-between p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Account Settings</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button 
                    className="w-full flex items-center justify-between p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Notifications</span>
                    </div>
                    <Badge variant="default" className="bg-gray-100 dark:bg-gray-800 text-[10px] uppercase font-bold px-2 py-0.5">Soon</Badge>
                  </button>
                </div>
              </div>

              <div className="space-y-2 px-1">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-semibold text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
                <div className="text-center pt-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.15em]">Preṣaka v1.0.0</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => dispatch(closeProfileModal())}
      />
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => dispatch(closeNewChatModal())}
        onChatCreated={(chat) => {
          handleChatClick(chat);
          loadChats();
        }}
      />
    </div>
  );
};

export default Sidebar;
