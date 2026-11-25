import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ThumbsUp, ThumbsDown,
  BookOpen, CreditCard, Settings, Shield,
  Users, Zap, HelpCircle, MessageSquare, Mail,
} from 'lucide-react';

const categories = [
  { id:'all',      label:'All Topics',       icon: BookOpen,    count:24 },
  { id:'account',  label:'Account',          icon: Users,       count: 6 },
  { id:'billing',  label:'Billing',          icon: CreditCard,  count: 5 },
  { id:'features', label:'Features',         icon: Zap,         count: 7 },
  { id:'security', label:'Security',         icon: Shield,      count: 4 },
  { id:'settings', label:'Settings',         icon: Settings,    count: 2 },
];

const faqs = [
  {
    id:1, cat:'account',
    q:'How do I change my account email address?',
    a:'Go to Profile → Personal Information and update your email field. You will receive a verification email to the new address before the change takes effect. Make sure you have access to the new email inbox.',
    helpful:42, votes:46,
  },
  {
    id:2, cat:'account',
    q:'Can I have multiple workspaces under one account?',
    a:'Yes! Pro and Enterprise plans support multiple workspaces. Navigate to Settings → Workspaces to create and manage them. Each workspace has its own members, projects and billing.',
    helpful:38, votes:40,
  },
  {
    id:3, cat:'billing',
    q:'How do I upgrade or downgrade my plan?',
    a:'Visit Pricing Plans in the sidebar and select the plan you want. Upgrades take effect immediately; downgrades apply at the end of your current billing cycle. Prorated credits are applied automatically.',
    helpful:55, votes:58,
  },
  {
    id:4, cat:'billing',
    q:'What happens if I miss a payment?',
    a:'We will retry the payment three times over 7 days. If all attempts fail, your account will be downgraded to the free Starter plan. Your data is never deleted — you just lose access to premium features.',
    helpful:29, votes:32,
  },
  {
    id:5, cat:'billing',
    q:'Can I get a refund?',
    a:'We offer a full refund within 14 days of your initial purchase if you are not satisfied. After 14 days, refunds are handled on a case-by-case basis. Contact support to initiate a refund request.',
    helpful:18, votes:20,
  },
  {
    id:6, cat:'features',
    q:'How do I export data from AMINOID?',
    a:'Most tables and reports have an Export button in the toolbar. You can export as CSV, Excel, or PDF. For bulk exports, go to Reports → Custom Report and configure your dataset before exporting.',
    helpful:64, votes:68,
  },
  {
    id:7, cat:'features',
    q:'Can I connect AMINOID to external tools?',
    a:'Yes! AMINOID integrates with 40+ tools including Slack, Salesforce, Stripe, Postgres, BigQuery and more. Go to Settings → Integrations to connect your tools via our one-click setup or API keys.',
    helpful:72, votes:76,
  },
  {
    id:8, cat:'features',
    q:'Is there a mobile app?',
    a:'Our mobile app for iOS and Android is currently in beta. You can sign up for early access through Profile → Beta Programs. The app supports dashboards, notifications and task management.',
    helpful:48, votes:52,
  },
  {
    id:9, cat:'features',
    q:'How do I set up automated reports?',
    a:'Go to Reports → any report page and click the clock icon to schedule it. You can set a frequency (daily, weekly, monthly), choose recipients, and select the format (PDF or CSV). Reports are emailed automatically.',
    helpful:35, votes:37,
  },
  {
    id:10, cat:'security',
    q:'How is my data protected?',
    a:'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II and GDPR compliant. Data is hosted on AWS with regular automated backups and 99.9% uptime SLA.',
    helpful:88, votes:90,
  },
  {
    id:11, cat:'security',
    q:'How do I enable two-factor authentication?',
    a:'Go to Profile → Security and click "Enable 2FA". Scan the QR code with any authenticator app (Google Authenticator, Authy, 1Password). Enter the 6-digit code to confirm. We strongly recommend enabling 2FA.',
    helpful:66, votes:68,
  },
  {
    id:12, cat:'settings',
    q:'How do I customise the sidebar navigation?',
    a:'Click the Zap icon at the top of the mini sidebar to collapse or expand the full navigation panel. You can also hide the entire sidebar using the panel icon in the top-left of the header.',
    helpful:22, votes:24,
  },
];

