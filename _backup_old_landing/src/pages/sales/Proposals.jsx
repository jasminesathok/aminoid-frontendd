import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, Eye, Pencil, Trash2, X, PlusCircle, CheckCircle2, User, Building, MapPin } from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { emitToast } from '../../context/ToastContext';

const STATUSES = ['Draft', 'Sent', 'Open', 'Revised', 'Declined', 'Accepted'];
const statusStyle = {
  Draft:    { bg:'bg-slate-100 dark:bg-slate-800', text:'text-slate-500' },
  Sent:     { bg:'bg-blue-500/10', text:'text-blue-500' },
  Open:     { bg:'bg-sky-500/10', text:'text-sky-500' },
  Accepted: { bg:'bg-emerald-500/10', text:'text-emerald-500' },
  Declined: { bg:'bg-rose-500/10', text:'text-rose-500' },
  Revised:  { bg:'bg-amber-500/10', text:'text-amber-500' },
};

const DEFAULT_FORM = {
  proposal_no: 'PROP-' + Math.floor(1000 + Math.random() * 9000),
  account_id: '',
  contact_person: '',
  valid_until: '',
  currency: 'USD',
  proposal_type: 'Standard',
  sales_person: '',
  notes: '',
  summary: '',
  status: 'Draft',
  items: []
};

const getCurrencySymbol = (code) => ({ USD: '$', EUR: '€', GBP: '£', INR: '₹' })[code] || '$';

