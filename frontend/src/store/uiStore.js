import { create } from 'zustand';

export const useUIStore = create((set) => ({
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

