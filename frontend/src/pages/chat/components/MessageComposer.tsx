import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import EmojiPicker from '@/components/EmojiPicker';
import { Button, Input } from '@components/ui';
import { Message } from '@/types';

interface MessageComposerProps {
  message: string;
  setMessage: (v: string) => void;
  onSend: (e: React.FormEvent) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (v: boolean) => void;
  replyingTo: Message | null;
  setReplyingTo: (m: Message | null) => void;
  editingMessage: Message | null;
  setEditingMessage: (m: Message | null) => void;
  handleTyping: () => void;
  chatId?: string;
}

const MessageComposer = ({
  message,
  setMessage,
  onSend,
  showEmojiPicker,
  setShowEmojiPicker,
  replyingTo,
  setReplyingTo,
  editingMessage,
  setEditingMessage,
  handleTyping,
  chatId,
}: MessageComposerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on component mount (when chat opens)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear editor when switching conversations
  useEffect(() => {
    setMessage('');
    setReplyingTo(null);
    setEditingMessage(null);
    inputRef.current?.focus();
  }, [chatId, setMessage, setReplyingTo, setEditingMessage]);

  // Auto-focus after emoji picker closes
  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  return (
    <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-10 transition-all duration-300">
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-blue-500 flex items-center justify-between"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Replying to</p>
              <p className="text-sm truncate text-gray-600 dark:text-gray-300">{replyingTo.content}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSend} className="flex items-center gap-2 max-w-6xl mx-auto">
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 text-gray-500 hover:text-blue-500"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-3 left-0">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            placeholder={editingMessage ? 'Edit message...' : 'Type a message...'}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            fullWidth
            className="bg-gray-50 dark:bg-gray-800 border-none shadow-inner focus:ring-1"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className={`rounded-full shadow-lg transition-all duration-300 ${message.trim() ? 'w-12 h-12 p-0 scale-100' : 'w-0 h-0 p-0 overflow-hidden scale-0'}`}
          disabled={!message.trim()}
        >
          <svg className="w-5 h-5 rotate-45 -mt-0.5 -mr-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </Button>
      </form>
    </div>
  );
};

export default MessageComposer;