export default function Proposals() {
  const { symbol } = useCurrency();
  const [proposals, setProposals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);

  const [form, setForm] = useState(DEFAULT_FORM);

  const loadData = async () => {
    try {
      const [pRes, aRes] = await Promise.all([
        api.get('/api/sales/proposals'),
        api.get('/api/sales/accounts')
      ]);
      setProposals(pRes.data);
      setAccounts(aRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const calculateSubtotal = () => form.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
  const calculateTotalDiscount = () => form.items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const calculateTotalTax = () => form.items.reduce((sum, item) => {
    const itemSub = (Number(item.quantity) * Number(item.rate)) - Number(item.discount || 0);
    return sum + (itemSub * (Number(item.tax_rate || 0) / 100));
  }, 0);
  
  const calculateTotal = () => calculateSubtotal() - calculateTotalDiscount() + calculateTotalTax();

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    const q = Number(newItems[index].quantity) || 0;
    const r = Number(newItems[index].rate) || 0;
    const d = Number(newItems[index].discount) || 0;
    const t = Number(newItems[index].tax_rate) || 0;
    const sub = (q * r) - d;
    newItems[index].amount = sub + (sub * (t / 100));
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { item_name: '', description: '', quantity: 1, rate: 0, tax_rate: 0, discount: 0, amount: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e, saveAsStatus = null) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        status: saveAsStatus || form.status,
        amount: calculateTotal()
      };
      
      if (form.id) {
        await api.put('/api/sales/proposals/' + form.id, payload);
        emitToast('success', 'Proposal updated successfully');
      } else {
        await api.post('/api/sales/proposals', payload);
        emitToast('success', 'Proposal created successfully');
      }
      await loadData();
      setModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this proposal?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/sales/proposals/' + id);
      setProposals(prev => prev.filter(x => x.id !== id));
      emitToast('success', 'Proposal deleted');
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const openNewModal = () => {
    setForm(DEFAULT_FORM);
    setModal(true);
  };

  const openEditModal = async (proposal) => {
    try {
      const res = await api.get('/api/sales/proposals/' + proposal.id);
      const data = res.data;
      setForm({
        id: data.id,
        proposal_no: data.proposal_no || '',
        account_id: data.account_id || '',
        contact_person: data.contact_person || '',
        valid_until: data.valid_until?.split('T')[0] || '',
        currency: data.currency || 'USD',
        proposal_type: data.proposal_type || 'Standard',
        sales_person: data.sales_person || '',
        notes: data.notes || '',
        summary: data.summary || '',
        status: data.status || 'Draft',
        items: data.items || []
      });
      setModal(true);
    } catch (err) { console.error(err); }
  };

  const filtered = proposals.filter(p => 
    (p.proposal_no && p.proposal_no.toLowerCase().includes(search.toLowerCase())) || 
    (p.account_name && p.account_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Sales Proposals</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage customized sales proposals.</p>
          </div>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> New Proposal
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search proposals..."/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Proposal #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((prop, i) => {
                  const st = statusStyle[prop.status] || statusStyle.Draft;
                  return (
                    <motion.tr key={prop.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(prop.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">{prop.proposal_no}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{prop.account_name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.text}`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-500 text-right">
                        {getCurrencySymbol(form.currency)}{Number(prop.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={async () => {
                            const res = await api.get('/api/sales/proposals/' + prop.id);
                            setViewing(res.data);
                          }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Eye size={14}/></button>
                          <button onClick={() => openEditModal(prop)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => handleDelete(prop.id)} disabled={deleting === prop.id} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"><Trash2 size={14}/></button>
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
            <motion.div initial={{ scale:0.95, opacity:0, y: 20 }} animate={{ scale:1, opacity:1, y: 0 }} exit={{ scale:0.95, opacity:0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl shadow-2xl m-auto overflow-hidden">
              
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 rounded-t-3xl shrink-0">
                <h2 className="text-2xl font-bold dark:text-white">{form.id ? 'Edit Proposal' : 'New Sales Proposal'}</h2>
                <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              
              <div className="p-8">
                <form id="proposalForm" onSubmit={(e) => handleSubmit(e, form.status)} className="space-y-8">
                  
                  {/* Proposal Details */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Proposal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Proposal Number *</label>
                        <input required value={form.proposal_no} onChange={e => setForm({...form, proposal_no:e.target.value})} className="input-field w-full" placeholder="PROP-XXXX"/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Customer *</label>
                        <select required value={form.account_id} onChange={e => setForm({...form, account_id:e.target.value})} className="input-field w-full">
                          <option value="">Select Customer</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Contact Person</label>
                        <input value={form.contact_person} onChange={e => setForm({...form, contact_person:e.target.value})} className="input-field w-full" placeholder="e.g. John Doe"/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Valid Until</label>
                        <input type="date" value={form.valid_until} onChange={e => setForm({...form, valid_until:e.target.value})} className="input-field w-full"/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Currency</label>
                        <select value={form.currency} onChange={e => setForm({...form, currency:e.target.value})} className="input-field w-full">
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Proposal Type</label>
                        <select value={form.proposal_type} onChange={e => setForm({...form, proposal_type:e.target.value})} className="input-field w-full">
                          <option value="Standard">Standard</option>
                          <option value="Renewal">Renewal</option>
                          <option value="Custom">Custom Scope</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Sales Representative</label>
                        <input value={form.sales_person} onChange={e => setForm({...form, sales_person:e.target.value})} className="input-field w-full" placeholder="e.g. Jane Smith"/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Status</label>
                        <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} className="input-field w-full">
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Items & Pricing */}
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Items & Pricing</h3>
                      <button type="button" onClick={addItem} className="text-primary font-bold text-sm flex items-center gap-1 hover:text-primary/80 transition-colors">
                        <PlusCircle size={16}/> Add Item
                      </button>
                    </div>

                    <div className="space-y-4">
                      {form.items.length === 0 && (
                        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                          <p className="text-slate-400 font-medium">No items added to this proposal yet.</p>
                          <button type="button" onClick={addItem} className="mt-2 text-primary font-bold">Add first item</button>
                        </div>
                      )}
                      
                      {form.items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex gap-4">
                          <div className="flex-1 grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-4 space-y-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</label>
                              <input required value={item.item_name} onChange={e => handleItemChange(idx, 'item_name', e.target.value)} className="input-field w-full text-sm" placeholder="e.g. Website Design"/>
                            </div>
                            <div className="col-span-6 md:col-span-2 space-y-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qty</label>
                              <input type="number" min="1" required value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="input-field w-full text-sm"/>
                            </div>
                            <div className="col-span-6 md:col-span-2 space-y-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rate</label>
                              <input type="number" step="0.01" required value={item.rate} onChange={e => handleItemChange(idx, 'rate', e.target.value)} className="input-field w-full text-sm"/>
                            </div>
                            <div className="col-span-4 md:col-span-1 space-y-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disc.</label>
                              <input type="number" step="0.01" value={item.discount} onChange={e => handleItemChange(idx, 'discount', e.target.value)} className="input-field w-full text-sm"/>
                            </div>
                            <div className="col-span-4 md:col-span-1 space-y-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tax %</label>
                              <input type="number" step="0.01" value={item.tax_rate} onChange={e => handleItemChange(idx, 'tax_rate', e.target.value)} className="input-field w-full text-sm"/>
                            </div>
                            <div className="col-span-4 md:col-span-2 space-y-1">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</label>
                              <div className="input-field w-full bg-white dark:bg-slate-900 border-transparent font-bold text-slate-600 dark:text-slate-300">
                                {Number(item.amount).toFixed(2)}
                              </div>
                            </div>
                            <div className="col-span-12 space-y-1">
                              <input value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="input-field w-full text-sm" placeholder="Additional description (optional)"/>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeItem(idx)} className="self-start p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors mt-6">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="w-full max-w-sm space-y-3 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-slate-500 font-medium text-sm">
                        <span>Subtotal:</span>
                        <span>{getCurrencySymbol(form.currency)}{calculateSubtotal().toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium text-sm">
                        <span>Total Discount:</span>
                        <span className="text-rose-500">-{getCurrencySymbol(form.currency)}{calculateTotalDiscount().toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium text-sm">
                        <span>Total Tax:</span>
                        <span>{getCurrencySymbol(form.currency)}{calculateTotalTax().toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-bold dark:text-white">Total Amount:</span>
                        <span className="text-2xl font-black text-emerald-500">{getCurrencySymbol(form.currency)}{calculateTotal().toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Summary */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Proposal Notes (Internal)</label>
                        <textarea rows="4" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} className="input-field w-full" placeholder="Add internal notes regarding this proposal..."/>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Proposal Summary (Client Facing)</label>
                        <textarea rows="4" value={form.summary} onChange={e => setForm({...form, summary:e.target.value})} className="input-field w-full" placeholder="Enter a brief executive summary for the client..."/>
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              {/* Actions Footer */}
              <div className="shrink-0 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-3xl flex items-center justify-between">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary px-6 py-2.5">Cancel</button>
                <div className="flex gap-3">
                  <button type="button" onClick={(e) => handleSubmit(e, 'Draft')} className="px-6 py-2.5 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Save as Draft
                  </button>
                  <button type="submit" form="proposalForm" className="btn-primary px-8 py-2.5 font-bold shadow-lg shadow-primary/20">
                    {form.id ? 'Update Proposal' : 'Create Proposal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal (Digital Document) */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-12 overflow-y-auto"
            onClick={() => setViewing(null)}>
            <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl my-8 overflow-hidden border border-slate-100 dark:border-slate-800"
              onClick={e => e.stopPropagation()}>
              
              <div className="bg-slate-50 dark:bg-slate-800/80 p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <FileText className="text-primary" size={32}/>
                    Proposal: {viewing.proposal_no}
                  </h2>
                  <div className="flex items-center gap-4 mt-3 text-slate-500 font-medium text-sm">
                    <span className="flex items-center gap-1.5"><Building size={16}/> {viewing.account_name}</span>
                    {viewing.contact_person && <span className="flex items-center gap-1.5"><User size={16}/> {viewing.contact_person}</span>}
                  </div>
                </div>
                <button onClick={() => setViewing(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500"><X size={20}/></button>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">To</p>
                      <p className="font-bold dark:text-slate-200 text-lg">{viewing.account_name}</p>
                      {viewing.account_email && <p className="text-slate-500 text-sm">{viewing.account_email}</p>}
                      {viewing.account_address && <p className="text-slate-500 text-sm max-w-xs">{viewing.account_address}</p>}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusStyle[viewing.status]?.bg || 'bg-slate-100'} ${statusStyle[viewing.status]?.text || 'text-slate-500'}`}>
                        {viewing.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Valid Until</p>
                      <p className="font-bold dark:text-slate-300">{viewing.valid_until ? new Date(viewing.valid_until).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                </div>

                {viewing.summary && (
                  <div className="mb-10 p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Executive Summary</p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {viewing.summary}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-8">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Item & Description</th>
                        <th className="px-6 py-4 text-center">Qty</th>
                        <th className="px-6 py-4 text-right">Rate</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {viewing.items?.map((item, idx) => (
                        <tr key={idx} className="bg-white dark:bg-slate-900">
                          <td className="px-6 py-4">
                            <p className="font-bold dark:text-slate-200">{item.item_name}</p>
                            {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                          <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">{getCurrencySymbol(form.currency)}{Number(item.rate).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">{getCurrencySymbol(form.currency)}{Number(item.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-sm">Total Investment</span>
                      <span className="text-3xl font-black text-emerald-500">{getCurrencySymbol(form.currency)}{Number(viewing.amount).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
