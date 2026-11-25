import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Receipt, CheckCircle, XCircle, Clock, RefreshCcw, Download } from 'lucide-react';
import { api } from '../../utils/api';

const statusStyle = {
  Paid:     { bg:'bg-emerald-500/10', text:'text-emerald-600', icon:CheckCircle },
  Failed:   { bg:'bg-rose-500/10',   text:'text-rose-500',   icon:XCircle     },
  Pending:  { bg:'bg-amber-500/10',  text:'text-amber-600',  icon:Clock       },
  Refunded: { bg:'bg-blue-500/10',   text:'text-blue-500',   icon:RefreshCcw  },
};

export default function Billing() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/subscriptions/billing').then(r => setHistory(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;

  const totalPaid = history.filter(h=>h.status==='Paid').reduce((s,h)=>s+Number(h.amount),0);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Billing</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">View and download your invoice history.</p>
          </div>
          <button
            onClick={() => {
              const csv = ['Description,Date,Amount,Status',
                ...history.map(r => r.description + ',' + new Date(r.billed_at).toLocaleDateString() + ',$' + Number(r.amount).toFixed(2) + ',' + r.status)
              ].join('\n');
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
              a.download = 'billing-history.csv'; a.click();
            }}
            className="btn-primary flex items-center gap-2 text-sm">
            <Download size={15}/> Export All
          </button>
        </div>

        {/* Summary */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Receipt size={22}/>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Paid to Date</p>
            <p className="text-2xl font-bold dark:text-white">${totalPaid.toLocaleString()}</p>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold dark:text-white">Invoice History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Description','Date','Amount','Status',''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => {
                  const st = statusStyle[row.status] || statusStyle['Paid'];
                  const StatusIcon = st.icon;
                  return (
                    <motion.tr key={row.id}
                      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold dark:text-white">{row.description}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{new Date(row.billed_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</td>
                      <td className="px-5 py-4 text-sm font-bold dark:text-white">${Number(row.amount).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>
                          <StatusIcon size={11}/>{row.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            const txt = 'Invoice\n' + row.description + '\nDate: ' + new Date(row.billed_at).toLocaleDateString() + '\nAmount: $' + Number(row.amount).toFixed(2) + '\nStatus: ' + row.status;
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
                            a.download = 'invoice-' + (row.id || 'receipt') + '.txt'; a.click();
                          }}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                          <Download size={12}/>PDF
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
                {history.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-sm">No billing history.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}