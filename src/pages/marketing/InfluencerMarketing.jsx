import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, Eye, Trash2, X, Star, ExternalLink } from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

const STATUSES = ['Contacted', 'Negotiating', 'Active', 'Completed'];
const statusStyle = {
  Contacted:   { bg:'bg-slate-100 dark:bg-slate-800', text:'text-slate-500', dot:'bg-slate-400' },
  Negotiating: { bg:'bg-amber-500/10', text:'text-amber-500', dot:'bg-amber-500' },
  Active:      { bg:'bg-emerald-500/10', text:'text-emerald-500', dot:'bg-emerald-500' },
  Completed:   { bg:'bg-blue-500/10', text:'text-blue-500', dot:'bg-blue-500' },
};

export default function InfluencerMarketing() {
  const { symbol } = useCurrency();
  const [influencers, setInfluencers] = useState([]);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [campaigns,   setCampaigns]   = useState([]);
  const [modal,       setModal]       = useState(false);
  const [openRow,  setOpenRow]  = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form,        setForm]        = useState({ name:'', platform:'Instagram', handle:'', followers:0, niche:'', status:'Contacted', budget:0, campaign_id:'' });

  const loadData = async () => {
    try {
      const [res, cres] = await Promise.all([
        api.get('/api/marketing/influencers'),
        api.get('/api/marketing/campaigns')
      ]);
      setInfluencers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      setCampaigns(Array.isArray(cres.data) ? cres.data : (cres.data?.data || []));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  useEffect(() => {
  const close = () => setOpenRow(null);
  document.addEventListener('click', close);
  return () => document.removeEventListener('click', close);
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/marketing/influencers', form);
      loadData();
      setModal(false);
      setForm({ name:'', platform:'Instagram', handle:'', followers:0, niche:'', status:'Contacted', budget:0, campaign_id:'' });
    } catch (err) { console.error(err); }
  };

  const filtered = influencers.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.handle.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Influencer Marketing</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage influencer partnerships and campaign collaborations.</p>
          </div>
          <button onClick={() => {
            setForm({ name:'', platform:'Instagram', handle:'', followers:0, niche:'', status:'Contacted', budget:0, campaign_id:'' });
            setModal(true);
          }} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> Add Influencer
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search influencers..."/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Influencer</th>
                  <th className="px-6 py-4">Platform</th>
                  <th className="px-6 py-4">Followers</th>
                  <th className="px-6 py-4">Niche</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((inf, i) => {
                  const st = statusStyle[inf.status] || statusStyle.Contacted;
                  return (
                    <motion.tr key={inf.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                            {inf.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-slate-200">{inf.name}</p>
                            <p className="text-xs text-slate-400">{inf.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {inf.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">
  {symbol}{Number(inf.budget).toLocaleString()}
</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{inf.niche || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{inf.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">
  {symbol}{Number(inf.budget).toLocaleString()}
</td>
                      <td className="px-6 py-4 text-right">
  <div className="flex items-center justify-end gap-2">
    <button onClick={() => setEditItem(inf)}
      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors">
      <ExternalLink size={14}/>
    </button>
    <button onClick={() => {
      if (window.confirm(`Delete ${inf.name}?`)) {
        api.delete(`/api/marketing/influencers/${inf.id}`)
          .then(() => setInfluencers(prev => prev.filter(x => x.id !== inf.id)));
      }
    }} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
      <Trash2 size={14}/>
    </button>
  </div>
</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Add Influencer</h2>
                <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="input-field w-full" placeholder="John Doe"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Handle</label>
                    <input required value={form.handle} onChange={e => setForm({...form, handle:e.target.value})} className="input-field w-full" placeholder="@johndoe"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Platform</label>
                    <select value={form.platform} onChange={e => setForm({...form, platform:e.target.value})} className="input-field w-full">
                      <option>Instagram</option>
                      <option>YouTube</option>
                      <option>TikTok</option>
                      <option>Twitter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} className="input-field w-full">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Followers</label>
                    <input type="number" value={form.followers} onChange={e => setForm({...form, followers:e.target.value})} className="input-field w-full"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{`Budget (${symbol})`}</label>
                    <input type="number" value={form.budget} onChange={e => setForm({...form, budget:e.target.value})} className="input-field w-full"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Niche</label>
                    <input value={form.niche} onChange={e => setForm({...form, niche:e.target.value})} className="input-field w-full" placeholder="e.g. Technology, Fashion"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Associated Campaign</label>
                    <select value={form.campaign_id} onChange={e => setForm({...form, campaign_id:e.target.value})} className="input-field w-full">
                      <option value="">None</option>
                      {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-4 text-sm font-bold shadow-lg shadow-primary/20">Save Influencer</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
  {editItem && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold dark:text-white">Edit Influencer</h2>
          <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="space-y-3">
          {[['Name','name'],['Handle','handle'],['Niche','niche']].map(([label, key]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
              <input value={editItem[key] || ''} onChange={e => setEditItem(p => ({...p, [key]: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary"/>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Followers</label>
              <input type="number" value={editItem.followers || ''} onChange={e => setEditItem(p => ({...p, followers: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{`Budget (${symbol})`}</label>
              <input type="number" value={editItem.budget || ''} onChange={e => setEditItem(p => ({...p, budget: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select value={editItem.status || 'Contacted'} onChange={e => setEditItem(p => ({...p, status: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary">
                {['Contacted','Negotiating','Active','Completed','Rejected'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Associated Campaign</label>
              <select value={editItem.campaign_id || ''} onChange={e => setEditItem(p => ({...p, campaign_id: e.target.value}))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary">
                <option value="">None</option>
                {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditItem(null)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={() => {
              api.put(`/api/marketing/influencers/${editItem.id}`, editItem)
                .then(() => {
                  setInfluencers(prev => prev.map(x => x.id === editItem.id ? editItem : x));
                  setEditItem(null);
                });
            }} className="flex-1 btn-primary text-sm py-2.5">Save Changes</button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </DashboardLayout>
  );
}
