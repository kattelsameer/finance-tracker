import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notification.service';
import { NotificationPreference } from '../types/api';

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
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Notification Settings</h1>
        <p className="text-gray-600 mt-2">
          Customize how and when you receive notifications
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Delivery Methods */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Delivery Methods
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">In-App Notifications</div>
                <div className="text-sm text-gray-600">
                  Show notifications within the application
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.inAppNotificationsEnabled}
                onChange={(e) =>
                  updatePreference('inAppNotificationsEnabled', e.target.checked)
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Email Notifications</div>
                <div className="text-sm text-gray-600">
                  Send notifications to your email address
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotificationsEnabled}
                onChange={(e) =>
                  updatePreference('emailNotificationsEnabled', e.target.checked)
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Alert Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Alert Types
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Budget Alerts</div>
                <div className="text-sm text-gray-600">
                  Notify when approaching or exceeding budget limits
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.budgetAlertsEnabled}
                onChange={(e) =>
                  updatePreference('budgetAlertsEnabled', e.target.checked)
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Low Balance Warnings</div>
                <div className="text-sm text-gray-600">
                  Alert when account balance falls below threshold
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.lowBalanceAlertsEnabled}
                onChange={(e) =>
                  updatePreference('lowBalanceAlertsEnabled', e.target.checked)
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Recurring Transaction Reminders</div>
                <div className="text-sm text-gray-600">
                  Remind about upcoming recurring transactions
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.recurringRemindersEnabled}
                onChange={(e) =>
                  updatePreference('recurringRemindersEnabled', e.target.checked)
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Large Transaction Alerts</div>
                <div className="text-sm text-gray-600">
                  Notify about unusually large transactions
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.largeTransactionAlertsEnabled}
                onChange={(e) =>
                  updatePreference('largeTransactionAlertsEnabled', e.target.checked)
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Unusual Spending Alerts</div>
                <div className="text-sm text-gray-600">
                  Detect and alert about abnormal spending patterns
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.unusualSpendingAlertsEnabled}
                onChange={(e) =>
                  updatePreference('unusualSpendingAlertsEnabled', e.target.checked)
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Monthly Summary</div>
                <div className="text-sm text-gray-600">
                  Receive a monthly financial summary report
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.monthlySummaryEnabled}
                onChange={(e) =>
                  updatePreference('monthlySummaryEnabled', e.target.checked)
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Thresholds */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Alert Thresholds
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Balance Threshold
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">$</span>
                <input
                  type="number"
                  value={preferences.lowBalanceThreshold}
                  onChange={(e) =>
                    updatePreference('lowBalanceThreshold', Number(e.target.value))
                  }
                  step="10"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Alert when account balance falls below this amount
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Large Transaction Threshold
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">$</span>
                <input
                  type="number"
                  value={preferences.largeTransactionThreshold}
                  onChange={(e) =>
                    updatePreference('largeTransactionThreshold', Number(e.target.value))
                  }
                  step="100"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Alert when a single transaction exceeds this amount
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        <button
          onClick={loadPreferences}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
