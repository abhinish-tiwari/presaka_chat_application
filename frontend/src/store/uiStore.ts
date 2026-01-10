import { create } from 'zustand';
import { UIState } from '@/types';

interface ExtendedUIState extends UIState {
  isProfileModalOpen: boolean;
  isNewChatModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openNewChatModal: () => void;
  closeNewChatModal: () => void;
}

export const useUIStore = create<ExtendedUIState>((set) => ({
  isSidebarOpen: true,
  isProfileModalOpen: false,
  isNewChatModalOpen: false,
  theme: 'light',

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  openProfileModal: () => set({ isProfileModalOpen: true }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),
  
  openNewChatModal: () => set({ isNewChatModalOpen: true }),
  closeNewChatModal: () => set({ isNewChatModalOpen: false }),
  
  setTheme: (theme) => set({ theme }),
}));

