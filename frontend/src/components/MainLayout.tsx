import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tag,
  PieChart,
  FolderTree,
  Target,
  LogOut,
  Menu,
  X,
  Search,
  Repeat,
  FileSpreadsheet,
  Bell,
  Settings,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { NotificationCenter } from './NotificationCenter';
import { notificationService } from '../services/notification.service';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Recurring', href: '/recurring-transactions', icon: Repeat },
  { name: 'Import/Export', href: '/import-export', icon: FileSpreadsheet },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Tags', href: '/tags', icon: Tag },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MainLayout() {
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
    // Initial load and polling for notification count is a valid use case
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const currentPage = navigation.find(item => item.href === location.pathname);
    return currentPage?.name || 'Finance Tracker';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 lg:hidden bg-black/50 cursor-default border-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Finance Tracker</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {/* Main navigation group */}
            <div className="space-y-1">
              {navigation.slice(0, 3).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-5 mx-2 border-t border-gray-200"></div>

            {/* Tools group */}
            <div className="mb-3 px-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</span>
            </div>
            <div className="space-y-1">
              {navigation.slice(3, 6).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-5 mx-2 border-t border-gray-200"></div>

            {/* Management group */}
            <div className="mb-3 px-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage</span>
            </div>
            <div className="space-y-1">
              {navigation.slice(6, 10).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-5 mx-2 border-t border-gray-200"></div>

            {/* Settings */}
            <div className="space-y-1">
              {navigation.slice(10).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              <Link 
                to="/settings?tab=user" 
                onClick={() => setSidebarOpen(false)}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Link>
              <Link to="/settings?tab=user" onClick={() => setSidebarOpen(false)} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Desktop sidebar header */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200">
            <div className="p-2.5 bg-blue-600 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Finance Tracker</span>
          </div>

          {/* Desktop navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {/* Main navigation group */}
            <div className="space-y-1">
              {navigation.slice(0, 3).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-5 mx-2 border-t border-gray-200"></div>

            {/* Tools group */}
            <div className="mb-3 px-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</span>
            </div>
            <div className="space-y-1">
              {navigation.slice(3, 6).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-5 mx-2 border-t border-gray-200"></div>

            {/* Management group */}
            <div className="mb-3 px-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Manage</span>
            </div>
            <div className="space-y-1">
              {navigation.slice(6, 10).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-5 mx-2 border-t border-gray-200"></div>

            {/* Settings */}
            <div className="space-y-1">
              {navigation.slice(10).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-gray-200 shadow-sm">
              <Link 
                to="/settings?tab=user"
                className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Link>
              <Link to="/settings?tab=user" className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - lg breakpoint = 1024px, sidebar width = 256px */}
      <div className="main-content-area flex flex-col min-h-screen overflow-x-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button and title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 truncate">{getPageTitle()}</h1>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotificationCenterOpen(true)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 min-w-[16px] bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

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
