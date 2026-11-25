import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, Eye, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../utils/api';

const STATUSES = ['Draft', 'Published', 'Archived'];
const filters  = ['All', ...STATUSES];
const empty    = { title: '', content: '', category_id: '', status: 'Draft' };

const statusStyle = {
  Published: { bg:'bg-emerald-500/10', text:'text-emerald-600', dot:'bg-emerald-500' },
  Draft:     { bg:'bg-amber-500/10',   text:'text-amber-600',   dot:'bg-amber-500'   },
  Archived:  { bg:'bg-slate-200/70 dark:bg-slate-700/40', text:'text-slate-500', dot:'bg-slate-400' },
};

export default function Articles() {
  const [articles,   setArticles]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [tab,        setTab]        = useState('All');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [preview,    setPreview]    = useState(null);
  const [form,       setForm]       = useState(empty);
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);

  const load = async () => {
    try {
      const [a, c] = await Promise.all([
        api.get('/api/knowledge/articles'),
        api.get('/api/knowledge/categories')
      ]);
      setArticles(a.data);
      setCategories(c.data);
    } catch (err) {
      console.error("Failed to load KB data", err);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit   = (a) => {
    setForm({
      title: a.title,
      content: a.content,
      category_id: a.category_id || '',
      status: a.status
    });
    setEditing(a.id);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/knowledge/articles/${editing}`, form);
      } else {
        await api.post('/api/knowledge/articles', form);
      }
      await load();
      setModal(false);
    } catch (err) {
      console.error("Failed to save article", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.delete(`/api/knowledge/articles/${id}`);
      await load();
    } catch (err) {
      console.error("Failed to delete article", err);
    }
  };

  const filtered = articles.filter(a =>
    (tab === 'All' || a.status === tab) &&
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6 px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Articles</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage knowledge base articles.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Article
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {filters.map(f => (
                <button key={f} onClick={() => setTab(f)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    tab === f
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-56 border border-white/5">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Title', 'Category', 'Author', 'Views', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const st = statusStyle[a.status] || statusStyle['Draft'];
                  return (
                    <motion.tr key={a.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">{a.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{a.content?.slice(0, 60)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {a.category_name ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{
                              background: `${a.category_color || '#939BFF'}18`,
                              color: a.category_color || '#939BFF'
                            }}
                          >
                            {a.category_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{a.author}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Eye size={13} />{a.views}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setPreview(a)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">No articles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h2 className="text-lg font-bold dark:text-white">{editing ? 'Edit Article' : 'New Article'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Title *</label>
                  <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="input-field w-full text-sm" placeholder="Article title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Category</label>
                    <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                      className="input-field w-full text-sm">
                      <option value="">— None —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                      className="input-field w-full text-sm">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Content *</label>
                  <textarea required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    rows={8} className="input-field w-full text-sm resize-none font-mono" placeholder="Write article content here…" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">
                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Publish Article'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div>
                  <h2 className="text-lg font-bold dark:text-white">{preview.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{preview.category_name} · by {preview.author} · {preview.views} views</p>
                </div>
                <button onClick={() => setPreview(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-sm dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{preview.content}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
