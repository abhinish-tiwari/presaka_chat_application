import { useState } from 'react';
import PropTypes from 'prop-types';
import { userService } from '@services/userService';
import { chatService } from '@services/chatService';
import toast from 'react-hot-toast';

const NewChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (query) => {
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

  const handleCreateChat = async (userId) => {
    setCreating(true);
    try {
      const response = await chatService.createPrivateChat(userId);
      toast.success('Chat created successfully!');
      onChatCreated(response.chat);
      onClose();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Create chat error:', error);
      toast.error(error.response?.data?.message || 'Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search by phone number or name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleCreateChat(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {user.name?.[0] || user.phone?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                  </div>
                  {creating && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 3 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Type at least 3 characters to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

NewChatModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChatCreated: PropTypes.func.isRequired,
};

export default NewChatModal;

