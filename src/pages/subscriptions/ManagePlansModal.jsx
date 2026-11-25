import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, AlertCircle, Settings2 } from 'lucide-react';
import { api } from '../../utils/api';

export default function ManagePlansModal({ isOpen, onClose, plans, refreshPlans }) {
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceMonthly, setPriceMonthly] = useState('');
  const [priceAnnual, setPriceAnnual] = useState('');
  const [maxUsers, setMaxUsers] = useState('');
  const [maxStorage, setMaxStorage] = useState('');
  const [features, setFeatures] = useState('');
  const [colorTheme, setColorTheme] = useState('default');

  if (!isOpen) return null;

  const handleEdit = (plan) => {
    setEditingPlan(plan.id);
    setName(plan.name);
    setDescription(plan.description || '');
    setPriceMonthly(plan.price_monthly);
    setPriceAnnual(plan.price_annual);
    setMaxUsers(plan.max_users);
    setMaxStorage(plan.max_storage_gb);
    setFeatures(plan.features_json ? plan.features_json.join('\n') : '');
    setColorTheme(plan.color_theme || 'default');
    setError(null);
  };

  const handleCreateNew = () => {
    setEditingPlan('new');
    setName('');
    setDescription('');
    setPriceMonthly('');
    setPriceAnnual('');
    setMaxUsers('');
    setMaxStorage('');
    setFeatures('');
    setColorTheme('default');
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const payload = {
      name,
      description,
      price_monthly: Number(priceMonthly),
      price_annual: Number(priceAnnual),
      max_users: Number(maxUsers),
      max_storage_gb: Number(maxStorage),
      features_json: features.split('\n').filter(f => f.trim()),
      color_theme: colorTheme
    };

    try {
      if (editingPlan === 'new') {
        await api.post('/api/plans', payload);
      } else {
        await api.put(`/api/plans/${editingPlan}`, payload);
      }
      setEditingPlan(null);
      refreshPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, planName) => {
    if (!window.confirm(`Are you sure you want to delete the "${planName}" plan? Existing users will not be affected.`)) return;
    try {
      await api.delete(`/api/plans/${id}`);
      if (editingPlan === id) setEditingPlan(null);
      refreshPlans();
    } catch (err) {
      alert('Error deleting plan');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1e2d45] flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-[#1e2d45] shrink-0">
            <div>
              <h2 className="text-xl font-bold dark:text-white">Manage Pricing Plans</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Super Admin controls for system billing plans.</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-[#131c2e] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-slate-200 dark:border-[#1e2d45] overflow-y-auto bg-slate-50 dark:bg-[#0d1117]/50 p-4 space-y-3">
              <button onClick={handleCreateNew} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-300 dark:border-[#1e2d45] rounded-xl text-primary font-bold hover:bg-primary/5 transition-colors">
                <Plus size={16} /> Create New Plan
              </button>

              {plans.map(plan => (
                <div key={plan.id} 
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${editingPlan === plan.id ? 'bg-white dark:bg-[#131c2e] border-primary shadow-sm' : 'bg-white/50 dark:bg-[#0d1117] border-slate-200 dark:border-[#1e2d45] hover:border-slate-300 dark:hover:border-slate-700'}`}
                  onClick={() => handleEdit(plan)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold dark:text-white">{plan.name}</h4>
                      <p className="text-xs text-slate-500">₹{plan.price_monthly}/mo</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(plan.id, plan.name); }}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Area */}
            <div className="w-2/3 p-6 overflow-y-auto">
              {!editingPlan ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Settings2 size={48} className="mb-4 opacity-20" />
                  <p>Select a plan to edit or create a new one.</p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5">
                  <h3 className="text-lg font-bold dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
                    {editingPlan === 'new' ? 'Create New Plan' : `Edit ${name}`}
                  </h3>

                  {error && (
                    <div className="p-3 bg-rose-500/10 text-rose-500 text-sm font-semibold rounded-xl flex items-center gap-2 border border-rose-500/20">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Plan Name</label>
                      <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-[#1e2d45] rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Theme</label>
                      <select value={colorTheme} onChange={e=>setColorTheme(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-[#1e2d45] rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white">
                        <option value="default">Default (Blue)</option>
                        <option value="emerald">Emerald (Green)</option>
                        <option value="amber">Amber (Yellow)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description (Subtext)</label>
                    <input type="text" value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-[#1e2d45] rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Price (₹)</label>
                      <input type="number" step="0.01" required value={priceMonthly} onChange={e=>setPriceMonthly(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-[#1e2d45] rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Annual Price (₹)</label>
                      <input type="number" step="0.01" required value={priceAnnual} onChange={e=>setPriceAnnual(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-[#1e2d45] rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Users</label>
                      <input type="number" required value={maxUsers} onChange={e=>setMaxUsers(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-[#1e2d45] rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Storage (GB)</label>
                      <input type="number" step="0.1" required value={maxStorage} onChange={e=>setMaxStorage(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-[#1e2d45] rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Features (One per line)</label>
                    <textarea rows="5" value={features} onChange={e=>setFeatures(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-[#131c2e] border border-slate-200 dark:border-[#1e2d45] rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none dark:text-white leading-relaxed resize-none" placeholder="10 user seats&#10;50 GB storage&#10;Priority support"></textarea>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
                      {loading ? 'Saving...' : <><Save size={16} /> Save Plan</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
