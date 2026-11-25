import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Activity } from 'lucide-react';

export default function FinancePreview() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden rounded-[26px]">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold dark:text-white">Finance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Financial overview and cash flow.</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-gradient-to-br from-[#4338CA] to-[#6D5BD0] p-6 rounded-2xl text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">Total Balance</p>
            <h3 className="text-4xl font-bold">$284,500.00</h3>
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Wallet size={24} />
          </div>
        </div>
        <div className="flex gap-6 relative z-10">
          <div>
            <p className="text-white/70 text-xs mb-1">Income</p>
            <p className="font-bold flex items-center gap-1 text-emerald-300"><ArrowUpRight size={14}/> $45,200</p>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Expenses</p>
            <p className="font-bold flex items-center gap-1 text-rose-300"><ArrowDownRight size={14}/> $12,800</p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 bg-white/90 dark:bg-[#121A2E]/90 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col">
        <h3 className="text-sm font-bold dark:text-white mb-4">Recent Transactions</h3>
        <div className="flex-1 space-y-4 overflow-hidden">
          {[
            { name: 'Stripe Payout', date: 'Today, 2:45 PM', amount: '+$4,500.00', icon: Activity, color: '#10B981', isPos: true },
            { name: 'AWS Cloud Services', date: 'Yesterday', amount: '-$850.00', icon: CreditCard, color: '#F43F5E', isPos: false },
            { name: 'Upwork Transfer', date: 'Oct 24, 2026', amount: '+$1,200.00', icon: Wallet, color: '#10B981', isPos: true },
          ].map((tx, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <tx.icon size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{name}</p>
                  <p className="text-xs text-slate-500">{tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${tx.isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
                {tx.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
