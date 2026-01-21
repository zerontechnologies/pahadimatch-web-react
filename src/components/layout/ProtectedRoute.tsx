import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectCurrentUser } from '@/store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileComplete?: boolean;
}

export function ProtectedRoute({ children, requireProfileComplete = false }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  if (!isAuthenticated) {
    // Redirect to home page if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if profile completion is required
  if (requireProfileComplete && user && !user.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: React.ReactNode;
  allowAuthenticated?: boolean; // Allow authenticated users to see the page (e.g., landing page)
  redirectIfAuthenticated?: boolean; // Redirect authenticated users away (e.g., login/signup)
}

export function PublicRoute({ 
  children, 
  allowAuthenticated = false,
  redirectIfAuthenticated = false 
}: PublicRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  if (isAuthenticated) {
    // If redirectIfAuthenticated is true, redirect to dashboard
    if (redirectIfAuthenticated) {
      if (user && !user.isProfileComplete) {
        return <Navigate to="/complete-profile" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
    // If allowAuthenticated is true, let them see the page
    if (allowAuthenticated) {
      return <>{children}</>;
    }
    // Default: redirect authenticated users to dashboard
    if (user && !user.isProfileComplete) {
      return <Navigate to="/complete-profile" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

