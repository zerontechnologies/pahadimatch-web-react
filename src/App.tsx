import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastContainer } from './components/ui/toast';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { DashboardLayout, ProtectedRoute, PublicRoute } from './components/layout';
import { Skeleton } from './components/ui/skeleton';

// Lazy load routes for code splitting and better performance
const LandingPage = lazy(() => import('./features/landing').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./features/auth').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./features/auth').then(m => ({ default: m.SignupPage })));
const VerifyOtpPage = lazy(() => import('./features/auth').then(m => ({ default: m.VerifyOtpPage })));
const DashboardPage = lazy(() => import('./features/dashboard').then(m => ({ default: m.DashboardPage })));
const SearchPage = lazy(() => import('./features/search').then(m => ({ default: m.SearchPage })));
const MatchesPage = lazy(() => import('./features/matches').then(m => ({ default: m.MatchesPage })));
const MatchCategoryPage = lazy(() => import('./features/matches').then(m => ({ default: m.MatchCategoryPage })));
const ActivityPage = lazy(() => import('./features/activity').then(m => ({ default: m.ActivityPage })));
const ChatPage = lazy(() => import('./features/chat').then(m => ({ default: m.ChatPage })));
const MembershipPage = lazy(() => import('./features/membership').then(m => ({ default: m.MembershipPage })));
const ProfileCompletionPage = lazy(() => import('./features/profile').then(m => ({ default: m.ProfileCompletionPage })));
const ProfileEditPage = lazy(() => import('./features/profile').then(m => ({ default: m.ProfileEditPage })));
const PhotosPage = lazy(() => import('./features/profile').then(m => ({ default: m.PhotosPage })));
const ProfilePage = lazy(() => import('./features/profile').then(m => ({ default: m.ProfilePage })));
const ViewProfilePage = lazy(() => import('./features/profile').then(m => ({ default: m.ViewProfilePage })));
const SettingsPage = lazy(() => import('./features/settings').then(m => ({ default: m.SettingsPage })));
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const KundaliPage = lazy(() => import('./features/kundali/pages/KundaliPage').then(m => ({ default: m.KundaliPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-2 mt-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  </div>
);

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
              path="/home"
              element={
                <PublicRoute>
                  <Suspense fallback={<PageLoader />}>
                    <LandingPage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Suspense fallback={<PageLoader />}>
                    <LoginPage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Suspense fallback={<PageLoader />}>
                    <SignupPage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/verify-otp"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VerifyOtpPage />
                </Suspense>
              }
            />

            {/* Profile Completion - Standalone (no dashboard layout) */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ProfileCompletionPage />
                  </Suspense>
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
              <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
              <Route path="search" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
              
              {/* Matches */}
              <Route path="matches" element={<Suspense fallback={<PageLoader />}><MatchesPage /></Suspense>} />
              <Route path="matches/:categoryId" element={<Suspense fallback={<PageLoader />}><MatchCategoryPage /></Suspense>} />
              
              {/* Activity */}
              <Route path="activity" element={<Suspense fallback={<PageLoader />}><ActivityPage /></Suspense>} />
              
              {/* Chat */}
              <Route path="chat" element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
              <Route path="chat/:profileId" element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
              
              {/* Profile */}
              <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
              <Route path="profile/edit" element={<Suspense fallback={<PageLoader />}><ProfileEditPage /></Suspense>} />
              <Route path="profile/:profileId" element={<Suspense fallback={<PageLoader />}><ViewProfilePage /></Suspense>} />
              
              {/* Photos */}
              <Route path="photos" element={<Suspense fallback={<PageLoader />}><PhotosPage /></Suspense>} />
              
              {/* Kundali */}
              <Route path="kundali" element={<Suspense fallback={<PageLoader />}><KundaliPage /></Suspense>} />
              <Route path="kundali/create" element={<Suspense fallback={<PageLoader />}><KundaliPage /></Suspense>} />
              <Route path="kundali/edit" element={<Suspense fallback={<PageLoader />}><KundaliPage /></Suspense>} />
              
              {/* Membership */}
              <Route path="membership" element={<Suspense fallback={<PageLoader />}><MembershipPage /></Suspense>} />
              
              {/* Notifications */}
              <Route path="notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>} />
              
              {/* Settings */}
              <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
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