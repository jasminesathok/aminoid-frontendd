import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
  Camera, Mail, Phone, MapPin, Globe, Briefcase,
  Lock, Bell, Shield, Save, CheckCircle, Star,
  Edit3, Github, Twitter, Linkedin, AlertCircle,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const TABS = ['Profile', 'Security', 'Notifications', 'Activity'];

export default function Profile() {
  const { user, login } = useAuth();
  const toast           = useToast();
  const avatarInputRef  = useRef(null);

  const [tab,       setTab]       = useState('Profile');
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Profile form state
  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    phone:     '',
    location:  '',
    website:   '',
    bio:       '',
  });

  // Security form state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwError,   setPwError]   = useState('');

  // Load user data into form on mount
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName:  user.last_name  || '',
      }));
      if (user.avatar) setAvatarUrl(user.avatar);
    }
    // Fetch fresh profile from API
    api.get('/api/profile', { silent: true })
      .then(res => {
        const u = res.data;
        setForm(prev => ({
          ...prev,
          firstName: u.first_name || '',
          lastName:  u.last_name  || '',
        }));
        if (u.avatar) setAvatarUrl(u.avatar);
      })
      .catch(() => {});
  }, []);

  // ── Avatar Upload ──
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 160;
      const ratio = Math.min(MAX / img.width, MAX / img.height);
      canvas.width  = img.width  * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      URL.revokeObjectURL(objectUrl);
      setAvatarUrl(dataUrl);
      api.put('/api/profile', { avatar: dataUrl }).catch(() => {});
    };
    img.src = objectUrl;
  };

  const fullName    = `${form.firstName} ${form.lastName}`.trim() || 'User';
  const initials    = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const displayRole = user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Enterprise' : 'Individual';

  // ── Save Profile ──
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/api/profile', {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
      });
      setSaved(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  // ── Change Password ──
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/api/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message || 'Failed to update password.');
    } finally {
      setPwSaving(false);
    }
  };

  const skills = ['React', 'TypeScript', 'Figma', 'Data Analysis', 'Project Management', 'UX Design', 'Node.js', 'SQL'];

  const activity = [
    { action: 'Updated dashboard layout',      time: '2 hours ago', icon: '🖊️' },
    { action: 'Exported Q1 Sales Report',      time: '5 hours ago', icon: '📊' },
    { action: 'Invited Mark Williams',         time: 'Yesterday',   icon: '👤' },
    { action: 'Updated billing information',   time: '2 days ago',  icon: '💳' },
    { action: 'Enabled two-factor auth',       time: '3 days ago',  icon: '🔒' },
    { action: 'Changed profile photo',         time: '1 week ago',  icon: '📷' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        {/* Cover + Avatar */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="h-36 relative"
            style={{ background: 'linear-gradient(135deg,#939BFF 0%,#C4B5F4 50%,#AEE9FF 100%)' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <button onClick={() => avatarInputRef.current?.click()}
              className="absolute top-3 right-3 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all">
              <Camera size={16} />
            </button>
          </div>

          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>

          <div className="px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative -mt-12">
                <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-[#0f172a] shadow-2xl overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#939BFF,#C4B5F4)' }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover"/>
                    : <span className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">{initials}</span>
                  }
                </div>
                <button onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0f172a]">
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-extrabold dark:text-white tracking-tight">{fullName}</h2>
                  <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{displayRole}</span>
                  <div className="flex items-center gap-1 ml-1">
                    {Array(5).fill(0).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{user?.email || ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {[{ icon: Github, url: '#' }, { icon: Twitter, url: '#' }, { icon: Linkedin, url: '#' }].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <a key={i} href={s.url}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}>{t}</button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'Profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Form */}
            <div className="lg:col-span-2 glass-card p-7 rounded-2xl space-y-5">
              <h3 className="text-base font-bold dark:text-white">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">First Name</label>
                  <input type="text" value={form.firstName}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className="input-field w-full text-sm" placeholder="First name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Last Name</label>
                  <input type="text" value={form.lastName}
                    onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    className="input-field w-full text-sm" placeholder="Last name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="email" value={user?.email || ''} disabled
                      className="input-field w-full text-sm pl-9 opacity-60 cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="tel" value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="input-field w-full text-sm pl-9" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="text" value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      className="input-field w-full text-sm pl-9" placeholder="Chennai, India" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="url" value={form.website}
                      onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                      className="input-field w-full text-sm pl-9" placeholder="aminoid.app" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Bio</label>
                <textarea rows={3} value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  className="input-field w-full text-sm resize-none"
                  placeholder="Tell us about yourself..." />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">Skills</label>
                <div className="flex gap-2 flex-wrap">
                  {skills.map(s => (
                    <span key={s} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20">{s}</span>
                  ))}
                  <button className="text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary hover:text-primary transition-all">
                    + Add
                  </button>
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving}
                className={`btn-primary flex items-center gap-2 text-sm disabled:opacity-60 transition-all ${saved ? 'bg-emerald-500 shadow-emerald-200' : ''}`}>
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                  : saved
                    ? <><CheckCircle size={16} /> Saved!</>
                    : <><Save size={16} /> Save Changes</>
                }
              </button>
            </div>

            {/* Side info */}
            <div className="space-y-4">
              <div className="glass-card p-5 rounded-2xl">
                <h4 className="text-sm font-bold dark:text-white mb-4">Account Details</h4>
                {[
                  { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A' },
                  { label: 'Role',         value: displayRole },
                  { label: 'Email',        value: user?.email || 'N/A' },
                  // For admin: Enterprise ID = their own user id (the root of their tenant)
                  // For member: shows the admin's id they are linked to
                  ...(user?.role === 'admin'
                    ? [{ label: 'Enterprise ID', value: user?.id || 'N/A' }]
                    : user?.enterprise_id
                      ? [{ label: 'Enterprise', value: user.enterprise_id.slice(0, 8) + '…' }]
                      : []
                  ),
                  { label: 'Timezone',     value: 'IST (UTC+5:30)' },
                  { label: 'Language',     value: 'English (US)' },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <span className="text-xs text-slate-400">{r.label}</span>
                    <span className="text-xs font-bold dark:text-white truncate ml-2 max-w-[120px]">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <h4 className="text-sm font-bold dark:text-white mb-4">Stats</h4>
                {[
                  { label: 'Reports Generated', value: '48',  color: '#939BFF' },
                  { label: 'Projects Active',   value: '6',   color: '#10b981' },
                  { label: 'Tasks Completed',   value: '142', color: '#C4B5F4' },
                  { label: 'Team Members',      value: '12',  color: '#f59e0b' },
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <span className="text-xs text-slate-400">{s.label}</span>
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Security Tab ── */}
        {tab === 'Security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-5">
            <div className="glass-card p-7 rounded-2xl">
              <h3 className="text-base font-bold dark:text-white mb-5 flex items-center gap-2">
                <Lock size={16} className="text-primary" /> Change Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                {[
                  { label: 'Current Password', key: 'currentPassword' },
                  { label: 'New Password',      key: 'newPassword' },
                  { label: 'Confirm New Password', key: 'confirmPassword' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{label}</label>
                    <input type="password"
                      value={pwForm[key]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      className="input-field w-full text-sm" placeholder="••••••••" required />
                  </div>
                ))}
                {pwError && (
                  <div className="flex items-center gap-2 text-rose-500 text-sm">
                    <AlertCircle size={15} />{pwError}
                  </div>
                )}
                <button type="submit" disabled={pwSaving}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60">
                  {pwSaving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</>
                    : <><Lock size={14} /> Update Password</>
                  }
                </button>
              </form>
            </div>
            <div className="glass-card p-7 rounded-2xl">
              <h3 className="text-base font-bold dark:text-white mb-5 flex items-center gap-2">
                <Shield size={16} className="text-primary" /> Two-Factor Authentication
              </h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-md">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold dark:text-white">2FA is Enabled</p>
                    <p className="text-xs text-slate-400">Via authenticator app</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-rose-500 hover:underline">Disable</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Notifications Tab ── */}
        {tab === 'Notifications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-7 rounded-2xl max-w-2xl">
            <h3 className="text-base font-bold dark:text-white mb-5 flex items-center gap-2">
              <Bell size={16} className="text-primary" /> Notification Preferences
            </h3>
            <div className="space-y-1">
              {[
                { label: 'New task assigned to me',           cat: 'Tasks' },
                { label: 'Task deadline approaching',         cat: 'Tasks' },
                { label: 'New comment on my task',            cat: 'Tasks' },
                { label: 'Project status updated',            cat: 'Projects' },
                { label: 'New team member added',             cat: 'Team' },
                { label: 'Invoice paid',                      cat: 'Finance' },
                { label: 'New login from unrecognized device',cat: 'Security' },
                { label: 'Weekly summary report',             cat: 'Reports' },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                  <div>
                    <p className="text-sm font-medium dark:text-white">{n.label}</p>
                    <p className="text-xs text-slate-400">{n.cat}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 5} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all shadow-inner" />
                  </label>
                </div>
              ))}
            </div>
            <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2 text-sm mt-4">
              {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Preferences</>}
            </button>
          </motion.div>
        )}

        {/* ── Activity Tab ── */}
        {tab === 'Activity' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-7 rounded-2xl max-w-2xl">
            <h3 className="text-base font-bold dark:text-white mb-5">Recent Activity</h3>
            <div className="relative pl-6">
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-6">
                {activity.map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="relative flex items-start gap-4">
                    <div className="absolute -left-6 top-0 w-7 h-7 rounded-full bg-white dark:bg-[#070b14] border-2 border-primary/30 flex items-center justify-center text-sm z-10">
                      {a.icon}
                    </div>
                    <div className="flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold dark:text-white">{a.action}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
