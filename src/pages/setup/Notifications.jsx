import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Bell, Save } from 'lucide-react';
import { api } from '../../utils/api';

const NOTIFICATION_SECTIONS = [
  {
    title: 'Sales',
    items: [
      { key:'notif_new_deal',    label:'New deal created',         desc:'Notify when a deal is added to the pipeline.' },
      { key:'notif_deal_won',    label:'Deal marked as Won',       desc:'Celebrate closed deals with a notification.' },
      { key:'notif_new_contact', label:'New contact added',        desc:'Alert when a new CRM contact is created.' },
    ],
  },
  {
    title: 'Knowledge Base',
    items: [
      { key:'notif_kb_publish',  label:'Article published',        desc:'Notify when an article goes live.' },
      { key:'notif_kb_comment',  label:'Article comments',         desc:'Alert when someone comments on an article.' },
    ],
  },
  {
    title: 'Billing & Subscription',
    items: [
      { key:'notif_billing',     label:'Invoice generated',        desc:'Receive billing invoice notifications.' },
      { key:'notif_usage_80',    label:'Usage at 80% of limit',    desc:'Warning when you approach plan limits.' },
      { key:'notif_renewal',     label:'Subscription renewal',     desc:'Reminder 7 days before renewal date.' },
    ],
  },
  {
    title: 'Team',
    items: [
      { key:'notif_user_join',   label:'New user joined',          desc:'Alert when a new team member signs up.' },
      { key:'notif_role_change', label:'Role changed',             desc:'Notify when a user role is updated.' },
    ],
  },
];

function Toggle({ enabled, onChange }) {
  return (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
    </button>
  );
}

export default function Notifications() {
  const [prefs,   setPrefs]   = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    api.get('/api/setup/company').then(r => setPrefs(r.data || {})).finally(() => setLoading(false));
  }, []);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: p[key] === 'true' ? 'false' : 'true' }));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const notifKeys = NOTIFICATION_SECTIONS.flatMap(s => s.items.map(i => i.key));
      const payload = {};
      notifKeys.forEach(k => { payload[k] = prefs[k] || 'false'; });
      await api.put('/api/setup/company', payload);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Bell size={20}/>
            </div>
            <div>
              <h1 className="text-3xl font-bold dark:text-white">Notifications</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">Control which events trigger notifications.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-emerald-500 font-semibold">✓ Saved!</span>}
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              <Save size={15}/>{saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {NOTIFICATION_SECTIONS.map((section, si) => (
          <motion.div key={si} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:si*0.08 }}
            className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold dark:text-white">{section.title}</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {section.items.map((item, ii) => (
                <div key={ii} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold dark:text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle enabled={prefs[item.key] === 'true'} onChange={() => toggle(item.key)}/>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
