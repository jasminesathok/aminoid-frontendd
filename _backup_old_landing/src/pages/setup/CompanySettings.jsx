import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Building, Save, Upload, MapPin, Globe, Phone, Mail, Image as ImageIcon, Calendar } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const CURRENCIES  = ['USD','EUR','GBP','INR','AED','SGD','JPY'];
const TIMEZONES   = ['America/Los_Angeles','America/New_York','Europe/London','Europe/Paris','Asia/Kolkata','Asia/Singapore','Asia/Tokyo'];
const DATE_FORMATS = ['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD'];

// sensible defaults mapping currency -> timezone for UX convenience
const CURRENCY_TZ_MAP = {
  USD: 'America/Los_Angeles',
  EUR: 'Europe/Paris',
  GBP: 'Europe/London',
  INR: 'Asia/Kolkata',
  AED: 'Asia/Dubai',
  SGD: 'Asia/Singapore',
  JPY: 'Asia/Tokyo',
};

export default function CompanySettings() {
  const [form,    setForm]    = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/api/setup/company').then(r => {
      // If backend indicates there are no enterprise-specific settings,
      // show an empty form for onboarding a new company instead of pre-filling
      // with global defaults.
      if (r.hasEnterpriseSettings === false) {
        setForm({});
      } else {
        setForm(r.enterpriseData || {});
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); 
    
    if (!form.company_name || !form.company_name.trim()) {
      toast.error('Company Name is required.');
      return;
    }
    if (!form.company_email || !form.company_email.trim()) {
      toast.error('Official Email is required.');
      return;
    }
    
    setSaving(true); setSaved(false);
    try {
      const res = await api.put('/api/setup/company', form);
      // Update local form with canonical settings returned by the server
      if (res && res.data) {
        // Only set the form if there are enterprise settings, to avoid replacing empty form with globals
        if (res.hasEnterpriseSettings === false) {
           // still empty
        } else {
           setForm(res.enterpriseData || {});
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Notify CurrencyContext to re-fetch immediately
      window.dispatchEvent(new Event('currencyChanged'));
    } finally { setSaving(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
              <Building size={24}/>
            </div>
            <div>
              <h1 className="text-3xl font-bold dark:text-white tracking-tight">Company Setting</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage your organisation's identity and global preferences.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
            <Save size={18}/> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Logo & Visuals */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl text-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Company Logo</h3>
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current && fileInputRef.current.click(); }}
                className="relative group mx-auto w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:border-primary/50 cursor-pointer">
                {form.company_logo ? (
                  <img src={form.company_logo} alt="Logo" className="w-full h-full object-contain p-2"/>
                ) : (
                  <ImageIcon size={32} className="text-slate-300 dark:text-slate-600"/>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload size={20} className="text-white"/>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                const maxSize = 2 * 1024 * 1024; // 2MB
                if (f.size > maxSize) {
                  toast.error('Logo file is too large. Please choose an image under 2 MB.');
                  e.target.value = null;
                  return;
                }
                // read as data URL and set as logo preview; optional: upload to server
                const reader = new FileReader();
                reader.onload = () => {
                  setForm(prev => ({ ...prev, company_logo: reader.result }));
                };
                reader.readAsDataURL(f);
              }} />
              <p className="text-xs text-slate-400 mt-4 px-4 leading-relaxed">
                Upload your business logo. Recommended size: 512x512px. Supports PNG, JPG, SVG.
              </p>
+              <p className="text-xs text-slate-400 mt-2 px-4">Maximum file size: <strong>2 MB</strong>.</p>
              <input type="text" value={form.company_logo || ''} onChange={e => setForm({...form, company_logo:e.target.value})}
                placeholder="Logo URL (optional)" className="input-field w-full mt-4 text-xs text-center"/>
            </div>

            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">System Config</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Default Currency</label>
                  <select value={form.currency || 'USD'} onChange={e => {
                    const cur = e.target.value;
                    const tz = CURRENCY_TZ_MAP[cur];
                    setForm(prev => ({ ...prev, currency: cur, timezone: tz || prev.timezone }));
                  }} className="input-field w-full text-sm">
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Timezone</label>
                  <select value={form.timezone || 'America/Los_Angeles'} onChange={e => setForm({...form, timezone:e.target.value})} className="input-field w-full text-sm">
                    {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Building size={14}/> Company Name
                  </label>
                  <input required value={form.company_name || ''} onChange={e => setForm({...form, company_name:e.target.value})} className="input-field w-full" placeholder="Amnoid Technologies"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Globe size={14}/> Website
                  </label>
                  <input value={form.company_website || ''} onChange={e => setForm({...form, company_website:e.target.value})} className="input-field w-full" placeholder="https://amnoid.io"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Mail size={14}/> Official Email
                  </label>
                  <input type="email" value={form.company_email || ''} onChange={e => setForm({...form, company_email:e.target.value})} className="input-field w-full" placeholder="hello@amnoid.io"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Phone size={14}/> Phone Number
                  </label>
                  <input value={form.company_phone || ''} onChange={e => setForm({...form, company_phone:e.target.value})} className="input-field w-full" placeholder="+1 800 AMNOID"/>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <MapPin size={14}/> Physical Address
                  </label>
                  <textarea value={form.company_address || ''} onChange={e => setForm({...form, company_address:e.target.value})} className="input-field w-full h-24" placeholder="Street, Building, City, State, ZIP, Country"/>
                </div>
              </div>

              {saved && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold flex items-center gap-2">
                  <Save size={16}/> Settings updated successfully!
                </motion.div>
              )}
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-lg font-bold dark:text-white mb-4">Date & Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Preferred Date Format</label>
                  <select value={form.date_format || 'MM/DD/YYYY'} onChange={e => setForm({...form, date_format:e.target.value})} className="input-field w-full">
                    {DATE_FORMATS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <Calendar size={20} className="text-primary"/>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Preview</p>
                    <p className="text-sm font-mono font-bold dark:text-white">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
