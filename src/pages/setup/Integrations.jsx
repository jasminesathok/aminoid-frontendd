import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Plug, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../utils/api';

const categoryColors = {
  Communication: '#4A154B', Billing: '#635BFF', CRM: '#00A1E0',
  Analytics: '#E37400', Marketing: '#F4BF00', Automation: '#FF4A00',
};

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toggling,     setToggling]     = useState(null);

  useEffect(() => {
    api.get('/api/setup/integrations').then(r => setIntegrations(r.data)).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (slug) => {
    setToggling(slug);
    try {
      const res = await api.put(`/api/setup/integrations/${slug}`);
      setIntegrations(prev => prev.map(i => i.slug === slug ? { ...i, connected: res.data.connected } : i));
    } finally { setToggling(null); }
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <Plug size={20}/>
          </div>
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Integrations</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Connect your favourite tools to Amnoid.</p>
          </div>
        </div>

        {categories.map(cat => (
          <div key={cat}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.filter(i => i.category === cat).map((intg, idx) => (
                <motion.div key={intg.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx*0.06 }}
                  whileHover={{ y:-2 }}
                  className="glass-card p-5 rounded-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background:`${intg.color}18`, color:intg.color }}>
                        <Plug size={18}/>
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{intg.name}</p>
                        <p className="text-[10px] text-slate-400">{intg.category}</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(intg.slug)}
                      disabled={toggling === intg.slug}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${intg.connected ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'} ${toggling===intg.slug?'opacity-50':''}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${intg.connected?'translate-x-5':'translate-x-0'}`}/>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{intg.description}</p>
                  <div className="flex items-center gap-1.5">
                    {intg.connected
                      ? <><CheckCircle size={13} className="text-emerald-500"/><span className="text-xs font-semibold text-emerald-500">Connected</span></>
                      : <><XCircle size={13} className="text-slate-400"/><span className="text-xs text-slate-400">Not connected</span></>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
