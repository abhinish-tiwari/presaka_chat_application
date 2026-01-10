import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { userService } from '@services/userService';
import { SocketProvider } from '@/contexts/SocketContext';

// Pages
import LoginPage from '@pages/auth/LoginPage';
import HomePage from '@pages/home/HomePage';
import ChatPage from '@pages/chat/ChatPage';

// Components
import ProtectedRoute from '@components/auth/ProtectedRoute';
import Layout from '@components/layout/Layout';

function App() {
  const { isAuthenticated, updateUser } = useAuthStore();

  // Fetch latest user data on app load
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const response = await userService.getMe();
          updateUser(response.user);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, updateUser]);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <Layout />
            </SocketProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="chat/:chatId" element={<ChatPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

