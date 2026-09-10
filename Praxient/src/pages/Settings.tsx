import React, { useState, useEffect } from 'react';
import { Save, Info, MessageSquare, Mail, CreditCard, Bell } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { storage } from '../utils/storage';
import { Settings as SettingsType } from '../types';

const BRAND_COLORS = [
  { value: '#0284C7', label: 'Sky Blue', color: 'bg-sky-500' },
  { value: '#0F172A', label: 'Slate', color: 'bg-slate-800' },
  { value: '#059669', label: 'Emerald', color: 'bg-emerald-600' },
  { value: '#DC2626', label: 'Red', color: 'bg-red-600' },
  { value: '#D97706', label: 'Amber', color: 'bg-amber-600' },
  { value: '#7C3AED', label: 'Violet', color: 'bg-violet-600' },
];

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType>({
    brandingColor: '#0284C7',
    smsRemindersEnabled: true,
    emailConfirmationsEnabled: true,
    paymentRequired: false,
    medicalAidAccepted: true,
    notifications: {
      newBooking: true,
      cancellation: true,
      reminder: true,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const savedSettings = storage.getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    storage.setSettings(settings);

    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings saved successfully!', 'success');
    }, 800);
  };

  const updateSettings = (key: keyof SettingsType, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNotification = (key: keyof SettingsType['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">
            Configure your practice preferences
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Demo Mode Settings
            </p>
            <p className="text-xs text-amber-700 mt-1">
              These settings are saved locally only. In the live system, they
              would control integrations and notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Branding */}
      <Card title="Branding" subtitle="Customize your practice appearance">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Branding Color
            </label>
            <div className="flex flex-wrap gap-3">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings('brandingColor', color.value)}
                  className={`w-10 h-10 rounded-lg ${color.color} transition-all ${
                    settings.brandingColor === color.value
                      ? 'ring-2 ring-offset-2 ring-slate-900'
                      : ''
                  }`}
                  title={color.label}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              This color will be used in embeds and notifications
            </p>
          </div>
        </div>
      </Card>

      {/* SMS & Email */}
      <Card title="Communication" subtitle="Configure patient notifications">
        <div className="space-y-6">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <Toggle
              label="SMS Reminders"
              description="Send SMS reminders for upcoming appointments"
              checked={settings.smsRemindersEnabled}
              onChange={(checked) =>
                updateSettings('smsRemindersEnabled', checked)
              }
            />
            {settings.smsRemindersEnabled && (
              <p className="text-xs text-sky-700 mt-3 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Demo only. No real SMS will be sent.
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <Toggle
              label="Email Confirmations"
              description="Send email confirmations for bookings"
              checked={settings.emailConfirmationsEnabled}
              onChange={(checked) =>
                updateSettings('emailConfirmationsEnabled', checked)
              }
            />
            {settings.emailConfirmationsEnabled && (
              <p className="text-xs text-sky-700 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Demo only. No real email will be sent.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Payments */}
      <Card title="Payment Settings" subtitle="Configure payment options">
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Payment Gateway
              </p>
              <p className="text-xs text-amber-700 mt-1">
                In the live system, this would connect to a payment gateway like
                PayFast, Yoco, or Ozow for South African payments.
              </p>
            </div>
          </div>

          <Toggle
            label="Require Payment"
            description="Require payment or deposit at booking time"
            checked={settings.paymentRequired}
            onChange={(checked) => updateSettings('paymentRequired', checked)}
          />

          {settings.paymentRequired && (
            <div className="bg-slate-50 rounded-lg p-4 mt-4">
              <p className="text-xs text-slate-600">
                Demo only. No real payment gateway is connected.
              </p>
            </div>
          )}

          <Toggle
            label="Medical Aid Accepted"
            description="Show medical aid info in booking form"
            checked={settings.medicalAidAccepted}
            onChange={(checked) =>
              updateSettings('medicalAidAccepted', checked)
            }
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Notification Preferences" subtitle="Control when you receive alerts">
        <div className="space-y-4">
          <Toggle
            label="New Booking Alert"
            description="Receive notification when a new booking is made"
            checked={settings.notifications.newBooking}
            onChange={(checked) => updateNotification('newBooking', checked)}
          />

          <div className="border-t border-slate-200 pt-4">
            <Toggle
              label="Cancellation Alert"
              description="Receive notification when an appointment is cancelled"
              checked={settings.notifications.cancellation}
              onChange={(checked) => updateNotification('cancellation', checked)}
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <Toggle
              label="Reminder Alerts"
              description="Receive daily summary of upcoming appointments"
              checked={settings.notifications.reminder}
              onChange={(checked) => updateNotification('reminder', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Integrations (Future) */}
      <Card title="Future Integrations" subtitle="Available in the live system">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">SMS Gateway</p>
                <p className="text-xs text-slate-500">
                  Connect with BulkSMS, Panacea Mobile
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">Coming Soon</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">Email Provider</p>
                <p className="text-xs text-slate-500">
                  Connect with SendGrid, Mailgun
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">Coming Soon</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">Payment Gateway</p>
                <p className="text-xs text-slate-500">
                  Connect with PayFast, Yoco
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">Coming Soon</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
