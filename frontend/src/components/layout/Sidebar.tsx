import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { useChatStore } from '@store/chatStore';
import { chatService } from '@services/chatService';
import NewChatModal from '@components/chat/NewChatModal';
import ProfileModal from '@components/profile/ProfileModal';
import toast from 'react-hot-toast';
import { Chat } from '@/types';

type TabType = 'chats' | 'status' | 'settings';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { chats, setChats, activeChat } = useChatStore();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('chats');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await chatService.getChats();
      setChats(response.chats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleChatCreated = (newChat: Chat) => {
    setChats([newChat, ...chats]);
    navigate(`/chat/${newChat.id}`);
  };

  const filteredChats = chats.filter(chat => {
    const participant = chat.participants?.[0];
    const name = participant?.name?.toLowerCase() || '';
    const phone = participant?.phone?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-semibold hover:opacity-90 transition-opacity"
              title="Profile"
            >
              {user?.name?.[0] || user?.phone?.[0] || 'U'}
            </button>
            <div>
              <h1 className="text-lg font-medium">Preṣaka</h1>
              {user?.name && (
                <p className="text-xs text-blue-100 opacity-90">{user.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="hover:bg-blue-600 p-2 rounded-full transition-colors"
              title="New Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="hover:bg-blue-600 p-2 rounded-full transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'chats'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chats</span>
          </div>
          {activeTab === 'chats' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'status'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Status</span>
          </div>
          {activeTab === 'status' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'settings'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </div>
          {activeTab === 'settings' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      {/* Search Bar - Only show for chats */}
      {activeTab === 'chats' && (
        <div className="p-2 bg-white border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <>
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">
                  {searchQuery ? 'No chats found' : 'No chats yet. Start a new conversation!'}
                </p>
              </div>
            ) : (
              <div>
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className={`p-3 cursor-pointer transition-colors border-b border-gray-100 ${
                      activeChat === chat.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {chat.participants?.[0]?.name?.[0] || chat.participants?.[0]?.phone?.[0] || '?'}
                          </span>
                        </div>
                        {/* Online indicator */}
                        {chat.participants?.[0]?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat.participants?.[0]?.name || chat.participants?.[0]?.phone || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-1">
                          {/* Show status icon if last message is from current user */}
                          {chat.lastMessage?.senderId === user?.id && (
                            <span className="text-xs flex-shrink-0">
                              {chat.lastMessage?.status === 'sending' && (
                                <span className="text-gray-400">⏳</span>
                              )}
                              {chat.lastMessage?.status === 'sent' && (
                                <span className="text-gray-400">✓</span>
                              )}
                              {chat.lastMessage?.status === 'delivered' && (
                                <span className="text-gray-500">✓✓</span>
                              )}
                              {chat.lastMessage?.status === 'read' && (
                                <span className="text-blue-500">✓✓</span>
                              )}
                            </span>
                          )}
                          <p className="text-sm text-gray-500 truncate">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">My Status</h3>
              <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {user?.name?.[0] || user?.phone?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">My Status</p>
                  <p className="text-xs text-gray-500">Tap to add status update</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Updates</h3>
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm">No recent updates</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-4">
            <div className="space-y-1">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Profile</p>
                  <p className="text-xs text-gray-500">Update your profile information</p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-500">Manage notification preferences</p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Privacy</p>
                  <p className="text-xs text-gray-500">Control your privacy settings</p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Help</p>
                  <p className="text-xs text-gray-500">Get help and support</p>
                </div>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-600">Logout</p>
                  <p className="text-xs text-red-400">Sign out of your account</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Sidebar;

