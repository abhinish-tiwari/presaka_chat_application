import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const MessageActions = ({ onCopy, onDelete, canDelete, isOwn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCopy = () => {
    onCopy();
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setIsMenuOpen(false);
  };

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      {/* Three-dot button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-1.5 rounded-full hover:bg-gray-200 transition-all text-gray-500 hover:text-gray-700"
        title="Message options"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden z-50`}>
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-3 transition-colors text-gray-700"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Copy</span>
          </button>

          {canDelete && (
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-3 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

MessageActions.propTypes = {
  onCopy: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canDelete: PropTypes.bool.isRequired,
  isOwn: PropTypes.bool.isRequired,
};

export default MessageActions;

