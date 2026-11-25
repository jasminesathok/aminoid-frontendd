import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, Eye, MousePointerClick, UserX,
  Plus, Search, MoreVertical, FileText, X,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#10b981','#f59e0b','#ef4444'];
const statusStyle = {
  Sent:      { bg:'bg-emerald-500/10', text:'text-emerald-500' },
  Scheduled: { bg:'bg-blue-500/10',   text:'text-blue-500'    },
  Draft:     { bg:'bg-slate-200/60 dark:bg-slate-700/40', text:'text-slate-500' },
};
const tabs = ['All Emails','Templates'];

function ComposeModal({ onClose, onAdd, campaigns }) {
  const [subject,      setSubject]      = useState('');
  const [list,         setList]         = useState('');
  const [recipients,   setRecipients]   = useState('');
  const [status,       setStatus]       = useState('Draft');
  const [scheduledAt,  setScheduledAt]  = useState('');
  const [campaignId,   setCampaignId]   = useState('');
  const [saving,       setSaving]       = useState(false);
  
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/api/marketing/email', {
        subject: subject.trim(),
        list:    list.trim() || null,
        recipients: recipients ? Number(recipients) : null,
        status,
        scheduled_at: status === 'Scheduled' && scheduledAt ? scheduledAt : null,
        campaign_id: campaignId || null,
      });
      onAdd(res.data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        exit={{ opacity:0, scale:0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold dark:text-white">Compose Email</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Subject *</label>
            <input
              value={subject} onChange={e => setSubject(e.target.value)} required
              placeholder="Email subject line..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mailing List</label>
              <input
                value={list} onChange={e => setList(e.target.value)}
                placeholder="e.g. Newsletter"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Recipients</label>
              <input
                type="number" min="0" value={recipients} onChange={e => setRecipients(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Status</label>
            <select
              value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors"
            >
              <option>Draft</option>
              <option>Scheduled</option>
              <option>Sent</option>
            </select>
          </div>

          {status === 'Scheduled' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Schedule At</label>
              <input
                type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Associated Campaign</label>
            <select value={campaignId} onChange={e => setCampaignId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors">
              <option value="">None</option>
              {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving || !subject.trim()}
              className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : 'Save Email'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function EmailMarketing() {
  const toast = useToast();
  const [tab,       setTab]       = useState('All Emails');
  const [search,    setSearch]    = useState('');
  const [emails,    setEmails]    = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [emailStats,  setEmailStats]  = useState(null);
  const [campaigns,   setCampaigns]   = useState([]);
  const [openRow, setOpenRow] = useState(null);

  useEffect(() => {
  setError('');
  Promise.all([
    api.get('/api/marketing/email',           { silent: true }),
    api.get('/api/marketing/email/templates', { silent: true }),
    api.get('/api/marketing/email/stats',     { silent: true }),
    api.get('/api/marketing/campaigns',       { silent: true })
  ]).then(([eRes, tRes, sRes, cRes]) => {
    setEmails(Array.isArray(eRes.data) ? eRes.data : (eRes.data?.data || []));
    setTemplates(Array.isArray(tRes.data) ? tRes.data : (tRes.data?.data || []));
    setEmailStats(sRes.data?.data || sRes.data || null);
    setCampaigns(cRes.data?.data || cRes.data || []);
  }).catch(() => {
    setError('Could not load email data. Please ensure all database migrations have been run.');
  }).finally(() => setLoading(false));
}, []);

useEffect(() => {
  const close = () => setOpenRow(null);
  document.addEventListener('click', close);
  return () => document.removeEventListener('click', close);
}, []);

  const totalSent   = emailStats?.totalSent    ?? 0;
const avgOpen     = emailStats?.avgOpenRate  ?? 0;
const avgClick    = emailStats?.avgClickRate ?? 0;
const totalUnsubs = emailStats?.totalUnsubs  ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Email Marketing</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Create, send, and track email campaigns.</p>
          </div>
          <button onClick={() => setShowCompose(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16}/> Compose Email
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label:'Emails Sent',     value: loading ? '…' : totalSent.toLocaleString(), color:'#939BFF', icon: Send              },
            { label:'Avg. Open Rate',  value: loading ? '…' : `${avgOpen}%`,                color:'#C4B5F4', icon: Eye               },
            { label:'Avg. Click Rate', value: loading ? '…' : `${avgClick}%`,             color:'#10b981', icon: MousePointerClick  },
            { label:'Unsubscribes',    value: loading ? '…' : totalUnsubs,                color:'#ef4444', icon: UserX             },
          ].map((c,i) => (
            <motion.div key={i} whileHover={{ y:-4 }} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`${c.color}18`, color:c.color }}><c.icon size={20}/></div>
              <div>
                <p className="text-xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
                tab===t ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}>{t}</button>
          ))}
        </div>

        {tab === 'All Emails' && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold dark:text-white">All Emails ({emails.length})</h2>
              <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-56 border border-white/5">
                <Search size={14} className="text-slate-400 shrink-0"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full dark:text-white"/>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Mail size={32} className="mb-3 opacity-40"/>
                <p className="text-sm">No emails yet. Compose one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-150">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Subject','List','Sent','Recipients','Opens','Clicks','Unsubs','Status',''].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {emails.filter(e=>(e.subject||'').toLowerCase().includes(search.toLowerCase())).map((e,i) => {
                      const st = statusStyle[e.status] || statusStyle['Draft'];
                      const color = PALETTE[i % PALETTE.length];
                      const openRate  = e.recipients ? Math.round((e.opens||0)/e.recipients*100)+'%' : '—';
                      const clickRate = e.recipients ? ((e.clicks||0)/e.recipients*100).toFixed(1)+'%' : '—';
                      return (
                        <motion.tr key={e.id}
                          initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                          className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{background:`${color}18`,color}}><Mail size={14}/></div>
                              <p className="text-sm font-bold dark:text-white max-w-52 truncate">{e.subject}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{e.list || '—'}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                            {e.sent_at ? new Date(e.sent_at).toLocaleDateString('en-US',{day:'numeric',month:'short'}) : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold dark:text-white">{e.recipients ? Number(e.recipients).toLocaleString() : '—'}</td>
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-bold dark:text-white">{openRate}</p>
                            <p className="text-xs text-slate-400">{e.opens ? Number(e.opens).toLocaleString() : ''}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-sm font-bold" style={{color}}>{clickRate}</p>
                            <p className="text-xs text-slate-400">{e.clicks ? Number(e.clicks).toLocaleString() : ''}</p>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-rose-500 font-semibold">{e.unsubscribes || '—'}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>{e.status}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="relative">
  <button onClick={(ev) => { ev.stopPropagation(); setOpenRow(openRow === e.id ? null : e.id); }}
    className="text-slate-400 hover:text-slate-600"><MoreVertical size={16}/></button>
  {openRow === e.id && (
    <div className="absolute right-0 top-6 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-36">
      <button onClick={() => {
        api.put(`/api/marketing/email/${e.id}`, { status: 'Sent' })
          .then(() => setEmails(prev => prev.map(x => x.id === e.id ? { ...x, status: 'Sent' } : x)));
        setOpenRow(null);
      }} className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">Mark as Sent</button>
      <button onClick={() => {
        api.delete(`/api/marketing/email/${e.id}`)
          .then(() => setEmails(prev => prev.filter(x => x.id !== e.id)));
        setOpenRow(null);
      }} className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-500">Delete</button>
    </div>
  )}
</div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'Templates' && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loading ? (
              <div className="col-span-2 flex items-center justify-center py-16">
                <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText size={32} className="mb-3 opacity-40"/>
                <p className="text-sm">No templates yet.</p>
              </div>
            ) : templates.map((t,i) => {
              const color = PALETTE[i % PALETTE.length];
              return (
                <div key={t.id||i} className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:shadow-md transition-shadow">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
      style={{background:`${color}18`,color}}><FileText size={22}/></div>
    <div>
      <p className="font-bold dark:text-white">{t.name}</p>
      <p className="text-xs text-slate-400 mt-0.5">{t.category || 'General'} · Used {t.uses||0} times</p>
    </div>
  </div>
  <button
    onClick={() => {
      api.post(`/api/marketing/email/templates/${t.id}/use`)
        .then(res => {
          const updated = res.data?.data || res.data;
          setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, uses: updated.uses } : x));
        });
      setShowCompose(true);
    }}
    className="btn-primary text-xs py-1.5 px-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
  >Use</button>
</div>
              );
            })}
           <div onClick={() => {
  const name = prompt('Template name:');
  const category = prompt('Category (e.g. Newsletter, Launch, Onboarding):');
  if (name) {
    api.post('/api/marketing/email/templates', { name, category })
      .then(res => {
        const t = res.data?.data || res.data;
        if (t) setTemplates(prev => [...prev, t]);
      });
  }
}} className="glass-card p-6 rounded-2xl flex items-center justify-center gap-3 border-dashed cursor-pointer hover:border-primary transition-colors group">
  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
    <Plus size={20} className="text-primary"/>
  </div>
  <span className="text-sm font-semibold text-slate-500 group-hover:text-primary transition-colors">Create New Template</span>
</div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            campaigns={campaigns}
            onClose={() => setShowCompose(false)}
            onAdd={(email) => {
              setEmails(prev => [email, ...prev]);
              toast.success('Email saved successfully.');
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
