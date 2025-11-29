import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notification.service';
import { NotificationPreference } from '../types/api';
import {
  Bell,
  Mail,
  Monitor,
  Target,
  Wallet,
  Repeat,
  TrendingUp,
  AlertTriangle,
  FileText,
  DollarSign,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const NotificationSettingsPage: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load notification preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    setMessage(null);
    try {
      const updated = await notificationService.updatePreferences({
        budgetAlertsEnabled: preferences.budgetAlertsEnabled,
        lowBalanceAlertsEnabled: preferences.lowBalanceAlertsEnabled,
        recurringRemindersEnabled: preferences.recurringRemindersEnabled,
        largeTransactionAlertsEnabled: preferences.largeTransactionAlertsEnabled,
        unusualSpendingAlertsEnabled: preferences.unusualSpendingAlertsEnabled,
        monthlySummaryEnabled: preferences.monthlySummaryEnabled,
        emailNotificationsEnabled: preferences.emailNotificationsEnabled,
        inAppNotificationsEnabled: preferences.inAppNotificationsEnabled,
        lowBalanceThreshold: preferences.lowBalanceThreshold,
        largeTransactionThreshold: preferences.largeTransactionThreshold,
      });
      setPreferences(updated);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof NotificationPreference>(
    key: K,
    value: NotificationPreference[K]
  ) => {
    if (preferences) {
      setPreferences({ ...preferences, [key]: value });
    }
  };

  if (loading || !preferences) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
        </div>
        <p className="mt-4 text-slate-600 font-medium">Loading preferences...</p>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Notification Settings</h2>
        <p className="text-slate-500 mt-1">Customize how and when you receive notifications</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Delivery Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-blue-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Delivery Methods</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Monitor className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">In-App Notifications</div>
                  <div className="text-sm text-slate-500">Show notifications within the application</div>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.inAppNotificationsEnabled}
                onChange={(checked) => updatePreference('inAppNotificationsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Email Notifications</div>
                  <div className="text-sm text-slate-500">Send notifications to your email address</div>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.emailNotificationsEnabled}
                onChange={(checked) => updatePreference('emailNotificationsEnabled', checked)}
              />
            </div>
          </div>
        </div>

        {/* Alert Types */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-emerald-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Alert Types</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Budget Alerts</div>
                  <div className="text-sm text-slate-500">Notify when approaching or exceeding budget limits</div>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.budgetAlertsEnabled}
                onChange={(checked) => updatePreference('budgetAlertsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Wallet className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Low Balance Warnings</div>
                  <div className="text-sm text-slate-500">Alert when account balance falls below threshold</div>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.lowBalanceAlertsEnabled}
                onChange={(checked) => updatePreference('lowBalanceAlertsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Repeat className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Recurring Transaction Reminders</div>
                  <div className="text-sm text-slate-500">Remind about upcoming recurring transactions</div>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.recurringRemindersEnabled}
                onChange={(checked) => updatePreference('recurringRemindersEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Large Transaction Alerts</div>
                  <div className="text-sm text-slate-500">Notify about unusually large transactions</div>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.largeTransactionAlertsEnabled}
                onChange={(checked) => updatePreference('largeTransactionAlertsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Unusual Spending Alerts</div>
                  <div className="text-sm text-slate-500">Detect and alert about abnormal spending patterns</div>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.unusualSpendingAlertsEnabled}
                onChange={(checked) => updatePreference('unusualSpendingAlertsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <FileText className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Monthly Summary</div>
                  <div className="text-sm text-slate-500">Receive a monthly financial summary report</div>
                </div>
              </div>
              <ToggleSwitch
                checked={preferences.monthlySummaryEnabled}
                onChange={(checked) => updatePreference('monthlySummaryEnabled', checked)}
              />
            </div>
          </div>
        </div>

        {/* Thresholds */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-amber-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Alert Thresholds</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Low Balance Threshold
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  value={preferences.lowBalanceThreshold}
                  onChange={(e) =>
                    updatePreference('lowBalanceThreshold', Number(e.target.value))
                  }
                  step="10"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Alert when account balance falls below this amount
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Large Transaction Threshold
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  value={preferences.largeTransactionThreshold}
                  onChange={(e) =>
                    updatePreference('largeTransactionThreshold', Number(e.target.value))
                  }
                  step="100"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Alert when a single transaction exceeds this amount
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all "
        >
          {saving ? (
            <>
              <Sparkles className="h-5 w-5 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Preferences
            </>
          )}
        </button>
        <button
          onClick={loadPreferences}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="h-5 w-5" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
