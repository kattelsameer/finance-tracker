import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tag,
  PieChart,
  FolderTree,
  Target,
  Search,
  Repeat,
  FileSpreadsheet,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
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

export const mainNavItems = navigationItems.slice(0, 3);
export const toolsNavItems = navigationItems.slice(3, 6);
export const manageNavItems = navigationItems.slice(6, 10);
export const settingsNavItems = navigationItems.slice(10);
