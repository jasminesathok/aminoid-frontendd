import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Eye, Pencil, Trash2, X, User, Briefcase, Mail, Phone, Calendar, Target, Hash } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../utils/api';
import { emitToast } from '../../context/ToastContext';

const DEFAULT_FORM = {
  name: '',
  job_title: '',
  company: '',
  email: '',
  phone: '',
  address: '',
  source: 'Website',
  status: 'New',
  lead_score: 0,
  assigned_to: '',
  value: '',
  campaign_id: '',
  follow_up_date: '',
  notes: ''
};

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Email Campaign', 'Other'];

const statusStyle = {
  'New':         { bg:'bg-slate-100 dark:bg-slate-800',  text:'text-slate-500' },
  'Contacted':   { bg:'bg-amber-500/10',  text:'text-amber-500' },
  'Qualified':   { bg:'bg-blue-500/10',   text:'text-blue-500' },
  'Proposal':    { bg:'bg-purple-500/10', text:'text-purple-500' },
  'Closed Won':  { bg:'bg-emerald-500/10',text:'text-emerald-500' },
  'Closed Lost': { bg:'bg-rose-500/10',   text:'text-rose-500' }
};

export default function Leads() {
  const { symbol } = useCurrency();
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);
  
  const [form, setForm] = useState(DEFAULT_FORM);

  const loadData = async () => {
    try {
      const [lRes, cRes] = await Promise.all([
        api.get('/api/marketing/leads'),
        api.get('/api/marketing/campaigns')
      ]);
      setLeads(lRes.data);
      setCampaigns(cRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...form,
        lead_score: Number(form.lead_score) || 0,
        value: Number(form.value) || 0,
        campaign_id: form.campaign_id || null,
        follow_up_date: form.follow_up_date || null
      };
      
      if (form.id) {
        await api.put('/api/marketing/leads/' + form.id, payload);
        emitToast('success', 'Lead updated successfully');
      } else {
        await api.post('/api/marketing/leads', payload);
        emitToast('success', 'Lead created successfully');
      }
      await loadData();
      setModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/marketing/leads/' + id);
      setLeads(prev => prev.filter(x => x.id !== id));
      emitToast('success', 'Lead deleted');
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const openNewModal = () => {
    setForm(DEFAULT_FORM);
    setModal(true);
  };

  const openEditModal = (lead) => {
    setForm({
      id: lead.id,
      name: lead.name || '',
      job_title: lead.job_title || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address || '',
      source: lead.source || 'Website',
      status: lead.status || 'New',
      lead_score: lead.lead_score || 0,
      assigned_to: lead.assigned_to || '',
      value: lead.value || '',
      campaign_id: lead.campaign_id || '',
      follow_up_date: lead.follow_up_date?.split('T')[0] || '',
      notes: lead.notes || ''
    });
    setModal(true);
  };

  const filtered = leads.filter(l => 
    (l.name && l.name.toLowerCase().includes(search.toLowerCase())) || 
    (l.company && l.company.toLowerCase().includes(search.toLowerCase())) ||
    (l.email && l.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Marketing Leads</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Capture, manage, and convert your leads.</p>
          </div>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> New Lead
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search leads..."/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Lead Info</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status / Score</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((lead, i) => {
                  const st = statusStyle[lead.status] || statusStyle.New;
                  return (
                    <motion.tr key={lead.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold dark:text-slate-200">{lead.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{lead.job_title ? `${lead.job_title} at ` : ''}{lead.company || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-slate-500 mt-0.5">{lead.phone}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold mb-1 ${st.bg} ${st.text}`}>
                          {lead.status}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Target size={12}/> Score: <span className="text-slate-600 dark:text-slate-300 font-bold">{lead.lead_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {lead.assigned_to || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-500">
                        {symbol}{Number(lead.value).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewing(lead)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Eye size={14}/></button>
                          <button onClick={() => openEditModal(lead)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => handleDelete(lead.id)} disabled={deleting === lead.id} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"><Trash2 size={14}/></button>
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

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-12 overflow-y-auto">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl m-auto">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between rounded-t-3xl">
                <h2 className="text-2xl font-bold dark:text-white">{form.id ? 'Edit Lead' : 'New Marketing Lead'}</h2>
                <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Lead Name *</label>
                      <input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="input-field w-full" placeholder="John Doe"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Job Title</label>
                      <input value={form.job_title} onChange={e => setForm({...form, job_title:e.target.value})} className="input-field w-full" placeholder="e.g. Marketing Director"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Company</label>
                      <input value={form.company} onChange={e => setForm({...form, company:e.target.value})} className="input-field w-full" placeholder="Acme Corp"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} className="input-field w-full" placeholder="john@example.com"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} className="input-field w-full" placeholder="+1 (555) 000-0000"/>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Address</label>
                      <input value={form.address} onChange={e => setForm({...form, address:e.target.value})} className="input-field w-full" placeholder="123 Main St, City, Country"/>
                    </div>
                  </div>
                </div>

                {/* Lead Status & Assignment */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Lead Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Lead Source</label>
                      <select value={form.source} onChange={e => setForm({...form, source:e.target.value})} className="input-field w-full">
                        {SOURCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Campaign (Optional)</label>
                      <select value={form.campaign_id} onChange={e => setForm({...form, campaign_id:e.target.value})} className="input-field w-full">
                        <option value="">No Campaign</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Lead Status</label>
                      <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} className="input-field w-full">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Lead Score (0-100)</label>
                      <input type="number" min="0" max="100" value={form.lead_score} onChange={e => setForm({...form, lead_score:e.target.value})} className="input-field w-full" placeholder="e.g. 75"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Assigned To</label>
                      <input value={form.assigned_to} onChange={e => setForm({...form, assigned_to:e.target.value})} className="input-field w-full" placeholder="e.g. Jane Smith"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Expected Value</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{symbol}</span>
                        <input type="number" step="0.01" value={form.value} onChange={e => setForm({...form, value:e.target.value})} className="input-field w-full pl-8" placeholder="0.00"/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Follow-Up Date</label>
                      <input type="date" value={form.follow_up_date} onChange={e => setForm({...form, follow_up_date:e.target.value})} className="input-field w-full"/>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Internal Notes</h3>
                  <textarea rows="3" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} className="input-field w-full" placeholder="Record interactions, next steps..."/>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-4 rounded-b-3xl">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary px-6 py-2.5">Cancel</button>
                  <button type="submit" className="btn-primary px-8 py-2.5 font-bold shadow-lg shadow-primary/20">
                    {form.id ? 'Save Changes' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-12 overflow-y-auto"
            onClick={() => setViewing(null)}>
            <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl m-auto overflow-hidden"
              onClick={e => e.stopPropagation()}>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {viewing.name[0]?.toUpperCase() || 'L'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tight">{viewing.name}</h2>
                    <p className="text-slate-500 font-medium">{viewing.job_title ? `${viewing.job_title} @ ` : ''}{viewing.company || '—'}</p>
                  </div>
                </div>
                <button onClick={() => setViewing(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500"><X size={20}/></button>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  <div className="flex items-center gap-3">
                    <Mail className="text-slate-400" size={18}/>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                      <p className="font-medium dark:text-slate-200">{viewing.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="text-slate-400" size={18}/>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
                      <p className="font-medium dark:text-slate-200">{viewing.phone || '—'}</p>
                    </div>
                  </div>

                  {viewing.address && (
                    <div className="flex items-center gap-3 md:col-span-2">
                      <Briefcase className="text-slate-400" size={18}/>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Address</p>
                        <p className="font-medium dark:text-slate-200">{viewing.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <User className="text-slate-400" size={18}/>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Assigned To</p>
                      <p className="font-medium dark:text-slate-200">{viewing.assigned_to || 'Unassigned'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="text-slate-400" size={18}/>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Follow-Up Date</p>
                      <p className="font-medium dark:text-slate-200">{viewing.follow_up_date ? new Date(viewing.follow_up_date).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${statusStyle[viewing.status]?.bg} ${statusStyle[viewing.status]?.text}`}>
                      {viewing.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Score</p>
                    <div className="flex items-center gap-1 font-bold text-lg dark:text-white">
                      <Target size={16} className={viewing.lead_score >= 80 ? 'text-emerald-500' : viewing.lead_score >= 50 ? 'text-amber-500' : 'text-slate-400'}/> 
                      {viewing.lead_score}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Exp. Value</p>
                    <p className="font-bold text-lg text-emerald-500">{symbol}{Number(viewing.value).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Source</p>
                    <p className="font-medium dark:text-slate-300 text-sm">{viewing.source}</p>
                  </div>
                </div>

                {viewing.notes && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Internal Notes</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                      {viewing.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}