export default function FAQ() {
  const [faqs,    setFaqs]    = useState([]);
  const [cat,     setCat]     = useState('all');
  const [search,  setSearch]  = useState('');
  const [open,    setOpen]    = useState(null);
  const [voted,   setVoted]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/faq')
      .then(res => setFaqs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const catCounts = faqs.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  const dynamicCategories = [
    { id:'all', label:'All Topics', icon: BookOpen, count: faqs.length },
    ...Object.entries(catCounts).map(([id, count]) => {
      const meta = categories.find(c => c.id === id) || { label: id, icon: HelpCircle };
      return { id, label: meta.label, icon: meta.icon, count };
    }),
  ];

  const filtered = faqs.filter(f =>
    (cat === 'all' || f.category === cat) &&
    (f.question || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleVote = (id, type) => {
    setVoted(prev => ({ ...prev, [id]: type }));
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        {/* Header */}
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-primary"/>
          </div>
          <h1 className="text-3xl font-bold dark:text-white">Help & FAQ</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Find answers to the most common questions.</p>

          {/* Search */}
          <div className="flex items-center gap-3 mt-6 max-w-lg mx-auto bg-white dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Search size={18} className="text-slate-400 shrink-0"/>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search questions…"
              className="bg-transparent border-none outline-none text-sm w-full dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2.5 flex-wrap justify-center">
          {dynamicCategories.map(c => {
            const Icon = c.icon;
            return(
              <button key={c.id} onClick={() => setCat(c.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  cat===c.id
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-primary hover:border-primary'
                }`}>
                <Icon size={14}/>{c.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  cat===c.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>{c.count}</span>
              </button>
            );
          })}
        </div>

        {/* Result count */}
        <p className="text-sm text-slate-400 text-center">
          {filtered.length} question{filtered.length!==1?'s':''} found
          {search && <span> for "<strong className="text-primary">{search}</strong>"</span>}
        </p>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <motion.div key={faq.id}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.05 }}
              className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open===faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left group">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{faq.id}</span>
                  </div>
                  <span className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors leading-snug">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown size={16}
                  className={`text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${open===faq.id?'rotate-180':''}`}/>
              </button>

              <AnimatePresence>
                {open===faq.id && (
                  <motion.div
                    key="content"
                    initial={{ height:0, opacity:0 }}
                    animate={{ height:'auto', opacity:1 }}
                    exit={{ height:0, opacity:0 }}
                    transition={{ duration:0.25 }}
                    className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-9 mb-4">
                        {faq.answer}
                      </p>
                      {/* Helpful vote */}
                      <div className="flex items-center gap-3 pl-9">
                        <span className="text-xs text-slate-400">Was this helpful?</span>
                        <button
                          onClick={()=>handleVote(faq.id,'up')}
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                            voted[faq.id]==='up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500'
                          }`}>
                          <ThumbsUp size={12}/> Yes
                        </button>
                        <button
                          onClick={()=>handleVote(faq.id,'down')}
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                            voted[faq.id]==='down' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500'
                          }`}>
                          <ThumbsDown size={12}/> No
                        </button>
                        {voted[faq.id] && (
                          <motion.span initial={{opacity:0}} animate={{opacity:1}}
                            className="text-xs text-slate-400">Thanks for your feedback!</motion.span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3"/>
              <p className="text-slate-500 dark:text-slate-400 font-semibold">No results found</p>
              <p className="text-sm text-slate-400 mt-1">Try a different search term or browse by category.</p>
            </div>
          )}
        </div>

        {/* Still need help */}
        <div className="glass-card p-8 rounded-2xl text-center"
          style={{background:'linear-gradient(135deg,rgba(147,155,255,0.08),rgba(196,181,244,0.08))'}}>
          <h3 className="text-lg font-bold dark:text-white mb-2">Still need help?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Our support team typically responds within 2 hours on business days.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button className="btn-primary flex items-center gap-2 text-sm">
              <MessageSquare size={15}/> Start Live Chat
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Mail size={15}/> Email Support
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}