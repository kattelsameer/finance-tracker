import { Link, useLocation } from 'react-router-dom';
import { Wallet, LogOut, X } from 'lucide-react';
import { mainNavItems, toolsNavItems, manageNavItems, settingsNavItems } from './navigation-config';

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  user: {
    displayName?: string | null;
    username?: string;
    email?: string;
  } | null;
  onLogout: () => void;
}

export function Sidebar({ isMobile = false, isOpen = true, onClose, user, onLogout }: Readonly<SidebarProps>) {
  const location = useLocation();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const renderNavGroup = (items: typeof mainNavItems) => (
    <>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={isMobile ? onClose : undefined}
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
    </>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">Finance Tracker</span>
            {isDemoMode && (
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm border border-amber-200 leading-none">
                Demo
              </span>
            )}
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 min-h-0 scrollbar-hide">
        {renderNavGroup(mainNavItems)}
        
        <div className="my-3 mx-2 border-t border-gray-100"></div>
        {renderNavGroup(toolsNavItems)}
        
        <div className="my-3 mx-2 border-t border-gray-100"></div>
        {renderNavGroup(manageNavItems)}
        
        <div className="my-3 mx-2 border-t border-gray-100"></div>
        {renderNavGroup(settingsNavItems)}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Link 
            to="/settings?tab=user" 
            onClick={isMobile ? onClose : undefined}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Link>
          <Link 
            to="/settings?tab=user" 
            onClick={isMobile ? onClose : undefined}
            className="flex-1 min-w-0"
          >
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || user?.username}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </Link>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600 flex-shrink-0"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 lg:hidden bg-black/50 cursor-default border-none"
            onClick={onClose}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
      {sidebarContent}
    </div>
  );
}
