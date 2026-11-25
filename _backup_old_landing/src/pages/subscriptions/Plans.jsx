import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { CreditCard, Check, Settings2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import ManagePlansModal from './ManagePlansModal';

export default function Plans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/plans');
      setPlans(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getThemeClasses = (theme) => {
    switch (theme) {
      case 'emerald':
        return {
          card: 'border-emerald-500/30',
          badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          title: 'text-emerald-500',
          button: 'border border-emerald-500/30 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 bg-transparent',
          checkIcon: 'text-emerald-500 bg-emerald-500/10'
        };
      case 'amber':
        return {
          card: 'border-amber-500/30',
          badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          title: 'text-amber-500',
          button: 'border border-amber-500/30 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 bg-transparent',
          checkIcon: 'text-amber-500 bg-amber-500/10'
        };
      default:
        return {
          card: 'border-slate-200 dark:border-white/5',
          badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          title: 'text-slate-900 dark:text-white',
          button: 'bg-slate-100 dark:bg-[#252f44] text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-[#2d3851] border-transparent',
          checkIcon: 'text-emerald-500 bg-emerald-500/10' // Default check is usually green anyway
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 px-2 pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight">Plans & billing</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your subscription and billing history.</p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsManageModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
            >
              <Settings2 size={16} /> Edit Plans
            </button>
          )}
        </div>

        {/* Current Plan Card */}
        <div className="bg-white dark:bg-[#151b2b] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Current Plan</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#0b0f1a] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">No active plan</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose a plan below to activate your workspace.</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => {
              const theme = getThemeClasses(plan.color_theme);
              const isFreeOrCustom = plan.price_monthly == 0 || plan.name.toLowerCase().includes('custom');

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`bg-white dark:bg-[#151b2b] rounded-2xl border ${theme.card} p-6 flex flex-col shadow-sm`}
                >
                  {(plan.color_theme === 'emerald' || plan.color_theme === 'amber') ? (
                    <div className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider w-max mb-5 border ${theme.badge}`}>
                      {plan.name}
                    </div>
                  ) : (
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 mt-[34px]">{plan.name}</p>
                  )}

                  {isFreeOrCustom && plan.color_theme !== 'default' && (
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                      {plan.color_theme === 'emerald' ? 'Try Plan' : 'Customize Plan'}
                    </p>
                  )}

                  <div className="flex items-baseline gap-1 mb-1">
                    <h3 className={`text-3xl font-black ${theme.title}`}>
                      {plan.price_monthly == 0 ? 'FREE' : `₹${Number(plan.price_monthly).toLocaleString()}`}
                    </h3>
                    {plan.price_monthly > 0 && <span className="text-sm text-slate-500 dark:text-slate-400">/mo</span>}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                    {plan.description || `Up to ${plan.max_users} users`}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {(plan.features_json || []).map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${theme.checkIcon}`}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  

                  <button
  className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-colors shadow-sm ${theme.button}`}
  onClick={() => {
    if (plan.color_theme === 'amber') {
      navigate('/contact');
    } else if (plan.color_theme === 'emerald') {
      alert('Starting free trial...');
    } else {
      alert(`You selected ${plan.name}. Payment integration coming soon.`);
    }
  }}
>
  {plan.color_theme === 'emerald' ? 'Start Free Trial' :
   plan.color_theme === 'amber'   ? 'Contact Us' :
   plan.price_monthly == 0        ? 'Start Free Trial' :
   plan.name?.toLowerCase().includes('custom') ? 'Contact Us' :
   `Choose ${plan.name || 'Plan'}`}
</button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Billing History Section */}
        <div className="bg-white dark:bg-[#151b2b] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-transparent">
            <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Billing History</h3>
          </div>
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 bg-slate-50 dark:bg-transparent">
              <CreditCard size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No billing history</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your invoices will appear here after your first payment.</p>
          </div>
        </div>

      </div>

      <ManagePlansModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        plans={plans}
        refreshPlans={fetchPlans}
      />
    </DashboardLayout>
  );
}
