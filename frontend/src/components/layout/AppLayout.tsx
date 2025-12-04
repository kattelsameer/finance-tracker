import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DemoBanner } from './DemoBanner';
import { NotificationCenter } from '../NotificationCenter';
import { notificationService } from '../../services/notification.service';
import { navigationItems } from './navigation-config';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        if (isMounted.current) {
          setUnreadCount(count);
        }
      } catch {
        // Silently handle error for notification count
      }
    };

    // Initial fetch
    fetchUnreadCount();
    
    // Set up polling interval
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
    
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  const refreshUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently handle error
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleOpenNotificationSettings = () => {
    setNotificationCenterOpen(false);
    navigate('/settings?tab=notifications');
  };

  // Get page title based on current path
  const getPageTitle = () => {
    if (location.pathname === '/settings') return 'Settings';
    const currentPage = navigationItems.find(item => item.href === location.pathname);
    return currentPage?.name || 'Finance Tracker';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      <DemoBanner />
      
      {/* Mobile Sidebar */}
      <Sidebar
        isMobile
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="main-content-area flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <Header
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={() => setNotificationCenterOpen(true)}
          unreadCount={unreadCount}
        />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => {
          setNotificationCenterOpen(false);
          void refreshUnreadCount();
        }}
        onOpenSettings={handleOpenNotificationSettings}
      />
    </div>
  );
}
