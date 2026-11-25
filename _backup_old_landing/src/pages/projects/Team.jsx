import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Mail, MoreVertical, Plus, X, Pencil, Trash2, KeyRound } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const statusStyle = {
  Active:    { bg:'bg-emerald-500/10', text:'text-emerald-500' },
  'On Leave':{ bg:'bg-amber-500/10',   text:'text-amber-600'   },
};

const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];
const getColor    = (i) => PALETTE[i % PALETTE.length];
const getInitials = (u) => `${u.first_name?.[0]||''}${u.last_name?.[0]||''}`.toUpperCase() || 'U';
const getFullName = (u) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;

export default function Team() {
  const [members,    setMembers]    = useState([]);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);

  // Add modal
  const [showModal,   setShowModal]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [memberForm,  setMemberForm]  = useState({ email:'', first_name:'', last_name:'', role:'member', password:'Welcome@123' });

  // Edit modal
  const [editing,    setEditing]    = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // 3-dot dropdown
  const [menuOpen, setMenuOpen] = useState(null);

  // ─── What the backend supports ────────────────────────────────────────────
  // ✅ GET    /api/projects/team/list          → list all users
  // ✅ POST   /api/auth/signup                 → create a user
  // ✅ PUT    /api/profile                     → update OWN profile only (firstName, lastName, avatar)
  // ❌ PUT    /api/users/:id                   → DOES NOT EXIST (need backend to add)
  // ❌ DELETE /api/users/:id                   → DOES NOT EXIST (need backend to add)
  //
  // So Edit Name and Delete are handled via backend endpoints that need to be added.
  // See the "What to tell Backend Team" comment below near handleEdit/handleDelete.

  useEffect(() => {
    api.get('/api/projects/team/list')
      .then(res => setMembers(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // ─── Add Member ───────────────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/auth/signup', {
        firstName: memberForm.first_name,
        lastName:  memberForm.last_name,
        email:     memberForm.email,
        password:  memberForm.password,
        role:      memberForm.role,
      });
      const res = await api.get('/api/projects/team/list');
      setMembers(res.data);
      setShowModal(false);
      setMemberForm({ email:'', first_name:'', last_name:'', role:'member', password:'Welcome@123' });
      alert('Member added! Temporary password: Welcome@123');
    } catch(err) {
      alert('Error: ' + (err?.response?.data?.message || err.message));
    } finally { setSaving(false); }
  };

  // ─── Edit Member ──────────────────────────────────────────────────────────
  // ⚠️  BACKEND TEAM NEEDS TO ADD THIS ENDPOINT:
  //     PUT /api/users/:id   →  body: { firstName, lastName, role }
  //     Protected by `protect` + `adminOnly` middleware
  //     In User model: add `updateById: (id, {firstName, lastName, role}) => db.query(...)`
  const handleEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await api.put('/api/projects/users/' + editing.id, {
  firstName: editForm.first_name,
  lastName:  editForm.last_name,
  role:      editForm.role,
});
      const res = await api.get('/api/projects/team/list');
      setMembers(res.data);
      setEditing(null);
    } catch(err) {
      alert('Error: ' + (err?.response?.data?.message || err.message));
    } finally { setEditSaving(false); }
  };

  // ─── Delete Member ────────────────────────────────────────────────────────
  // ⚠️  BACKEND TEAM NEEDS TO ADD THIS ENDPOINT:
  //     DELETE /api/users/:id
  //     Protected by `protect` + `adminOnly` middleware
  //     In User model: add `delete: (id) => db.query('DELETE FROM users WHERE id = ?', [id])`
  //     Should prevent deleting yourself: if (req.params.id === req.user.id) return 400
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team member? This cannot be undone.')) return;
    try {
      await api.delete('/api/setup/users/' + id);
      setMembers(prev => prev.filter(m => m.id !== id));
      setMenuOpen(null);
    } catch(err) {
      alert('Error: ' + (err?.response?.data?.message || err.message));
    }
  };

  const openEdit = (m) => {
    setEditing(m);
    setEditForm({
      first_name: m.first_name || '',
      last_name:  m.last_name  || '',
      role:       m.role       || 'member',
    });
    setMenuOpen(null);
  };

  const filtered = members.filter(m => {
    const name = getFullName(m).toLowerCase();
    return name.includes(search.toLowerCase()) || (m.role || '').toLowerCase().includes(search.toLowerCase());
  });

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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Team</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Workload and assignments across the team.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16}/> Add Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label:'Team Members', value: members.length,                                                      color:'#939BFF' },
            { label:'Admins',       value: members.filter(m=>m.role==='admin'||m.role==='super_admin').length,  color:'#10b981' },
           { label: 'Individuals', value: members.filter(m => m.role === 'member').length,                         color:'#C4B5F4' },
            { label:'Total',        value: members.length,                                                      color:'#f59e0b' },
          ].map((c,i) => (
            <motion.div key={i} whileHover={{y:-4}} className="glass-card p-5 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">{c.label}</p>
              <p className="text-3xl font-bold dark:text-white" style={{color:c.color}}>{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Team Roster */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">Team Roster</h2>
          <div className="space-y-3">
            {members.map((m, i) => {
              const color = getColor(i);
              return (
                <div key={m.id} className="flex items-center gap-4 group">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                    style={{background:`linear-gradient(135deg,${color},${color}88)`}}>{getInitials(m)}</div>
                  <span className="text-sm font-medium dark:text-slate-300 w-36 shrink-0 truncate">{getFullName(m)}</span>
                  <span className="text-xs text-slate-400 flex-1 truncate">{m.email}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{m.role?.replace('_',' ')}</span>

                  {/* ✅ 3-dot menu in roster */}
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === m.id + '_r' ? null : m.id + '_r'); }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"
                    >
                      <MoreVertical size={14}/>
                    </button>
                    {menuOpen === m.id + '_r' && (
                      <div className="absolute right-0 top-7 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl w-36 py-1">
                        <button onClick={e => { e.stopPropagation(); openEdit(m); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                          <Pencil size={13}/> Edit
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(m.id); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                          <Trash2 size={13}/> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Cards */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold dark:text-white">All Members</h2>
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-52 border border-white/5">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search members..."
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((m, i) => {
              const color = getColor(i);
              return (
                <motion.div key={m.id}
                  initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                  whileHover={{y:-4}}
                  className="glass-card p-6 rounded-2xl group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelected(m)}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-lg"
                        style={{background:`linear-gradient(135deg,${color},${color}88)`}}>
                        {getInitials(m)}
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{getFullName(m)}</p>
                        <p className="text-xs text-slate-400 capitalize">{m.role?.replace('_',' ')}</p>
                      </div>
                    </div>

                    {/* ✅ 3-dot menu on card */}
                    <div className="relative">
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === m.id ? null : m.id); }}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <MoreVertical size={16}/>
                      </button>
                      {menuOpen === m.id && (
                        <div className="absolute right-0 top-7 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl w-36 py-1">
                          <button onClick={e => { e.stopPropagation(); openEdit(m); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Pencil size={13}/> Edit
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(m.id); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                            <Trash2 size={13}/> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-slate-400 shrink-0"/>
                      <span className="text-xs text-slate-400 truncate">{m.email}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Member detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <motion.div initial={{x:420,opacity:0}} animate={{x:0,opacity:1}}
            transition={{type:'spring',damping:28}}
            className="w-full max-w-sm h-full glass-card shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl mb-3"
                  style={{background:`linear-gradient(135deg,${getColor(members.indexOf(selected))},${getColor(members.indexOf(selected))}88)`}}>
                  {getInitials(selected)}
                </div>
                <p className="text-lg font-bold dark:text-white">{getFullName(selected)}</p>
                <p className="text-sm text-slate-400 capitalize">{selected.role?.replace('_',' ')}</p>
              </div>
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <Mail size={15} className="text-primary shrink-0"/>
                  <span className="text-sm text-slate-600 dark:text-slate-300 truncate">{selected.email}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { openEdit(selected); setSelected(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
                  <Pencil size={14}/> Edit
                </button>
                <button onClick={() => { handleDelete(selected.id); setSelected(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-sm font-bold hover:bg-rose-500/20 transition-colors">
                  <Trash2 size={14}/> Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Add Member Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold dark:text-white">Add Team Member</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18}/></button>
              </div>
              <form onSubmit={handleAddMember} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">First Name *</label>
                    <input required value={memberForm.first_name} onChange={e => setMemberForm(p=>({...p,first_name:e.target.value}))} className="input-field w-full text-sm"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Last Name</label>
                    <input value={memberForm.last_name} onChange={e => setMemberForm(p=>({...p,last_name:e.target.value}))} className="input-field w-full text-sm"/>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Email *</label>
                  <input required type="email" value={memberForm.email} onChange={e => setMemberForm(p=>({...p,email:e.target.value}))} className="input-field w-full text-sm"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Role</label>
                  <select value={memberForm.role} onChange={e => setMemberForm(p=>({...p,role:e.target.value}))} className="input-field w-full text-sm">
                   <option value="member">Individual</option>
<option value="admin">Enterprise</option>
                  </select>
                </div>
                <p className="text-xs text-slate-400">Temporary password <strong>Welcome@123</strong> will be assigned.</p>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">{saving?'Adding…':'Add Member'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Member Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditing(null)}>
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Edit Member</h2>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              <form onSubmit={handleEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">First Name</label>
                    <input required value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name:e.target.value})} className="input-field w-full"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Last Name</label>
                    <input value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name:e.target.value})} className="input-field w-full"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Role</label>
                  <select value={editForm.role} onChange={e => setEditForm({...editForm, role:e.target.value})} className="input-field w-full">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {/* Email shown read-only — cannot change email */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Email (read-only)</label>
                  <input disabled value={editing.email} className="input-field w-full opacity-50 cursor-not-allowed"/>
                </div>
                <button type="submit" disabled={editSaving} className="btn-primary w-full py-3 mt-2 text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-60">
                  {editSaving ? 'Saving…' : 'Update Member'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}