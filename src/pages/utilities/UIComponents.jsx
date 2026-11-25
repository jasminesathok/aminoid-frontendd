import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Info, X, Zap } from 'lucide-react';

const ButtonRow = ({ label, children }) => (
  <div className="mb-6">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{label}</p>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

const Badge = ({ color, label }) => (
  <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full`}
    style={{ background:`${color}18`, color }}>{label}</span>
);

const AlertBox = ({ type, icon: Icon, title, desc, color }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background:`${color}08`, borderColor:`${color}30` }}>
    <Icon size={16} style={{ color }} className="shrink-0 mt-0.5"/>
    <div>
      <p className="text-sm font-bold" style={{ color }}>{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
    </div>
  </div>
);

export default function UIComponents() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-10 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">UI Components</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Design system building blocks used across the app.</p>
        </div>

        {/* Buttons */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">Buttons</h2>
          <ButtonRow label="Primary Actions">
            <button className="btn-primary text-sm">Save Changes</button>
            <button className="btn-primary text-sm flex items-center gap-2"><Zap size={14}/>Sync Data</button>
            <button className="btn-primary text-sm opacity-60 cursor-not-allowed" disabled>Disabled</button>
          </ButtonRow>
          <ButtonRow label="Secondary Actions">
            <button className="btn-secondary text-sm">Cancel</button>
            <button className="btn-secondary text-sm">Export CSV</button>
          </ButtonRow>
          <ButtonRow label="Sizes">
            <button className="btn-primary text-xs px-3 py-1.5">Small</button>
            <button className="btn-primary text-sm">Medium</button>
            <button className="btn-primary text-base px-6 py-3">Large</button>
          </ButtonRow>
          <ButtonRow label="Danger">
            <button className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-bold transition-all">Delete</button>
            <button className="px-4 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-sm font-bold transition-all">Remove</button>
          </ButtonRow>
        </section>

        {/* Badges */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">Badges & Status Pills</h2>
          <div className="flex flex-wrap gap-3">
            <Badge color="#939BFF" label="Primary"/>
            <Badge color="#10b981" label="Success"/>
            <Badge color="#f59e0b" label="Warning"/>
            <Badge color="#ef4444" label="Danger"/>
            <Badge color="#3b82f6" label="Info"/>
            <Badge color="#8b5cf6" label="Purple"/>
            <Badge color="#94a3b8" label="Neutral"/>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {['Active','Pending','Inactive','Completed','Cancelled','Draft'].map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"/>{s}
              </span>
            ))}
          </div>
        </section>

        {/* Alerts */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">Alerts</h2>
          <div className="space-y-3">
            <AlertBox type="success" icon={Check}       title="Operation successful!" desc="Your changes have been saved and are now live." color="#10b981"/>
            <AlertBox type="info"    icon={Info}        title="Did you know?"          desc="You can export any table by clicking the Export button in the toolbar." color="#3b82f6"/>
            <AlertBox type="warning" icon={AlertCircle} title="Approaching limit"      desc="You are using 80% of your API call quota. Consider upgrading your plan." color="#f59e0b"/>
            <AlertBox type="error"   icon={X}           title="Action failed"          desc="Unable to connect to the server. Please check your network connection." color="#ef4444"/>
          </div>
        </section>

        {/* Cards */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">Card Variants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title:'Default Card',  desc:'Standard glass-morphism card used throughout the app.', color:'#939BFF' },
              { title:'Metric Card',   desc:'Shows a single KPI with icon and value.', color:'#10b981' },
              { title:'Action Card',   desc:'Includes primary action buttons with hover states.', color:'#f59e0b' },
            ].map((card, i) => (
              <motion.div key={i} whileHover={{ y:-4 }} className="glass-card p-5 rounded-2xl border-t-4" style={{ borderTopColor:card.color }}>
                <p className="text-sm font-bold dark:text-white mb-1">{card.title}</p>
                <p className="text-xs text-slate-400">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
