import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
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

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      console.error('Failed to load unread count');
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

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
          loadUnreadCount();
        }}
        onOpenSettings={handleOpenNotificationSettings}
      />
    </div>
  );
}
