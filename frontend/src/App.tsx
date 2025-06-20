import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store';
import { useUI } from './hooks/useUI';
import { useAuth } from './hooks/useAuth';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import CalendarPage from './pages/CalendarPage';
import EmailPage from './pages/EmailPage';
import NotFoundPage from '@/pages/NotFoundPage';
import CallbackPage from '@/pages/integrations/CallbackPage';

// Components
import NotificationContainer from '@/components/ui/NotificationContainer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AppContent: React.FC = () => {
  const { theme } = useUI();
  const { refreshUser, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Apply theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Try to refresh user data on app start if tokens exist
    const tokens = localStorage.getItem('access_token');
    if (tokens && !isAuthenticated && !loading) {
      refreshUser();
    }
  }, [refreshUser, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password/:uidb64/:token" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><Layout><IntegrationsPage /></Layout></ProtectedRoute>} />
          <Route path="/integrations/callback" element={<ProtectedRoute><CallbackPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
          <Route path="/email" element={<ProtectedRoute><Layout><EmailPage /></Layout></ProtectedRoute>} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Global Components */}
        <NotificationContainer />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default App;