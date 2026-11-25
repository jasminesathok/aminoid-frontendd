import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { Settings as SettingsIcon, Save, Database, ShieldCheck, Mail, Globe, Server } from 'lucide-react';

export default function Settings() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Amnoid',
    maintenanceMode: false,
    supportEmail: 'support@amnoid.com',
    maxTenants: 100,
    allowRegistration: true,
  });

  React.useEffect(() => {
    api.get('/api/superadmin/settings')
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(err => toast.error('Failed to load settings'));
  }, [toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/api/superadmin/settings', settings);
      toast.success('System settings updated successfully.');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 px-2">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <SettingsIcon size={32} className="text-primary" />
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure global application settings and maintenance overrides.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Settings */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <Globe size={20} className="text-indigo-500" />
              General Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Application Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Global Support Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    className="input-field w-full pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registration & Limits */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" />
              Security & Limits
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Maximum Tenants Allowed
                </label>
                <div className="relative">
                  <Database size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    name="maxTenants"
                    value={settings.maxTenants}
                    onChange={handleChange}
                    className="input-field w-full pl-9"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-4 justify-center mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowRegistration"
                    checked={settings.allowRegistration}
                    onChange={handleChange}
                    className="w-5 h-5 rounded text-primary focus:ring-primary focus:ring-offset-slate-900 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-sm font-semibold dark:text-white">Allow Public Registration</span>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced / Maintenance */}
          <div className="glass-card p-6 rounded-2xl space-y-6 border-l-4 border-l-amber-500">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <Server size={20} className="text-amber-500" />
              System Status
            </h2>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-500 block mb-0.5">
                    Enable Maintenance Mode
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    When enabled, only Super Admins can access the dashboard. All other users will see a maintenance screen.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
