import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { useSecondaryCurrency } from '../contexts/SecondaryCurrencyContext';
import { authService } from '../services/auth.service';
import { notificationService } from '../services/notification.service';
import { CurrencyChangeModal } from '../components/ui/CurrencyChangeModal';

import { DateRangeFilter } from '../components/dashboard/DateRangeFilter';
import { 
  DollarSign, 
  Globe, 
  Bell, 
  User, 
  Save, 
  Loader2,
  Check,
  AlertCircle,
  Mail,
  Monitor,
  Target,
  Wallet,
  Repeat,
  TrendingUp,
  FileText,
  RotateCcw,
  CheckCircle,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  UserCircle,
  Calendar,
  Shield,
  LayoutDashboard,
  BarChart3,
  PieChart,
  Receipt,
  ArrowDownUp,
  Search,
  FolderTree
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { NotificationPreference } from '../types';

type SettingsTab = 'general' | 'notifications' | 'features' | 'user';

// Supported currencies - limited to these 6 options
const SUPPORTED_CURRENCIES = [
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रू' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-blue-600' : 'bg-slate-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const DASHBOARD_FEATURE_CARDS = [
  { key: 'summaryCards', label: 'Summary Cards', icon: BarChart3, description: 'Income, expenses, and balance overview' },
  { key: 'monthlyTrends', label: 'Monthly Trends', icon: TrendingUp, description: 'Income vs expenses chart over time' },
  { key: 'topSpendingCategories', label: 'Top Spending Categories', icon: PieChart, description: 'Pie chart showing spending breakdown' },
  { key: 'currencyConverter', label: 'Currency Converter', icon: ArrowDownUp, description: 'Real-time currency conversion' },
  { key: 'budgetStatus', label: 'Budget Status', icon: Target, description: 'Budget progress and alerts' },
  { key: 'recentTransactions', label: 'Recent Transactions', icon: Receipt, description: 'Latest 5 transactions' },
  { key: 'accountBalances', label: 'Account Balances', icon: Wallet, description: 'All account balances at a glance' },
] as const;

const NAVIGATION_FEATURE_CARDS = [
  { key: 'search', label: 'Search', icon: Search, description: 'Advanced search across all data' },
  { key: 'recurring', label: 'Recurring Transactions', icon: Repeat, description: 'Manage recurring payments' },
  { key: 'importExport', label: 'Import/Export', icon: FileText, description: 'Import and export transaction data' },
  { key: 'categories', label: 'Categories', icon: FolderTree, description: 'Organize transactions by categories' },
  { key: 'tags', label: 'Tags', icon: Target, description: 'Tag transactions for better organization' },
  { key: 'budgets', label: 'Budgets', icon: Target, description: 'Set and track spending budgets' },
  { key: 'reports', label: 'Reports', icon: PieChart, description: 'Generate financial reports' },
] as const;

export function SettingsPage() {
  const { user, refetchUser } = useAuth();
  const { dashboardFeatures, updateDashboardFeature, navigationFeatures, updateNavigationFeature, resetToDefaults } = useFeatureFlags();
  const { secondaryCurrency, setSecondaryCurrency } = useSecondaryCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    (searchParams.get('tab') as SettingsTab) || 'general'
  );
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Currency change modal state
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    defaultCurrency: user?.defaultCurrency || 'NPR',
    timezone: user?.timezone || 'UTC',
  });

  // Staged currency (shown in dropdown, not yet committed)
  const [stagedCurrency, setStagedCurrency] = useState(user?.defaultCurrency || 'NPR');

  // Dashboard date range filter state
  const [dashboardDateRange, setDashboardDateRange] = useState(() => {
    const saved = sessionStorage.getItem('dashboardDateRange');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default to last 6 months to show demo data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  });

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference | null>(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Common timezones with friendly labels
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
    { value: 'America/Denver', label: 'Denver (MST/MDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'Mumbai/Kolkata (IST)' },
    { value: 'Asia/Kathmandu', label: 'Kathmandu (NPT)' },
    { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  ];

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotificationPreferences();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setSettings({
        defaultCurrency: user.defaultCurrency || 'NPR',
        timezone: user.timezone || 'UTC',
      });
      setStagedCurrency(user.defaultCurrency || 'NPR');
      setProfile({
        displayName: user.displayName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab') as SettingsTab;
    if (tab && ['general', 'notifications', 'user'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadNotificationPreferences = async () => {
    setLoadingNotifications(true);
    try {
      const prefs = await notificationService.getPreferences();
      setNotificationPreferences(prefs);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      setNotificationMessage({ type: 'error', text: 'Failed to load notification preferences' });
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleSave = async () => {
    // If the currency has changed, open the modal instead of saving directly
    const currentCurrency = user?.defaultCurrency || 'NPR';
    if (stagedCurrency !== currentCurrency) {
      setPendingCurrency(stagedCurrency);
      setCurrencyModalOpen(true);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.updateProfile({
        timezone: settings.timezone,
      });
      await refetchUser();
      
      // Save dashboard date range to localStorage
      sessionStorage.setItem('dashboardDateRange', JSON.stringify(dashboardDateRange));
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChangeSuccess = async (newCurrency: string) => {
    // The backend already updated the currency; now update profile for timezone too
    await authService.updateProfile({ defaultCurrency: newCurrency, timezone: settings.timezone });
    await refetchUser();
    setStagedCurrency(newCurrency);
    setSettings(prev => ({ ...prev, defaultCurrency: newCurrency }));
    sessionStorage.setItem('dashboardDateRange', JSON.stringify(dashboardDateRange));
    setSuccess('Currency changed successfully! Page will refresh.');
    // Reload to clear all caches
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDashboardDateRange({ startDate, endDate });
  };

  const handleSaveNotifications = async () => {
    if (!notificationPreferences) return;

    setSavingNotifications(true);
    setNotificationMessage(null);
    try {
      const updated = await notificationService.updatePreferences({
        budgetAlertsEnabled: notificationPreferences.budgetAlertsEnabled,
        lowBalanceAlertsEnabled: notificationPreferences.lowBalanceAlertsEnabled,
        recurringRemindersEnabled: notificationPreferences.recurringRemindersEnabled,
        largeTransactionAlertsEnabled: notificationPreferences.largeTransactionAlertsEnabled,
        unusualSpendingAlertsEnabled: notificationPreferences.unusualSpendingAlertsEnabled,
        monthlySummaryEnabled: notificationPreferences.monthlySummaryEnabled,
        emailNotificationsEnabled: notificationPreferences.emailNotificationsEnabled,
        inAppNotificationsEnabled: notificationPreferences.inAppNotificationsEnabled,
        lowBalanceThreshold: notificationPreferences.lowBalanceThreshold,
        largeTransactionThreshold: notificationPreferences.largeTransactionThreshold,
      });
      setNotificationPreferences(updated);
      setNotificationMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
      setTimeout(() => setNotificationMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      setNotificationMessage({ type: 'error', text: 'Failed to save notification preferences' });
    } finally {
      setSavingNotifications(false);
    }
  };

  const updateNotificationPreference = <K extends keyof NotificationPreference>(
    key: K,
    value: NotificationPreference[K]
  ) => {
    if (notificationPreferences) {
      setNotificationPreferences({ ...notificationPreferences, [key]: value });
    }
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.updateProfile({
        displayName: profile.displayName,
        email: profile.email,
      });
      await refetchUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordErrors({});
    
    // Validation
    const errors: Record<string, string> = {};
    if (!passwords.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwords.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setChangingPassword(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tabs: { id: SettingsTab; label: string; icon: typeof DollarSign }[] = [
    { id: 'general', label: 'General', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'features', label: 'Features', icon: LayoutDashboard },
    { id: 'user', label: 'User', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {activeTab === 'general' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700">
                <Check className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Default Currency Setting */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Default Currency</label>
                    <p className="text-xs text-gray-500">Base currency for all transactions and balances</p>
                  </div>
                </div>
                <select
                  value={stagedCurrency}
                  onChange={(e) => setStagedCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {stagedCurrency !== (user?.defaultCurrency || 'NPR') && (
                  <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    Saving will prompt you to convert or reset existing data.
                  </p>
                )}
              </div>

              {/* Secondary Currency Setting */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <ArrowDownUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Secondary Currency</label>
                    <p className="text-xs text-gray-500">Display converted amounts next to primary values</p>
                  </div>
                </div>
                <select
                  value={secondaryCurrency ?? ''}
                  onChange={(e) => setSecondaryCurrency(e.target.value || null)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors"
                >
                  <option value="">— None (disable secondary display) —</option>
                  {SUPPORTED_CURRENCIES.filter(c => c.code !== stagedCurrency).map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {secondaryCurrency && (
                  <p className="mt-2 text-xs text-indigo-600 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Amounts will show{' '}
                    <span className="font-medium">{secondaryCurrency}</span>{' '}
                    equivalents in real time across the app.
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Timezone Setting */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Timezone</label>
                    <p className="text-xs text-gray-500">For date and time display</p>
                  </div>
                </div>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Dashboard Date Range Filter */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">Dashboard Date Range</label>
                    <p className="text-xs text-gray-500">Set default date range for dashboard data</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <DateRangeFilter
                    startDate={dashboardDateRange.startDate}
                    endDate={dashboardDateRange.endDate}
                    onStartDateChange={(date) => handleDateRangeChange(date, dashboardDateRange.endDate)}
                    onEndDateChange={(date) => handleDateRangeChange(dashboardDateRange.startDate, date)}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h3>
            <p className="text-sm text-gray-500 mb-6">Customize how and when you receive notifications</p>

            {loadingNotifications || !notificationPreferences ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
                </div>
                <p className="mt-4 text-slate-600 font-medium">Loading preferences...</p>
              </div>
            ) : (
              <>
                {/* Message Alert */}
                {notificationMessage && (
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
                      notificationMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {notificationMessage.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span>{notificationMessage.text}</span>
                    <button 
                      onClick={() => setNotificationMessage(null)}
                      className="ml-auto hover:opacity-70"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Delivery Methods */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-blue-50 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold text-gray-900 text-sm">Delivery Methods</h4>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Monitor className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">In-App Notifications</div>
                            <div className="text-xs text-gray-500">Show notifications within the application</div>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notificationPreferences.inAppNotificationsEnabled}
                          onChange={(checked) => updateNotificationPreference('inAppNotificationsEnabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">Email Notifications</div>
                            <div className="text-xs text-gray-500">Send notifications to your email address</div>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notificationPreferences.emailNotificationsEnabled}
                          onChange={(checked) => updateNotificationPreference('emailNotificationsEnabled', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alert Types */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-emerald-50 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-semibold text-gray-900 text-sm">Alert Types</h4>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Target className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">Budget Alerts</div>
                            <div className="text-xs text-gray-500">Notify when approaching or exceeding budget limits</div>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notificationPreferences.budgetAlertsEnabled}
                          onChange={(checked) => updateNotificationPreference('budgetAlertsEnabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <Wallet className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">Low Balance Warnings</div>
                            <div className="text-xs text-gray-500">Alert when account balance falls below threshold</div>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notificationPreferences.lowBalanceAlertsEnabled}
                          onChange={(checked) => updateNotificationPreference('lowBalanceAlertsEnabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Repeat className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">Recurring Reminders</div>
                            <div className="text-xs text-gray-500">Remind about upcoming recurring transactions</div>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notificationPreferences.recurringRemindersEnabled}
                          onChange={(checked) => updateNotificationPreference('recurringRemindersEnabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">Large Transaction Alerts</div>
                            <div className="text-xs text-gray-500">Notify about unusually large transactions</div>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notificationPreferences.largeTransactionAlertsEnabled}
                          onChange={(checked) => updateNotificationPreference('largeTransactionAlertsEnabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">Unusual Spending Alerts</div>
                            <div className="text-xs text-gray-500">Detect abnormal spending patterns</div>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notificationPreferences.unusualSpendingAlertsEnabled}
                          onChange={(checked) => updateNotificationPreference('unusualSpendingAlertsEnabled', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-100 rounded-lg">
                            <FileText className="h-4 w-4 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">Monthly Summary</div>
                            <div className="text-xs text-gray-500">Receive a monthly financial summary report</div>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notificationPreferences.monthlySummaryEnabled}
                          onChange={(checked) => updateNotificationPreference('monthlySummaryEnabled', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thresholds */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-amber-50 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-amber-600" />
                        <h4 className="font-semibold text-gray-900 text-sm">Alert Thresholds</h4>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Low Balance Threshold
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={notificationPreferences.lowBalanceThreshold}
                            onChange={(e) =>
                              updateNotificationPreference('lowBalanceThreshold', Number(e.target.value))
                            }
                            step="10"
                            min="0"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Alert when account balance falls below this amount
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Large Transaction Threshold
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={notificationPreferences.largeTransactionThreshold}
                            onChange={(e) =>
                              updateNotificationPreference('largeTransactionThreshold', Number(e.target.value))
                            }
                            step="100"
                            min="0"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Alert when a single transaction exceeds this amount
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={savingNotifications}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {savingNotifications ? (
                        <>
                          <Sparkles className="h-4 w-4 animate-pulse" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </button>
                    <button
                      onClick={loadNotificationPreferences}
                      className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="p-6 space-y-8">
            {/* Dashboard Features Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Features</h3>
              <p className="text-sm text-gray-600 mb-6">
                Customize which cards appear on your dashboard. Disabled cards will be hidden from view.
              </p>
              <div className="space-y-4">
                {DASHBOARD_FEATURE_CARDS.map(({ key, label, icon: Icon, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{label}</div>
                        <div className="text-xs text-gray-500">{description}</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={dashboardFeatures[key as keyof typeof dashboardFeatures]}
                      onChange={(checked) => updateDashboardFeature(key as keyof typeof dashboardFeatures, checked)}
                    />
                  </div>
                ))}
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={resetToDefaults}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Navigation Features Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation Features</h3>
              <p className="text-sm text-gray-600 mb-6">
                Control which menu items appear in the sidebar navigation. Required items cannot be disabled.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Core navigation items (Dashboard, Accounts, Transactions, Settings) cannot be disabled as they are essential for the application.
                  </p>
                </div>
                
                {NAVIGATION_FEATURE_CARDS.map(({ key, label, icon: Icon, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{label}</div>
                        <div className="text-xs text-gray-500">{description}</div>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={navigationFeatures[key as keyof typeof navigationFeatures]}
                      onChange={(checked) => updateNavigationFeature(key as keyof typeof navigationFeatures, checked)}
                    />
                  </div>
                ))}
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={resetToDefaults}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'user' && (
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{user?.displayName || user?.username}</h3>
                  <p className="text-gray-500">@{user?.username}</p>
                </div>
              </div>
            </div>

            {/* Profile Information Section */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4">Profile Information</h4>
              
              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserCircle className="inline h-4 w-4 mr-1" />
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your display name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Username (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">Username cannot be changed</p>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Member Since
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">{formatDate(user?.createdAt)}</p>
                </div>

                {/* Save Profile Button */}
                <div className="pt-2">
                  <button
                    onClick={handleProfileSave}
                    disabled={savingProfile}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Security</h4>
                  <p className="text-sm text-gray-500">Manage your password and security settings</p>
                </div>
              </div>
              
              {showPasswordForm ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordErrors.newPassword ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Enter new password (min 8 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Password Change Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handlePasswordChange}
                      disabled={changingPassword}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setPasswordErrors({});
                      }}
                      className="px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Currency Change Modal */}
      {pendingCurrency && (
        <CurrencyChangeModal
          isOpen={currencyModalOpen}
          fromCurrency={user?.defaultCurrency || 'NPR'}
          toCurrency={pendingCurrency}
          onClose={() => {
            setCurrencyModalOpen(false);
            // Revert staged currency back to current
            setStagedCurrency(user?.defaultCurrency || 'NPR');
          }}
          onSuccess={handleCurrencyChangeSuccess}
        />
      )}
    </div>
  );
}

export default SettingsPage;
