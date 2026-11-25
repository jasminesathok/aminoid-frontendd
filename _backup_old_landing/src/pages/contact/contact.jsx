import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, Globe } from 'lucide-react';
import { api } from '../../utils/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSending(true);
  try {
    await api.post('/api/contact', form);
    setSent(true);
  } catch (err) {
    console.error(err);
  } finally {
    setSending(false);
  }
};

  const info = [
    { icon: Mail,    label: 'General enquiries',       value: 'hello@aminod.app',   sub: 'Email for general questions' },
    { icon: Mail,    label: 'Technical support',       value: 'support@aminod.app', sub: 'Issues and troubleshooting' },
    { icon: Mail,    label: 'Billing & plans',         value: 'billing@aminod.app', sub: 'Pricing, invoices, and upgrades' },
    { icon: Phone,   label: 'Call us',                 value: '+91 98765 43210',   sub: 'Mon–Fri, 9am–6pm IST' },
    { icon: MapPin,  label: 'Visit us',                value: 'Chennai, India',      sub: 'Tamil Nadu 600001' },
    { icon: Clock,   label: 'Response time',           value: '< 24 hours',        sub: 'Business days' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-2 pb-16 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Contact Us</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Have a question about AMINOID? Our team is ready to help with onboarding, support,
              and general enquiries. Use the information below to connect with the right team.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 bg-white/10 border border-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              For the fastest response, please choose the address that best matches your request.
              Include your company name and a short summary of what you need.
            </p>
            <div>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>hello@aminoid.app — General enquiries</li>
                <li>support@aminoid.app — Technical support</li>
                <li>billing@aminoid.app — Billing & plans</li>
              </ul>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Prefer to speak with someone directly? Call our support team at <strong>+91 98765 43210</strong>.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — Info cards */}
          <div className="lg:col-span-2 space-y-4">
            {info.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass-card p-5 rounded-2xl flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold dark:text-white">{item.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Decorative card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }}
              className="glass-card p-5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(147,155,255,0.12), rgba(196,181,244,0.08))' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Globe size={18} className="text-primary" />
                <p className="text-sm font-bold dark:text-white">Enterprise Ready</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Custom plans include dedicated support, SLA guarantees, isolated workspaces, and tailored onboarding.
              </p>
            </motion.div>
          </div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-3 glass-card rounded-2xl p-8"
          >
            {sent ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold dark:text-white">Message Sent!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  Thanks for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name:'', email:'', company:'', subject:'', message:'' }); }}
                  className="mt-2 text-sm font-bold text-primary hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold dark:text-white">Send us a message</h3>
                    <p className="text-xs text-slate-400">Fill in the details and we'll be in touch</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Full Name *</label>
                      <input
                        required name="name" value={form.name} onChange={handleChange}
                        placeholder="John Smith"
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Email *</label>
                      <input
                        required type="email" name="email" value={form.email} onChange={handleChange}
                        placeholder="john@company.com"
                        className="input-field w-full text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Company</label>
                      <input
                        name="company" value={form.company} onChange={handleChange}
                        placeholder="Acme Corp"
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Subject *</label>
                      <select
                        required name="subject" value={form.subject} onChange={handleChange}
                        className="input-field w-full text-sm"
                      >
                        <option value="">Select a topic…</option>
                        <option>Custom Plan Inquiry</option>
                        <option>Enterprise Pricing</option>
                        <option>Technical Support</option>
                        <option>Partnership</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Message *</label>
                    <textarea
                      required name="message" value={form.message} onChange={handleChange}
                      placeholder="Tell us about your needs, team size, and any specific requirements…"
                      rows={5}
                      className="input-field w-full text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3 disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}