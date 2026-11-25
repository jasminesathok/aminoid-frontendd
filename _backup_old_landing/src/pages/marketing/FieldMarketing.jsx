import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin, Eye, Trash2, X, Calendar, Flag, Pencil } from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

const EVENT_TYPES = ['Trade Show', 'Conference', 'Pop-up', 'Meetup', 'Workshop'];
const STATUSES = ['Planning', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'];

const statusStyle = {
  Planning:  { bg:'bg-slate-100 dark:bg-slate-800', text:'text-slate-500', dot:'bg-slate-400' },
  Confirmed: { bg:'bg-blue-500/10', text:'text-blue-500', dot:'bg-blue-500' },
  Ongoing:   { bg:'bg-amber-500/10', text:'text-amber-500', dot:'bg-amber-500' },
  Completed: { bg:'bg-emerald-500/10', text:'text-emerald-500', dot:'bg-emerald-500' },
  Cancelled: { bg:'bg-rose-500/10', text:'text-rose-500', dot:'bg-rose-500' },
};

export default function FieldMarketing() {
  const { symbol } = useCurrency();
  const [events,  setEvents]  = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,    setForm]    = useState({ name:'', location:'', type:'Trade Show', status:'Planning', budget:0, leads_target:0, date: new Date().toISOString().split('T')[0], campaign_id:'' });

  const loadData = async () => {
    try {
      const [res, cres] = await Promise.all([
        api.get('/api/marketing/field-events'),
        api.get('/api/marketing/campaigns')
      ]);
      setEvents(res.data.data ?? res.data ?? []);
      setCampaigns(cres.data.data ?? cres.data ?? []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/marketing/field-events', form);
      loadData();
      setModal(false);
      setForm({ name:'', location:'', type:'Trade Show', status:'Planning', budget:0, leads_target:0, date: new Date().toISOString().split('T')[0], campaign_id:'' });
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (e) => {
  e.preventDefault();
  try {
    await api.put(`/api/marketing/field-events/${editTarget.id}`, form);
    loadData();
    setEditTarget(null);
  } catch (err) { console.error(err); }
};

  const filtered = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Field Marketing</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Plan and track physical events, trade shows, and meetups.</p>
          </div>
          <button onClick={() => {
  setForm({ name:'', location:'', type:'Trade Show', status:'Planning', budget:0, leads_target:0, date: new Date().toISOString().split('T')[0], campaign_id:'' });
  setModal(true);
}} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> New Event
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search events..."/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((evt, i) => {
                  const st = statusStyle[evt.status] || statusStyle.Planning;
                  return (
                    <motion.tr key={evt.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <Flag size={16}/>
                          </div>
                          <span className="text-sm font-bold dark:text-slate-200">{evt.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400"/>
                          {evt.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{evt.type}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(evt.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{evt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">
  {symbol}{Number(evt.budget).toLocaleString()}
</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
  {/* ADD THIS FIRST: */}
  <button title="Edit" onClick={() => { setEditTarget(evt); setForm({ name: evt.name, location: evt.location, type: evt.type, status: evt.status, budget: evt.budget, leads_target: evt.leads_target, date: evt.date?.split('T')[0], campaign_id: evt.campaign_id || '' }); }}
    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
    <Pencil size={14}/>
  </button>
  {/* KEEP only this delete button: */}
  <button title="Delete" onClick={async () => { await api.delete(`/api/marketing/field-events/${evt.id}`); loadData(); }}
    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
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
                <h2 className="text-xl font-bold dark:text-white">New Event</h2>
                <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Event Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="input-field w-full" placeholder="e.g. Annual Tech Summit"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Location</label>
                  <input required value={form.location} onChange={e => setForm({...form, location:e.target.value})} className="input-field w-full" placeholder="City, Venue"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type:e.target.value})} className="input-field w-full">
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{`Budget (${symbol})`}</label>
                    <input type="number" value={form.budget} onChange={e => setForm({...form, budget:e.target.value})} className="input-field w-full"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Leads Target</label>
                    <input type="number" value={form.leads_target} onChange={e => setForm({...form, leads_target:e.target.value})} className="input-field w-full"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Date</label>
                    <input type="date" required value={form.date} onChange={e => setForm({...form, date:e.target.value})} className="input-field w-full"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Associated Campaign</label>
                    <select value={form.campaign_id} onChange={e => setForm({...form, campaign_id:e.target.value})} className="input-field w-full">
                      <option value="">None</option>
                      {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-4 text-sm font-bold shadow-lg shadow-primary/20">Save Event</button>
              </form>
            </motion.div>
          </motion.div>
        )}
        {editTarget && (
  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">Edit Event</h2>
        <button onClick={() => setEditTarget(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
      </div>
      {/* Reuse the same form fields as the New Event modal, but onSubmit={handleEdit} */}
      <form onSubmit={handleEdit} className="p-6 space-y-4">
       
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Event Name</label>
    <input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="input-field w-full" placeholder="e.g. Annual Tech Summit"/>
  </div>
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Location</label>
    <input required value={form.location} onChange={e => setForm({...form, location:e.target.value})} className="input-field w-full" placeholder="City, Venue"/>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Type</label>
      <select value={form.type} onChange={e => setForm({...form, type:e.target.value})} className="input-field w-full">
        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{`Budget (${symbol})`}</label>
      <input type="number" value={form.budget} onChange={e => setForm({...form, budget:e.target.value})} className="input-field w-full"/>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Leads Target</label>
      <input type="number" value={form.leads_target} onChange={e => setForm({...form, leads_target:e.target.value})} className="input-field w-full"/>
    </div>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Date</label>
      <input type="date" required value={form.date} onChange={e => setForm({...form, date:e.target.value})} className="input-field w-full"/>
    </div>
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Associated Campaign</label>
      <select value={form.campaign_id} onChange={e => setForm({...form, campaign_id:e.target.value})} className="input-field w-full">
        <option value="">None</option>
        {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  </div>
  <button type="submit" className="btn-primary w-full py-3 mt-4 text-sm font-bold shadow-lg shadow-primary/20">Update Event</button>
</form>
        
     
    </motion.div>
  </motion.div>
)}
      </AnimatePresence>
    </DashboardLayout>
  );
}
