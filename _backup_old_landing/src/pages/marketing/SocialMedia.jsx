import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Eye,
  Plus, MoreVertical, Image, X,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const PlatformIcon = ({ platform, size = 16 }) => {
  const icons = {
    Instagram: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    Twitter:   <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    LinkedIn:  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    Facebook:  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  };
  return icons[platform] || <Image size={size}/>;
};

const PLATFORMS = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook'];
const platformColors = { Instagram:'#E1306C', Twitter:'#1DA1F2', LinkedIn:'#0A66C2', Facebook:'#1877F2' };
const statusStyle = {
  Published: { bg:'bg-emerald-500/10', text:'text-emerald-500' },
  Scheduled: { bg:'bg-blue-500/10',   text:'text-blue-500'    },
  Draft:     { bg:'bg-slate-200/60 dark:bg-slate-700/40', text:'text-slate-500' },
};

function CreatePostModal({ onClose, onAdd, campaigns }) {
  const [platform,    setPlatform]    = useState('Instagram');
  const [content,     setContent]     = useState('');
  const [status,      setStatus]      = useState('Draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [campaignId,  setCampaignId]  = useState('');
  const [saving,      setSaving]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/api/marketing/social', {
        platform,
        content: content.trim(),
        status,
        scheduled_at: status === 'Scheduled' && scheduledAt ? scheduledAt : null,
        campaign_id: campaignId || null,
      });
      onAdd(res.data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const pColor = platformColors[platform] || '#939BFF';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
        exit={{ opacity:0, scale:0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold dark:text-white">Create Post</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Platform</label>
            <div className="flex gap-2">
              {PLATFORMS.map(p => (
                <button key={p} type="button" onClick={() => setPlatform(p)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all text-xs font-bold ${
                    platform === p ? 'border-current' : 'border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                  style={platform === p ? { borderColor: platformColors[p], color: platformColors[p] } : {}}>
                  <PlatformIcon platform={p} size={16}/>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Content *</label>
            <textarea
              value={content} onChange={e => setContent(e.target.value)} required rows={4}
              placeholder="What's on your mind?"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">{content.length} chars</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Status</label>
            <select
              value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors"
            >
              <option>Draft</option>
              <option>Scheduled</option>
            </select>
          </div>

          {status === 'Scheduled' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Schedule At</label>
              <input
                type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Associated Campaign</label>
            <select value={campaignId} onChange={e => setCampaignId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors">
              <option value="">None</option>
              {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving || !content.trim()}
              className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={saving || !content.trim() ? {} : { background: `linear-gradient(135deg, ${pColor}, ${pColor}cc)` }}>
              {saving ? 'Posting…' : 'Save Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function SocialMedia() {
  const toast = useToast();
  const [activeTab,   setActiveTab]   = useState('Posts');
  const [posts,       setPosts]       = useState([]);
  const [socialStats, setSocialStats] = useState([]);
  const [campaigns,   setCampaigns]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showCreate,  setShowCreate]  = useState(false);
  const [openRow,     setOpenRow]     = useState(null); 
  const [editPost,  setEditPost]  = useState(null); 

  useEffect(() => {
    setError('');
    Promise.all([
      api.get('/api/marketing/social',       { silent: true }),
      api.get('/api/marketing/social/stats', { silent: true }),
      api.get('/api/marketing/campaigns',    { silent: true }),
    ]).then(([pRes, sRes, cRes]) => {
      setPosts(Array.isArray(pRes.data) ? pRes.data : (pRes.data?.data || []));
      setSocialStats(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.data || []));
      setCampaigns(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data || []));
    }).catch(() => {
      setError('Could not load social media data. Please ensure all database migrations have been run.');
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  const close = () => setOpenRow(null);
  document.addEventListener('click', close);
  return () => document.removeEventListener('click', close);
}, []);

  const tabs = ['Posts', 'Analytics'];

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Social Media</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage posts and track social performance.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16}/> Create Post
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Platform stat cards */}
        {!loading && socialStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {socialStats.map((p, i) => {
              const color = platformColors[p.platform] || '#939BFF';
              return (
                <motion.div key={i} whileHover={{ y:-4 }} className="glass-card p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{background:`${color}18`, color}}>
                      <PlatformIcon platform={p.platform} size={18}/>
                    </div>
                    {p.growth_pct != null && (
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+{p.growth_pct}%</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold dark:text-white">{p.followers ? Number(p.followers).toLocaleString() : '—'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.platform} followers</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">{p.posts || 0} posts</span>
                    <span className="text-[10px] font-bold" style={{color}}>{p.engagement != null ? `${p.engagement}%` : '0%'} eng.</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
                activeTab===t ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}>{t}</button>
          ))}
        </div>

        {activeTab === 'Posts' && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 glass-card rounded-2xl">
                <Image size={32} className="mb-3 opacity-40"/>
                <p className="text-sm">No posts yet. Create one to get started.</p>
              </div>
            ) : posts.map((p, i) => {
              const st     = statusStyle[p.status] || statusStyle['Draft'];
              const pColor = platformColors[p.platform] || '#939BFF';
              return (
                <motion.div key={p.id}
                  initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay:i*0.07}}
                  className="glass-card p-5 rounded-2xl flex items-start gap-4 group hover:shadow-md transition-shadow overflow-visible">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl bg-slate-100 dark:bg-slate-800">
                    📸
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold" style={{color: pColor}}>
                        <PlatformIcon platform={p.platform} size={12}/>
                        {p.platform}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{p.status}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString('en-US',{day:'numeric',month:'short'}) : '—'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{p.content}</p>
                    {p.status === 'Published' && (
                      <div className="flex items-center gap-5 mt-3">
                        {[
                          { icon: Heart,         val: p.likes,    color:'#ef4444' },
                          { icon: MessageCircle, val: p.comments, color:'#3b82f6' },
                          { icon: Share2,        val: p.shares,   color:'#10b981' },
                          { icon: Eye,           val: p.reach,    color:'#939BFF' },
                        ].map((s,si) => (
                          <div key={si} className="flex items-center gap-1.5">
                            <s.icon size={13} style={{color:s.color}}/>
                            <span className="text-xs font-bold dark:text-slate-300">
                              {s.val ? Number(s.val).toLocaleString() : '0'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                 <div className={`relative shrink-0 ${openRow === p.id ? 'z-50' : ''}`}>
  <button onClick={(ev) => { ev.stopPropagation(); setOpenRow(openRow === p.id ? null : p.id); }}
    className="text-slate-400 hover:text-slate-600"><MoreVertical size={16}/></button>
  {openRow === p.id && (
    <div className="absolute right-0 bottom-6 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-36">
      <button onClick={() => { setEditPost(p); setOpenRow(null); }}
  className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">Edit Post</button>
      <button onClick={() => {
        api.put(`/api/marketing/social/${p.id}`, { status: 'Published' })
          .then(() => setPosts(prev => prev.map(x => x.id === p.id ? { ...x, status: 'Published' } : x)));
        setOpenRow(null);
      }} className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">Mark as Published</button>
      <button onClick={() => {
        api.put(`/api/marketing/social/${p.id}`, { status: 'Draft' })
          .then(() => setPosts(prev => prev.map(x => x.id === p.id ? { ...x, status: 'Draft' } : x)));
        setOpenRow(null);
      }} className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">Move to Draft</button>
      <button onClick={() => {
        api.delete(`/api/marketing/social/${p.id}`)
          .then(() => setPosts(prev => prev.filter(x => x.id !== p.id)));
        setOpenRow(null);
      }} className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-500">Delete</button>
    </div>
  )}
</div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'Analytics' && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="space-y-6">
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-base font-bold dark:text-white mb-6">Engagement by Platform — Last 30 Days</h2>
              {socialStats.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No analytics data available.</p>
              ) : (
                <div className="space-y-5">
                  {socialStats.map((p, i) => {
                    const color  = platformColors[p.platform] || '#939BFF';
                    const engNum = parseFloat(p.engagement) || 0;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-28 shrink-0">
                          <div style={{color}}><PlatformIcon platform={p.platform} size={14}/></div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{p.platform}</span>
                        </div>
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{width:0}} animate={{width:`${Math.min(engNum*10,100)}%`}}
                            transition={{duration:1, delay:i*0.1}}
                            className="h-full rounded-full" style={{background: color}}
                          />
                        </div>
                        <span className="text-sm font-bold w-12 text-right" style={{color}}>{p.engagement != null ? `${p.engagement}%` : '0%'}</span>
                        <span className="text-xs text-slate-400 w-20 text-right">{p.followers ? Number(p.followers).toLocaleString() : '—'} followers</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreatePostModal
            campaigns={campaigns}
            onClose={() => setShowCreate(false)}
            onAdd={(post) => {
              const newPost = post?.data || post;
  setPosts(prev => [newPost, ...prev]);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
  {editPost && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold dark:text-white">Edit Post</h2>
          <button onClick={() => setEditPost(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Content</label>
            <textarea rows={4} value={editPost.content}
              onChange={e => setEditPost(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors resize-none"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Status</label>
            <select value={editPost.status}
              onChange={e => setEditPost(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm dark:text-white outline-none focus:border-primary transition-colors">
              <option>Draft</option>
              <option>Scheduled</option>
              <option>Published</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditPost(null)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={() => {
              api.put(`/api/marketing/social/${editPost.id}`, {
                content: editPost.content,
                status:  editPost.status,
              }).then(() => {
                setPosts(prev => prev.map(x => x.id === editPost.id ? { ...x, ...editPost } : x));
                setEditPost(null);
                toast.success('Post updated.');
              });
            }} className="flex-1 btn-primary text-sm py-2.5">Save Changes</button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </DashboardLayout>
  );
}
