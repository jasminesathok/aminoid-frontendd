import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileSignature, Eye, Pencil, Trash2, X, UploadCloud, File as FileIcon, XCircle, Download } from 'lucide-react';
import { api, BASE_URL } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { emitToast } from '../../context/ToastContext';

const STATUSES = ['Draft', 'Sent', 'Expired', 'Declined', 'Accepted'];
const statusStyle = {
  Draft:    { bg:'bg-slate-100 dark:bg-slate-800', text:'text-slate-500', dot:'bg-slate-400' },
  Sent:     { bg:'bg-blue-500/10', text:'text-blue-500', dot:'bg-blue-500' },
  Accepted: { bg:'bg-emerald-500/10', text:'text-emerald-500', dot:'bg-emerald-500' },
  Declined: { bg:'bg-rose-500/10', text:'text-rose-500', dot:'bg-rose-500' },
  Expired:  { bg:'bg-amber-500/10', text:'text-amber-500', dot:'bg-amber-500' },
};

const DEFAULT_FORM = {
  account_id: '',
  estimate_no: '',
  status: 'Draft',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  expiry_date: '',
  billing_address: '',
  notes: '',
  currency: 'USD'
};

export default function Estimates() {
  const { symbol } = useCurrency();
  const [estimates, setEstimates] = useState([]);
  const [accounts,  setAccounts]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  
  const [modal,     setModal]     = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [viewing,   setViewing]   = useState(null);
  
  const [form, setForm] = useState(DEFAULT_FORM);
  const [items, setItems] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  const loadData = async () => {
    try {
      const [eRes, aRes] = await Promise.all([
        api.get('/api/sales/estimates'),
        api.get('/api/sales/accounts')
      ]);
      setEstimates(eRes.data);
      setAccounts(aRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  // Items logic with Discount & Tax
  const addItem = () => setItems([...items, { id: Date.now(), item_name: '', description: '', quantity: 1, rate: 0, discount: 0, tax_rate: 0, amount: 0 }]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));
  
  const updateItem = (id, field, value) => {
    setItems(items.map(i => {
      if (i.id === id) {
        const updated = { ...i, [field]: value };
        const qty = Number(updated.quantity) || 0;
        const rate = Number(updated.rate) || 0;
        const disc = Number(updated.discount) || 0;
        const taxRate = Number(updated.tax_rate) || 0;
        
        let lineAmount = qty * rate;
        lineAmount = lineAmount - disc; // Assuming discount is absolute. If it's %, use lineAmount * (1 - disc/100)
        lineAmount = lineAmount + (lineAmount * (taxRate / 100));
        
        updated.amount = Math.max(0, lineAmount).toFixed(2);
        return updated;
      }
      return i;
    }));
  };

  useEffect(() => {
    if (modal) {
      const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
      setForm(prev => ({ ...prev, amount: total.toFixed(2) }));
    }
  }, [items, modal]);

  // File Upload Logic
  const fileInputRef = useRef(null);
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };
  const handleFileSelect = (e) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const deleteExistingAttachment = async (estId, attId) => {
    if(!window.confirm('Delete this attachment?')) return;
    try {
      await api.delete(`/api/sales/estimates/${estId}/attachments/${attId}`);
      setExistingAttachments(prev => prev.filter(a => a.id !== attId));
      emitToast('success', 'Attachment deleted');
    } catch (err) { console.error(err); }
  };

  const uploadAttachments = async (estimateId) => {
    if (attachments.length === 0) return;
    const token = localStorage.getItem('token');
    
    for (const file of attachments) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await fetch(`${BASE_URL}/api/sales/estimates/${estimateId}/attachments`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } catch (err) {
        console.error('Failed to upload', file.name, err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, items, expiry_date: form.expiry_date || null };
      let createdEstimateId;

      if (form.id) {
        await api.put('/api/sales/estimates/' + form.id, payload);
        createdEstimateId = form.id;
        emitToast('success', 'Estimate updated successfully');
      } else {
        const res = await api.post('/api/sales/estimates', payload);
        createdEstimateId = res.data.id;
        emitToast('success', 'Estimate created successfully');
      }

      await uploadAttachments(createdEstimateId);
      await loadData();
      setModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this estimate?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/sales/estimates/' + id);
      setEstimates(prev => prev.filter(x => x.id !== id));
      emitToast('success', 'Estimate deleted');
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const openNewModal = () => {
    setForm(DEFAULT_FORM);
    setItems([{ id: Date.now(), item_name: '', description: '', quantity: 1, rate: 0, discount: 0, tax_rate: 0, amount: 0 }]);
    setAttachments([]);
    setExistingAttachments([]);
    setModal(true);
  };

  const openEditModal = async (est) => {
    try {
      const res = await api.get('/api/sales/estimates/' + est.id);
      const data = res.data;
      setForm({
        id: data.id,
        account_id: data.account_id || '',
        estimate_no: data.estimate_no,
        status: data.status,
        amount: data.amount,
        date: data.date?.split('T')[0] || '',
        expiry_date: data.expiry_date?.split('T')[0] || '',
        billing_address: data.billing_address || '',
        notes: data.notes || '',
        currency: data.currency || 'USD'
      });
      setItems(data.items?.length ? data.items.map(i => ({...i, id: i.id || Date.now() + Math.random()})) : []);
      setExistingAttachments(data.attachments || []);
      setAttachments([]);
      setModal(true);
    } catch(err) { console.error(err); }
  };

  const filtered = estimates.filter(e => 
    e.estimate_no.toLowerCase().includes(search.toLowerCase()) || 
    (e.account_name && e.account_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Estimates</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage proposals and estimates for clients.</p>
          </div>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> New Estimate
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search estimates..."/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Estimate #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((est, i) => {
                  const st = statusStyle[est.status] || statusStyle.Draft;
                  return (
                    <motion.tr key={est.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">{est.estimate_no}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{est.account_name || '—'}</td>
                      <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">{symbol}{Number(est.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(est.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{est.expiry_date ? new Date(est.expiry_date).toLocaleDateString() : '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{est.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={async () => {
                            const res = await api.get('/api/sales/estimates/' + est.id);
                            setViewing(res.data);
                          }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Eye size={14}/></button>
                          <button onClick={() => openEditModal(est)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => handleDelete(est.id)} disabled={deleting === est.id} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"><Trash2 size={14}/></button>
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
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl my-8">
              <div className=" bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 rounded-t-3xl">
                <h2 className="text-2xl font-bold dark:text-white">{form.id ? 'Edit Estimate' : 'New Estimate'}</h2>
                <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Customer / Account *</label>
                    <select required value={form.account_id} onChange={e => setForm({...form, account_id:e.target.value})} className="input-field w-full">
                      <option value="">Select Customer</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Estimate Number *</label>
                    <input required value={form.estimate_no} onChange={e => setForm({...form, estimate_no:e.target.value})} className="input-field w-full" placeholder="EST-0001"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Estimate Date *</label>
                    <input required type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} className="input-field w-full"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Expiry Date</label>
                    <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date:e.target.value})} className="input-field w-full"/>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Billing Address</label>
                    <textarea rows="2" value={form.billing_address} onChange={e => setForm({...form, billing_address:e.target.value})} className="input-field w-full" placeholder="Enter billing address..."/>
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
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} className="input-field w-full">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Line Items</h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4">
                    {items.map((item, idx) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-start">
                        <div className="col-span-12 md:col-span-3 space-y-2">
                          {idx === 0 && <label className="text-xs font-bold text-slate-500 uppercase">Item Details</label>}
                          <input placeholder="Item name" required value={item.item_name} onChange={e => updateItem(item.id, 'item_name', e.target.value)} className="input-field w-full text-sm"/>
                          <input placeholder="Description" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="input-field w-full text-sm text-slate-500"/>
                        </div>
                        <div className="col-span-4 md:col-span-1 space-y-2">
                          {idx === 0 && <label className="text-xs font-bold text-slate-500 uppercase">Qty</label>}
                          <input type="number" min="1" required value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} className="input-field w-full text-sm"/>
                        </div>
                        <div className="col-span-4 md:col-span-2 space-y-2">
                          {idx === 0 && <label className="text-xs font-bold text-slate-500 uppercase">Price</label>}
                          <input type="number" step="0.01" required value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)} className="input-field w-full text-sm"/>
                        </div>
                        <div className="col-span-4 md:col-span-1 space-y-2">
                          {idx === 0 && <label className="text-xs font-bold text-slate-500 uppercase">Disc(Amt)</label>}
                          <input type="number" step="0.01" value={item.discount} onChange={e => updateItem(item.id, 'discount', e.target.value)} className="input-field w-full text-sm"/>
                        </div>
                        <div className="col-span-4 md:col-span-1 space-y-2">
                          {idx === 0 && <label className="text-xs font-bold text-slate-500 uppercase">Tax(%)</label>}
                          <input type="number" step="0.01" value={item.tax_rate} onChange={e => updateItem(item.id, 'tax_rate', e.target.value)} className="input-field w-full text-sm"/>
                        </div>
                        <div className="col-span-8 md:col-span-3 space-y-2">
                          {idx === 0 && <label className="text-xs font-bold text-slate-500 uppercase">Total</label>}
                          <div className="input-field w-full text-sm bg-slate-100/50 dark:bg-slate-900/50 font-bold flex items-center">{symbol}{item.amount}</div>
                        </div>
                        <div className="col-span-12 md:col-span-1 flex items-center justify-end md:justify-center">
                          {idx === 0 && <label className="hidden md:block text-xs font-bold text-transparent uppercase select-none">Del</label>}
                          <button type="button" onClick={() => removeItem(item.id)} className="p-2 mt-0 md:mt-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addItem} className="text-sm font-bold text-primary flex items-center gap-1 hover:bg-primary/5 p-2 rounded-lg transition-colors">
                      <Plus size={16}/> Add Line Item
                    </button>
                  </div>

                  <div className="flex justify-end pt-4">
                    <div className="w-64 space-y-3">
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>Subtotal (w/ Tax & Disc)</span>
                        <span>{symbol}{form.amount}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black dark:text-white border-t border-slate-200 dark:border-slate-700 pt-3">
                        <span>Total Amount</span>
                        <span>{symbol}{form.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes & Attachments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Notes</h3>
                    <textarea rows="5" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} className="input-field w-full mt-2" placeholder="Terms, conditions, or extra info..."/>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Attach Files</h3>
                    <div className="mt-2">
                      <div 
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <UploadCloud className="text-slate-400 mb-3" size={32}/>
                        <p className="text-sm font-bold dark:text-white">Drag & drop files here</p>
                        <p className="text-xs text-slate-500 mt-1">or click to browse (PDF, JPG, PNG, DOCX)</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                      </div>
                      
                      { (existingAttachments.length > 0 || attachments.length > 0) && (
                        <div className="mt-4 space-y-2">
                          {existingAttachments.map((file) => (
                            <div key={file.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shrink-0"><FileIcon size={16} className="text-primary"/></div>
                                <div className="truncate">
                                  <p className="text-sm font-bold dark:text-slate-200 truncate">{file.file_name}</p>
                                  <p className="text-xs text-slate-500">{(file.file_size / 1024).toFixed(1)} KB (Uploaded)</p>
                                </div>
                              </div>
                              <button type="button" onClick={() => deleteExistingAttachment(form.id, file.id)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md shrink-0"><XCircle size={16}/></button>
                            </div>
                          ))}
                          
                          {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shrink-0"><FileIcon size={16} className="text-emerald-500"/></div>
                                <div className="truncate">
                                  <p className="text-sm font-bold dark:text-slate-200 truncate">{file.name}</p>
                                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB (New)</p>
                                </div>
                              </div>
                              <button type="button" onClick={() => removeAttachment(idx)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md shrink-0"><XCircle size={16}/></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3  bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-4 rounded-b-3xl">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary px-6 py-2.5">Cancel</button>
                  <button type="submit" className="btn-primary px-8 py-2.5 font-bold shadow-lg shadow-primary/20">
                    {form.id ? 'Save Changes' : 'Save & Preview Estimate'}
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
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl my-8 overflow-hidden"
              onClick={e => e.stopPropagation()}>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black dark:text-white uppercase tracking-tight">Estimate</h2>
                  <p className="text-slate-500 font-medium mt-1">#{viewing.estimate_no}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewing(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500"><X size={20}/></button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-bold dark:text-slate-200">{viewing.account_name || '—'}</p>
                    <p className="text-sm text-slate-500 whitespace-pre-wrap mt-1">{viewing.billing_address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                    <p className="font-bold dark:text-slate-200">{new Date(viewing.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</p>
                    <p className="font-bold dark:text-slate-200">{viewing.expiry_date ? new Date(viewing.expiry_date).toLocaleDateString() : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {viewing.status}
                    </span>
                  </div>
                </div>

                <div className="mb-10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-100 dark:border-slate-800 text-slate-400 text-left">
                        <th className="pb-3 font-bold uppercase tracking-wider">Item</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-center">Qty</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right">Price</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right">Disc</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right">Tax(%)</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {(viewing.items && viewing.items.length > 0) ? viewing.items.map((it, i) => (
                        <tr key={i}>
                          <td className="py-4">
                            <p className="font-bold dark:text-slate-200">{it.item_name}</p>
                            {it.description && <p className="text-slate-500 mt-0.5">{it.description}</p>}
                          </td>
                          <td className="py-4 text-center font-medium dark:text-slate-300">{it.quantity}</td>
                          <td className="py-4 text-right font-medium dark:text-slate-300">{symbol}{it.rate}</td>
                          <td className="py-4 text-right font-medium dark:text-slate-300">{symbol}{it.discount}</td>
                          <td className="py-4 text-right font-medium dark:text-slate-300">{it.tax_rate}%</td>
                          <td className="py-4 text-right font-bold dark:text-white">{symbol}{it.amount}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6" className="py-4 text-slate-400 italic">No line items.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-start border-t-2 border-slate-100 dark:border-slate-800 pt-6">
                  <div className="max-w-sm">
                    {viewing.notes && (
                      <div className="mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{viewing.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Total Amount</span>
                      <span>{symbol}{Number(viewing.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black dark:text-white border-t border-slate-200 dark:border-slate-700 pt-3">
                      <span>Total</span>
                      <span>{symbol}{Number(viewing.amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {viewing.attachments && viewing.attachments.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold dark:text-white mb-4">Attachments</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {viewing.attachments.map(att => (
                        <div key={att.id} className="glass-card p-4 rounded-xl flex items-center justify-between group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2.5 bg-primary/10 rounded-xl shrink-0"><FileIcon size={20} className="text-primary"/></div>
                            <div className="truncate">
                              <p className="text-sm font-bold dark:text-slate-200 truncate">{att.file_name}</p>
                              <p className="text-xs text-slate-500">{(att.file_size/1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <a href={`${BASE_URL}${att.file_path}`} target="_blank" rel="noreferrer" download 
                             className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100">
                            <Download size={16}/>
                          </a>
                        </div>
                      ))}
                    </div>
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