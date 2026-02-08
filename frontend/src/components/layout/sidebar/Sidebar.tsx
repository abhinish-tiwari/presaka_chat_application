import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { setChats, setActiveChat } from "@store/chatStore";
import { chatService } from "@services/chatService";
import NewChatModal from "@components/chat/NewChatModal";
import ProfileModal from "@components/profile/ProfileModal";
import toast from "react-hot-toast";
import { Chat } from "@/types";
import { closeProfileModal, closeNewChatModal } from "@store/uiStore";
import SidebarHeader from "./SidebarHeader";
import SidebarTabs from "./SidebarTabs";
import ChatList from "./ChatList";
import StatusTab from "./StatusTab";
import SettingsTab from "./SettingsTab";

type TabType = "chats" | "status" | "settings";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const chats = useAppSelector((state) => state.chat.chats);
  const activeChat = useAppSelector((state) => state.chat.activeChat);
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);
  const { isProfileModalOpen, isNewChatModalOpen } = useAppSelector((state) => state.ui);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("chats");
  const [loading, setLoading] = useState(true);

  // Load chats on mount
  useEffect(() => {
	loadChats();
  }, []);

  const loadChats = async () => {
    try {
		setLoading(true);
		const response = await chatService.getChats();
		dispatch(setChats(response.chats));
    } catch (error) {
		console.error("Error loading chats:", error);
		toast.error("Failed to load chats");
    } finally {
      	setLoading(false);
    }
  };

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
		const otherParticipant = chat.participants?.find((p) => p?.id !== user?.id);
		const nameMatch = otherParticipant?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase());
		const phoneMatch = otherParticipant?.phone?.includes(searchQuery);
		return nameMatch || phoneMatch;
    });
  }, [chats, searchQuery, user?.id]);

  // Handle chat selection
  const handleChatClick = (chat: Chat) => {
		dispatch(setActiveChat(chat.id));
		navigate(`/chat/${chat.id}`);
  };

  // Helper functions
  const getOtherParticipant = (chat: Chat) => chat?.participants?.find((p) => p.id !== user?.id);
  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* Header */}
      <SidebarHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Tabs Navigation */}
      <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        <AnimatePresence mode="wait">
          {activeTab === "chats" && (
            <motion.div
				key="chats-tab"
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -10 }}
				transition={{ duration: 0.2 }}>
            	<ChatList
					chats={filteredChats}
					loading={loading}
					activeChat={activeChat}
					onlineUsers={onlineUsers}
					onChatClick={handleChatClick}
					getOtherParticipant={getOtherParticipant}
					isUserOnline={isUserOnline}
              	/>
            </motion.div>
          )}

          {activeTab === "status" && (
            <motion.div
				key="status-tab"
				initial={{ opacity: 0, x: 10 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: 10 }}>
              	<StatusTab />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
				key="settings-tab"
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}>
              	<SettingsTab />
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
