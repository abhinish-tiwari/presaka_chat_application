import { createSlice } from '@reduxjs/toolkit';

// UI State Interface
interface UIState {
  isSidebarOpen: boolean;
  isProfileModalOpen: boolean;
  isNewChatModalOpen: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  isSidebarOpen: true,
  isProfileModalOpen: false,
  isNewChatModalOpen: false,
  theme: 'light',
};

// UI Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openProfileModal: (state) => {
      state.isProfileModalOpen = true;
    },
    closeProfileModal: (state) => {
      state.isProfileModalOpen = false;
    },
    openNewChatModal: (state) => {
      state.isNewChatModalOpen = true;
    },
    closeNewChatModal: (state) => {
      state.isNewChatModalOpen = false;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

// Export actions
export const {
  toggleSidebar,
  openProfileModal,
  closeProfileModal,
  openNewChatModal,
  closeNewChatModal,
  setTheme,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;

