import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onNotificationClick: () => void;
  unreadCount?: number;
}

export function Header({ title, onMenuClick, onNotificationClick, unreadCount = 0 }: Readonly<HeaderProps>) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button and title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNotificationClick}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Notifications"
            aria-label="Notifications"
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
  );
}
