import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Check, X, Zap, Building2, Rocket, Star, ChevronDown } from 'lucide-react';

const staticPlans = [
  {
    id: 'starter', name: 'Starter', icon: Zap, monthly: 0, annual: 0,
    color: '#94a3b8', badge: null,
    desc: 'Perfect for individuals and small teams getting started.',
    features: [
      { text:'Up to 3 users',           included:true },
      { text:'5 Projects',               included:true },
      { text:'Basic dashboards',         included:true },
      { text:'1 GB storage',             included:true },
      { text:'Email support',            included:true },
      { text:'Advanced analytics',       included:false},
      { text:'Custom reports',           included:false},
      { text:'API access',               included:false},
      { text:'Priority support',         included:false},
      { text:'White-label',              included:false},
    ],
    cta: 'Get Started Free', ctaStyle:'border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
  },
  {
    id: 'pro', name: 'Pro', icon: Rocket, monthly: 29, annual: 24,
    color: '#939BFF', badge: 'Most Popular',
    desc: 'For growing teams that need power and flexibility.',
    features: [
      { text:'Up to 20 users',           included:true },
      { text:'Unlimited projects',       included:true },
      { text:'Advanced dashboards',      included:true },
      { text:'50 GB storage',            included:true },
      { text:'Priority email support',   included:true },
      { text:'Advanced analytics',       included:true },
      { text:'Custom reports',           included:true },
      { text:'API access',               included:true },
      { text:'Priority support',         included:false},
      { text:'White-label',              included:false},
    ],
    cta: 'Start Free Trial', ctaStyle:'bg-gradient-to-r from-primary to-violet-500 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5',
  },
  {
    id: 'enterprise', name: 'Enterprise', icon: Building2, monthly: 99, annual: 82,
    color: '#C4B5F4', badge: null,
    desc: 'For large organisations with advanced needs.',
    features: [
      { text:'Unlimited users',          included:true },
      { text:'Unlimited projects',       included:true },
      { text:'Custom dashboards',        included:true },
      { text:'1 TB storage',             included:true },
      { text:'24/7 dedicated support',   included:true },
      { text:'Advanced analytics',       included:true },
      { text:'Custom reports',           included:true },
      { text:'API access',               included:true },
      { text:'Priority support',         included:true },
      { text:'White-label',              included:true },
    ],
    cta: 'Contact Sales', ctaStyle:'border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20',
  },
];

const faqs = [
  { q:'Can I change my plan later?',              a:'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.' },
  { q:'Is there a free trial?',                   a:'The Pro plan comes with a 14-day free trial — no credit card required. You can explore all features before committing.' },
  { q:'How does billing work?',                   a:'We charge monthly or annually depending on your preference. Annual plans include a significant discount versus monthly billing.' },
  { q:'Can I add more users later?',              a:'Absolutely. You can add or remove seats at any time. Your invoice will be updated to reflect the change on the next cycle.' },
  { q:'What payment methods do you accept?',      a:'We accept all major credit cards (Visa, Mastercard, Amex), as well as wire transfers for Enterprise plans.' },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
const [openFAQ, setOpenFAQ] = useState(null);
const [plans, setPlans] = useState(staticPlans);

useEffect(() => {
  api.get('/api/plans', { silent: true })
    .then(r => { if (r.data?.length) setPlans(r.data); })
    .catch(() => {});
}, []);

  const currentPlan = 'pro';

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-12 px-2">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold dark:text-white">Pricing Plans</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Choose the plan that works best for your team.</p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm font-semibold ${!annual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
            <button onClick={() => setAnnual(v => !v)}
              className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${annual ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow ${annual ? 'left-6' : 'left-0.5'}`}/>
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${annual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Annual
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Save 17%</span>
            </span>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon  = plan.icon;
            const price = annual ? plan.annual : plan.monthly;
            const isCurrent = plan.id === currentPlan;
            const isPop = plan.badge === 'Most Popular';
            return (
              <motion.div key={plan.id}
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.1 }}
                className={`glass-card rounded-2xl p-7 flex flex-col relative ${isPop ? 'ring-2 ring-primary shadow-xl shadow-primary/10 scale-[1.02]' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary text-white shadow-md shadow-primary/30 whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                      <Star size={10} className="fill-emerald-500"/> Current Plan
                    </span>
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background:`${plan.color}18`, color:plan.color }}>
                    <Icon size={22}/>
                  </div>
                  <div>
                    <p className="text-lg font-bold dark:text-white">{plan.name}</p>
                    <p className="text-xs text-slate-400 leading-tight">{plan.desc}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold dark:text-white">${price}</span>
                    <span className="text-slate-400 text-sm mb-1">/mo</span>
                  </div>
                  {annual && price > 0 && (
                    <p className="text-xs text-emerald-500 font-semibold mt-0.5">
                      Billed ${price*12}/year · Save ${(plan.monthly-price)*12}/yr
                    </p>
                  )}
                  {price === 0 && <p className="text-xs text-slate-400 mt-0.5">Free forever</p>}
                </div>

                {/* CTA */}
                <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 mb-6 ${plan.ctaStyle}`}>
                  {isCurrent ? '✓ Current Plan' : plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-2.5 flex-1">
                  {plan.features.map((f,fi) => (
                    <div key={fi} className="flex items-center gap-2.5">
                      {f.included
                        ? <Check size={14} style={{color:plan.color}} className="shrink-0"/>
                        : <X size={14} className="text-slate-300 dark:text-slate-600 shrink-0"/>
                      }
                      <span className={`text-sm ${f.included ? 'dark:text-slate-300 text-slate-600' : 'text-slate-400 dark:text-slate-600'}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold dark:text-white text-center mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i}
                className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="text-sm font-bold dark:text-white">{faq.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 shrink-0 ml-3 ${openFAQ===i?'rotate-180':''}`}/>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFAQ===i ? 'auto' : 0, opacity: openFAQ===i ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}