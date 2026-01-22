import { Outlet } from 'react-router-dom';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  // Initialize WebSocket connection for all protected routes
  useWebSocket();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

