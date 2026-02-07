import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { updateUser, logout } from '@store/authStore';
import { userService } from '@services/userService';
import { SocketProvider } from '@/contexts/SocketContext';

// Pages
import LoginPage from '@pages/auth/LoginPage';
import HomePage from '@pages/home/HomePage';
import ChatPage from '@pages/chat/ChatPage';
import ComponentsShowcase from '@pages/ComponentsShowcase';
import SkeletonShowcase from '@pages/SkeletonShowcase';

// Components
import ProtectedRoute from '@components/auth/ProtectedRoute';
import Layout from '@components/layout/Layout';

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const location = useLocation();
  const navigate = useNavigate();

  // If access token expires, immediately force logout and go to login
  useEffect(() => {
    if (!accessToken) return;

    const expiryTime = getTokenExpiry(accessToken);
    if (!expiryTime) {
      dispatch(logout());
      navigate('/login', { replace: true });
      return;
    }

    const now = Date.now();
    if (expiryTime <= now) {
      dispatch(logout());
      navigate('/login', { replace: true });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(logout());
      navigate('/login', { replace: true });
    }, expiryTime - now);

    return () => window.clearTimeout(timeoutId);
  }, [accessToken, dispatch, navigate]);

  // Fetch latest user data on app load
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const response = await userService.getMe();
          dispatch(updateUser(response.user));
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, dispatch]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      {/* Components Showcase - Public route for demo */}
      <Route path="/showcase" element={<ComponentsShowcase />} />
      <Route path="/skeletons" element={<SkeletonShowcase />} />

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
    </AnimatePresence>
  );
}

export default App;
