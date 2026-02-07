import { useState } from 'react';
import { userService } from '@services/userService';
import { chatService } from '@services/chatService';
import toast from 'react-hot-toast';
import { Chat, User } from '@/types';
import { Modal, Input, Avatar, Spinner, UserSearchListSkeleton } from '@components/ui';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chat: Chat) => void;
}

const NewChatModal = ({ isOpen, onClose, onChatCreated }: NewChatModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await userService.searchUsers(query);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (userId: string) => {
    if (creating) return;
    
    setCreating(true);
    try {
      const response = await chatService.createPrivateChat(userId);
      toast.success('Chat created successfully!');
      onChatCreated(response.chat);
      onClose();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      console.error('Create chat error:', error);
      toast.error(error.response?.data?.message || 'Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Chat"
      size="md"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search by phone number or name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          fullWidth
          autoFocus
          leftIcon={
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto -mx-6">
          {loading ? (
            <div className="px-6">
              <UserSearchListSkeleton count={4} />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center justify-between transition-colors duration-200"
                  onClick={() => handleCreateChat(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      alt={user.name || 'User'}
                      fallback={user.name?.[0] || user.phone?.[0] || '?'}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                  {creating && (
                    <Spinner size="sm" variant="primary" />
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 3 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No users found</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Type at least 3 characters to search</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NewChatModal;
