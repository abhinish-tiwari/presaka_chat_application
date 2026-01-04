import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { useChatStore } from '@store/chatStore';
import { chatService } from '@services/chatService';
import NewChatModal from '@components/chat/NewChatModal';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { chats, setChats, activeChat, isUserOnline } = useChatStore();
  const [showNewChatModal, setShowNewChatModal] = useState(false);

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

  const handleChatCreated = (newChat) => {
    setChats([newChat, ...chats]);
    navigate(`/chat/${newChat.id}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Preṣaka</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">{user?.phone}</p>

        {/* New Chat Button */}
        <button
          onClick={() => setShowNewChatModal(true)}
          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeChat === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {chat.members?.[0]?.name?.[0] || '?'}
                      </span>
                    </div>
                    {/* Online indicator */}
                    {chat.members?.[0]?.id && isUserOnline(chat.members[0].id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chat.members?.[0]?.name || chat.members?.[0]?.phone || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default Sidebar;

