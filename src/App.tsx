import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastContainer } from './components/ui/toast';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { DashboardLayout, ProtectedRoute, PublicRoute } from './components/layout';

// Auth Pages
import { LoginPage, SignupPage, VerifyOtpPage } from './features/auth';

// Feature Pages
import { DashboardPage } from './features/dashboard';
import { SearchPage } from './features/search';
import { MatchesPage, MatchCategoryPage } from './features/matches';
import { ActivityPage } from './features/activity';
import { ChatPage } from './features/chat';
import { MembershipPage } from './features/membership';

// Import Profile Pages
import { ProfileCompletionPage, ProfileEditPage, PhotosPage, ProfilePage, ViewProfilePage } from './features/profile';
// Import Settings Page
import { SettingsPage } from './features/settings';
// Import Notifications Page
import { NotificationsPage } from './features/notifications/pages/NotificationsPage';
// Import Kundali Page
import { KundaliPage } from './features/kundali/pages/KundaliPage';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-text-secondary mb-8">Page not found</p>
        <a href="/dashboard" className="text-primary hover:underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={<VerifyOtpPage />}
            />

            {/* Profile Completion - Standalone (no dashboard layout) */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <ProfileCompletionPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes with Dashboard Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute requireProfileComplete>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="search" element={<SearchPage />} />
              
              {/* Matches */}
              <Route path="matches" element={<MatchesPage />} />
              <Route path="matches/:categoryId" element={<MatchCategoryPage />} />
              
              {/* Activity */}
              <Route path="activity" element={<ActivityPage />} />
              
              {/* Chat */}
              <Route path="chat" element={<ChatPage />} />
              <Route path="chat/:profileId" element={<ChatPage />} />
              
              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/edit" element={<ProfileEditPage />} />
              <Route path="profile/:profileId" element={<ViewProfilePage />} />
              
              {/* Photos */}
              <Route path="photos" element={<PhotosPage />} />
              
              {/* Kundali */}
              <Route path="kundali" element={<KundaliPage />} />
              <Route path="kundali/create" element={<KundaliPage />} />
              <Route path="kundali/edit" element={<KundaliPage />} />
              
              {/* Membership */}
              <Route path="membership" element={<MembershipPage />} />
              
              {/* Notifications */}
              <Route path="notifications" element={<NotificationsPage />} />
              
              {/* Settings */}
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
