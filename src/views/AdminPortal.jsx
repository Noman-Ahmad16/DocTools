import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutDashboard, FileText, Star, Settings, LogOut, Plus, Trash2, BarChart3, Users, MessageSquare, Eye, EyeOff, Globe, Shield, Share2, DollarSign, Code, Wrench } from 'lucide-react';

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS = {
  get: (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

const DEFAULTS = {
  stats:    { totalUsers: 1240, totalFiles: 5430, avgRating: 4.8 },
  earnings: { total: '1,240.50', adsense: '840.20', premium: '400.30' },
  settings: [],
  blog:     [],
  reviews:  [],
  announcement: '',
  siteSettings: {
    // Basic
    siteTitle: 'DocTools', siteDesc: 'All-in-One Document Toolkit', siteUrl: '', siteAuthor: '', siteEmail: '', siteLang: 'en', timezone: 'UTC',
    // Posts
    postsPerPage: '10', showLabels: true, showShareBtns: true, showCommentCount: true, postTemplate: '',
    // Comments
    commentsEnabled: true, whoCanComment: 'anyone', commentModeration: 'never', showWordVerify: false, commentNotifyEmail: '',
    // SEO
    metaDesc: '', metaKeywords: '', googleAnalyticsId: '', googleSearchConsole: '', robotsTxt: 'User-agent: *\nAllow: /',
    // Social
    facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '', whatsapp: '',
    // Monetization
    adsenseId: '', showAds: false, adLocation: 'sidebar',
    // Privacy
    siteVisibility: 'public', searchEngineVisible: true, showAuthorProfile: true,
    // Custom Code
    headerCode: '', footerCode: '', customCSS: '',
  }
};

// ── Admin credentials (stored in localStorage so they can be changed) ────────
const getAdminPw = () => LS.get('admin_password', 'admin123');
const SECURITY_QUESTION = 'What is your favorite color?';
const SECURITY_ANSWER   = 'blue';

// ─────────────────────────────────────────────────────────────────────────────
const AdminPortal = () => {
  const [isLoggedIn, setIsLoggedIn]         = useState(false);
  const [password, setPassword]             = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [isForgotPw, setIsForgotPw]         = useState(false);
  const [secQuestion]                       = useState(SECURITY_QUESTION);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [activeTab, setActiveTab]           = useState('dashboard');

  const [stats, setStats]             = useState(() => LS.get('admin_stats',    DEFAULTS.stats));
  const [earnings, setEarnings]       = useState(() => LS.get('admin_earnings', DEFAULTS.earnings));
  const [settings, setSettings]       = useState(() => LS.get('admin_settings', DEFAULTS.settings));
  const [posts, setPosts]             = useState(() => LS.get('admin_blog',     DEFAULTS.blog));
  const [reviews, setReviews]         = useState(() => LS.get('admin_reviews',  DEFAULTS.reviews));
  const [announcement, setAnnouncement] = useState(() => LS.get('admin_announcement', DEFAULTS.announcement));
  const [siteSettings, setSiteSettings] = useState(() => LS.get('admin_siteSettings', DEFAULTS.siteSettings));
  const [settingsSection, setSettingsSection] = useState('basic');

  const updateSS = (key, val) => setSiteSettings(prev => ({ ...prev, [key]: val }));
  const saveSiteSettings = () => { LS.set('admin_siteSettings', siteSettings); alert('Settings saved!'); };

  // ── Password Change State ────────────────────────────────────────────────────
  const [pwStep, setPwStep]         = useState(0); // 0=idle, 1=verify current, 2=set new
  const [pwCurrent, setPwCurrent]   = useState('');
  const [pwNew, setPwNew]           = useState('');
  const [pwConfirm, setPwConfirm]   = useState('');
  const [pwShowC, setPwShowC]       = useState(false);
  const [pwShowN, setPwShowN]       = useState(false);

  const handlePwVerify = () => {
    if (pwCurrent === getAdminPw()) {
      setPwStep(2); setPwCurrent('');
    } else {
      alert('❌ Current password is incorrect!');
    }
  };

  const handlePwChange = () => {
    if (pwNew.length < 6) { alert('Password must be at least 6 characters!'); return; }
    if (pwNew !== pwConfirm) { alert('Passwords do not match!'); return; }
    LS.set('admin_password', pwNew);
    alert('✅ Password changed successfully! New password: ' + pwNew);
    setPwStep(0); setPwNew(''); setPwConfirm('');
  };

  const resetPwFlow = () => { setPwStep(0); setPwCurrent(''); setPwNew(''); setPwConfirm(''); };

  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogForm, setBlogForm]         = useState({ title: '', category: '', content: '' });
  const [editingPost, setEditingPost]   = useState(null);
  const editorRef = useRef(null);

  // Try to sync with API in background (optional)
  useEffect(() => {
    if (!isLoggedIn) return;
    const apis = [
      { url: '/api/admin/stats',         key: 'admin_stats',         setter: setStats },
      { url: '/api/admin/earnings',      key: 'admin_earnings',      setter: setEarnings },
      { url: '/api/admin/settings',      key: 'admin_settings',      setter: setSettings },
      { url: '/api/admin/blog',          key: 'admin_blog',          setter: setPosts },
      { url: '/api/admin/reviews?admin=true', key: 'admin_reviews',  setter: setReviews },
    ];
    apis.forEach(({ url, key, setter }) => {
      fetch(url).then(r => r.ok ? r.json() : null).then(d => {
        if (d !== null) { setter(d); LS.set(key, d); }
      }).catch(() => {});
    });
    fetch('/api/admin/announcements').then(r => r.ok ? r.json() : null).then(d => {
      if (d && d.current !== undefined) { setAnnouncement(d.current); LS.set('admin_announcement', d.current); }
    }).catch(() => {});
  }, [isLoggedIn]);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    if (password === getAdminPw()) { setIsLoggedIn(true); }
    else { alert('Incorrect password!'); }
  };

  const handleResetPassword = () => {
    if (recoveryAnswer.toLowerCase() === SECURITY_ANSWER.toLowerCase()) {
      alert('Hint: password is admin123');
      setIsForgotPw(false); setRecoveryAnswer('');
    } else { alert('Wrong answer! Hint: it is a color.'); }
  };

  // ── Blog ────────────────────────────────────────────────────────────────────
  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };

  const saveBlogPost = () => {
    if (!blogForm.title.trim()) { alert('Title required'); return; }
    const content = editorRef.current ? editorRef.current.innerHTML : blogForm.content;
    if (!content || content === '<br>') { alert('Content required'); return; }
    const newPost = { id: Date.now().toString(), title: blogForm.title, category: blogForm.category, content, date: new Date().toISOString() };
    const updated = editingPost
      ? posts.map(p => p.id === editingPost ? { ...p, ...newPost, id: editingPost } : p)
      : [...posts, newPost];
    setPosts(updated); LS.set('admin_blog', updated);
    fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPost) }).catch(() => {});
    setShowBlogForm(false); setEditingPost(null); setBlogForm({ title: '', category: '', content: '' });
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const openEdit = (post) => {
    setEditingPost(post.id);
    setBlogForm({ title: post.title, category: post.category, content: post.content });
    setShowBlogForm(true);
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = post.content || ''; }, 50);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  const insertColor = () => {
    const color = prompt('Enter text color (e.g. #ff0000 or red):');
    if (color) exec('foreColor', color);
  };

  const deletePost = (id) => {
    if (!window.confirm('Delete post?')) return;
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated); LS.set('admin_blog', updated);
    fetch(`/api/admin/blog/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // ── Reviews ─────────────────────────────────────────────────────────────────
  const approveReview = (id) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: true } : r);
    setReviews(updated); LS.set('admin_reviews', updated);
    fetch(`/api/admin/reviews/approve/${id}`, { method: 'POST' }).catch(() => {});
  };

  const deleteReview = (id) => {
    if (!window.confirm('Delete review?')) return;
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated); LS.set('admin_reviews', updated);
    fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const saveStats = () => {
    LS.set('admin_stats', stats);
    fetch('/api/admin/stats', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stats) }).catch(() => {});
    alert('Stats updated!');
  };

  // ── Settings ────────────────────────────────────────────────────────────────
  const toggleTool = (tool) => {
    const updated = settings.includes(tool) ? settings.filter(t => t !== tool) : [...settings, tool];
    setSettings(updated); LS.set('admin_settings', updated);
    fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
  };

  // ── Earnings ────────────────────────────────────────────────────────────────
  const saveEarnings = () => {
    LS.set('admin_earnings', earnings);
    fetch('/api/admin/earnings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(earnings) }).catch(() => {});
    alert('Earnings updated!');
  };

  // ── Announcement ─────────────────────────────────────────────────────────────
  const saveAnnouncement = () => {
    LS.set('admin_announcement', announcement);
    fetch('/api/admin/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: announcement }) }).catch(() => {});
    alert('Announcement saved!');
  };

  // ── Styles ───────────────────────────────────────────────────────────────────
  const card  = { padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--surface-border)' };
  const inp   = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'white', outline: 'none', marginBottom: '1rem' };
  const sideBtn = (tab) => ({ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem', background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.04)', color: activeTab === tab ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' });

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div style={{ ...card, padding: '3rem', width: '420px', textAlign: 'center' }}>
          {!isForgotPw ? (
            <>
              <h2 style={{ marginBottom: '2rem' }}>🔐 Admin Login</h2>
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ ...inp, marginBottom: 0, paddingRight: '3rem' }}
                />
                <button onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              <button onClick={handleLogin} style={{ width: '100%', padding: '0.9rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem' }}>Login</button>
              <button onClick={() => setIsForgotPw(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>Forgot Password?</button>
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: '1rem' }}>Recover Password</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Security Question:<br/><strong style={{ color: 'white' }}>{secQuestion}</strong></p>
              <input type="text" placeholder="Your answer" value={recoveryAnswer} onChange={e => setRecoveryAnswer(e.target.value)} style={inp}/>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setIsForgotPw(false)} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleResetPassword} style={{ flex: 1, padding: '0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Submit</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const TOOLS = ['Merge PDF', 'Split PDF', 'Compress PDF', 'Lock PDF', 'Edit PDF', 'OCR Scan', 'Word to Excel', 'Image to Word'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: '1.5rem', padding: '2rem 0' }}>
      {/* Sidebar */}
      <div style={{ ...card, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', height: 'fit-content' }}>
        {[['dashboard','Dashboard',<LayoutDashboard size={18}/>],['blog','Blog Posts',<FileText size={18}/>],['reviews','Reviews',<Star size={18}/>],['earnings','Earnings',<BarChart3 size={18}/>],['toolconfig','Tool Config',<Wrench size={18}/>],['siteSettings','Settings',<Settings size={18}/>],['announcements','Announcements',<MessageSquare size={18}/>]].map(([tab, label, icon]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={sideBtn(tab)}>{icon}{label}</button>
        ))}
        <div style={{ flex: 1, minHeight: '1.5rem' }}/>
        <button onClick={() => setIsLoggedIn(false)} style={{ ...sideBtn('_'), color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}><LogOut size={18}/>Logout</button>
      </div>

      {/* Content */}
      <div style={{ ...card, padding: '2rem' }}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Admin Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              {[
                { icon: <Users color="var(--primary)" size={28}/>, label: 'Total Visitors',   key: 'totalUsers' },
                { icon: <FileText color="#10b981" size={28}/>,     label: 'Files Processed', key: 'totalFiles' },
                { icon: <Star color="#f59e0b" size={28}/>,         label: 'Avg Rating',      key: 'avgRating' },
              ].map(({ icon, label, key }) => (
                <div key={key} style={{ ...card, textAlign: 'center' }}>
                  <div style={{ marginBottom: '0.75rem' }}>{icon}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{stats[key]}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</div>
                  <input type="number" value={stats[key]} onChange={e => setStats({ ...stats, [key]: e.target.value })}
                    style={{ ...inp, marginTop: '0.75rem', marginBottom: 0, textAlign: 'center', fontSize: '0.85rem' }}/>
                </div>
              ))}
            </div>
            <button onClick={saveStats} style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Save Stats</button>
          </div>
        )}

        {/* BLOG POSTS */}
        {activeTab === 'blog' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Blog Management</h2>
              <button onClick={() => { setShowBlogForm(!showBlogForm); setEditingPost(null); setBlogForm({ title: '', category: '', content: '' }); if (editorRef.current) editorRef.current.innerHTML = ''; }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.2rem', background: showBlogForm ? 'rgba(255,255,255,0.05)' : 'var(--primary)', color: 'white', border: showBlogForm ? '1px solid var(--surface-border)' : 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                {showBlogForm ? '✕ Cancel' : <><Plus size={18}/>New Post</>}
              </button>
            </div>

            {showBlogForm && (
              <div style={{ ...card, marginBottom: '2rem', padding: '0' }}>
                {/* Post meta */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" placeholder="Post Title *" value={blogForm.title}
                    onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
                    style={{ ...inp, marginBottom: 0, fontSize: '1rem', fontWeight: 600 }}/>
                  <input type="text" placeholder="Category (e.g. Tips, News)" value={blogForm.category}
                    onChange={e => setBlogForm({ ...blogForm, category: e.target.value })}
                    style={{ ...inp, marginBottom: 0 }}/>
                </div>

                {/* Rich Text Toolbar */}
                <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                  {/* Headings */}
                  {[['H1','formatBlock','h1'],['H2','formatBlock','h2'],['H3','formatBlock','h3'],['P','formatBlock','p']].map(([lbl, cmd, val]) => (
                    <button key={lbl} onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
                      title={lbl} style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>{lbl}</button>
                  ))}
                  <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.15)', margin: '0 0.25rem' }}/>
                  {/* Inline styles */}
                  {[['B','bold','𝐁'],['I','italic','𝐼'],['U','underline','U̲'],['S','strikeThrough','S̶']].map(([title, cmd, lbl]) => (
                    <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }}
                      title={title} style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.9rem', minWidth: '32px' }}>{lbl}</button>
                  ))}
                  <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.15)', margin: '0 0.25rem' }}/>
                  {/* Alignment */}
                  {[['Left','justifyLeft','⬛◻◻'],['Center','justifyCenter','◻⬛◻'],['Right','justifyRight','◻◻⬛']].map(([title, cmd, lbl]) => (
                    <button key={cmd} onMouseDown={e => { e.preventDefault(); exec(cmd); }}
                      title={title} style={{ padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.75rem' }}>{lbl}</button>
                  ))}
                  <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.15)', margin: '0 0.25rem' }}/>
                  {/* Lists */}
                  {[['Bullet List','insertUnorderedList','• List'],['Numbered List','insertOrderedList','1. List'],['Blockquote','formatBlock','blockquote','❝ Quote']].map(([title, cmd, val, lbl]) => (
                    <button key={title} onMouseDown={e => { e.preventDefault(); exec(cmd, val || null); }}
                      title={title} style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }}>{lbl || title}</button>
                  ))}
                  <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.15)', margin: '0 0.25rem' }}/>
                  {/* Font size */}
                  <select onMouseDown={e => e.stopPropagation()} onChange={e => { exec('fontSize', e.target.value); e.target.value = ''; }}
                    style={{ padding: '0.3rem', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }} defaultValue="">
                    <option value="" disabled>Size</option>
                    {[1,2,3,4,5,6,7].map(s => <option key={s} value={s}>{['8','10','12','14','18','24','36'][s-1]}px</option>)}
                  </select>
                  <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.15)', margin: '0 0.25rem' }}/>
                  {/* Extras */}
                  <button onMouseDown={e => { e.preventDefault(); insertLink(); }} title="Insert Link"
                    style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#60a5fa', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }}>🔗 Link</button>
                  <button onMouseDown={e => { e.preventDefault(); insertImage(); }} title="Insert Image"
                    style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#a78bfa', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }}>🖼 Image</button>
                  <button onMouseDown={e => { e.preventDefault(); insertColor(); }} title="Text Color"
                    style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#f59e0b', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }}>🎨 Color</button>
                  <button onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }} title="Clear Formatting"
                    style={{ padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem' }}>✕ Clear</button>
                </div>

                {/* Editable Content Area */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Start writing your post here..."
                  style={{
                    minHeight: '320px', padding: '1.5rem', outline: 'none', color: 'white',
                    fontSize: '1rem', lineHeight: '1.8', fontFamily: 'inherit',
                    caretColor: 'var(--primary)'
                  }}
                />

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button onClick={() => { setShowBlogForm(false); setEditingPost(null); setBlogForm({ title: '', category: '', content: '' }); if (editorRef.current) editorRef.current.innerHTML = ''; }}
                    style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={saveBlogPost}
                    style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>💾 Publish Post</button>
                </div>
              </div>
            )}

            {/* Posts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map(p => (
                <div key={p.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '0.25rem' }}>{p.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {p.category && <span style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '0.3rem', marginRight: '0.5rem' }}>{p.category}</span>}
                      {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    {p.content && <div style={{ fontSize: '0.85rem', color: '#aaa', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '500px' }} dangerouslySetInnerHTML={{ __html: p.content.substring(0, 120) + '...' }}/> }
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button onClick={() => openEdit(p)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f1', color: '#6366f1', padding: '0.5rem 1rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => deletePost(p.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && !showBlogForm && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }}/>
                  <p>No blog posts yet. Click "New Post" to write your first post.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Manage Reviews</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? '#f59e0b' : 'transparent'} color="#f59e0b"/>)}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>{r.name} <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>• {new Date(r.date).toLocaleDateString()}</span></div>
                    <p style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '0.25rem' }}>"{r.comment}"</p>
                    {r.approved && <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Approved</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!r.approved && <button onClick={() => approveReview(r.id)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '0.4rem', cursor: 'pointer' }}>Approve</button>}
                    <button onClick={() => deleteReview(r.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '0.4rem', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No reviews yet. Reviews submitted on the site will appear here.</p>}
            </div>
          </div>
        )}

        {/* EARNINGS */}
        {activeTab === 'earnings' && (
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Earnings Tracker</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manually update your earnings. Data saved locally.</p>
            <div style={{ ...card, marginBottom: '1.5rem', background: 'rgba(16,185,129,0.05)', border: '1px solid #10b981' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Revenue ($)</div>
              <input type="text" value={earnings.total} onChange={e => setEarnings({ ...earnings, total: e.target.value })}
                style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', background: 'transparent', border: 'none', outline: 'none', width: '100%' }}/>
            </div>
            {[['adsense', 'AdSense Revenue ($)'], ['premium', 'Premium Exports ($)']].map(([key, label]) => (
              <div key={key} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span>{label}</span>
                <input type="text" value={earnings[key]} onChange={e => setEarnings({ ...earnings, [key]: e.target.value })}
                  style={{ background: 'transparent', border: 'none', color: 'white', textAlign: 'right', fontWeight: 'bold', outline: 'none', fontSize: '1.1rem', width: '150px' }}/>
              </div>
            ))}
            <button onClick={saveEarnings} style={{ padding: '0.9rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Save Earnings</button>
          </div>
        )}

        {/* TOOL CONFIG */}
        {activeTab === 'toolconfig' && (
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Tool Configuration</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Toggle which tools are enabled on the platform.</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {TOOLS.map(tool => {
                const isActive = !settings.includes(tool);
                return (
                  <div key={tool} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: isActive ? 'white' : 'var(--text-secondary)' }}>{tool}</span>
                    <div onClick={() => toggleTool(tool)}
                      style={{ position: 'relative', width: '52px', height: '26px', background: isActive ? 'var(--primary)' : '#444', borderRadius: '13px', cursor: 'pointer', transition: 'background 0.3s' }}>
                      <div style={{ position: 'absolute', top: '4px', left: isActive ? '26px' : '4px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'left 0.3s' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SITE SETTINGS */}
        {activeTab === 'siteSettings' && (() => {
          const Toggle = ({ k }) => (
            <div onClick={() => updateSS(k, !siteSettings[k])}
              style={{ position:'relative', width:'50px', height:'25px', background: siteSettings[k] ? 'var(--primary)' : '#444', borderRadius:'13px', cursor:'pointer', transition:'background 0.3s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:'3.5px', left: siteSettings[k] ? '25px' : '4px', width:'18px', height:'18px', background:'white', borderRadius:'50%', transition:'left 0.3s' }}/>
            </div>
          );
          const Row = ({ label, desc, children }) => (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ flex:1, paddingRight:'1rem' }}>
                <div style={{ fontWeight:500 }}>{label}</div>
                {desc && <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.2rem' }}>{desc}</div>}
              </div>
              {children}
            </div>
          );
          const Field = ({ k, placeholder, type='text', full }) => (
            <input type={type} value={siteSettings[k] || ''} placeholder={placeholder}
              onChange={e => updateSS(k, e.target.value)}
              style={{ ...inp, marginBottom:0, ...(full ? {} : { width:'220px', textAlign:'right' }) }}/>
          );
          const SecBtn = ({ id, label, icon }) => (
            <button onClick={() => setSettingsSection(id)}
              style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1rem', borderRadius:'0.5rem', border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:500,
                background: settingsSection===id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: settingsSection===id ? 'white' : 'var(--text-secondary)' }}>{icon}{label}</button>
          );
          return (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h2>⚙️ Site Settings</h2>
                <button onClick={saveSiteSettings} style={{ padding:'0.7rem 1.5rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:700 }}>💾 Save All</button>
              </div>

              {/* Section Tabs */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'2rem', padding:'0.75rem', background:'rgba(0,0,0,0.2)', borderRadius:'0.75rem' }}>
                <SecBtn id="basic"    label="Basic"       icon={<Globe size={15}/>}/>
                <SecBtn id="posts"    label="Posts"       icon={<FileText size={15}/>}/>
                <SecBtn id="comments" label="Comments"    icon={<MessageSquare size={15}/>}/>
                <SecBtn id="seo"      label="SEO & Meta"  icon={<BarChart3 size={15}/>}/>
                <SecBtn id="social"   label="Social"      icon={<Share2 size={15}/>}/>
                <SecBtn id="monetize" label="Monetization" icon={<DollarSign size={15}/>}/>
                <SecBtn id="privacy"  label="Privacy"     icon={<Eye size={15}/>}/>
                <SecBtn id="security" label="Security"    icon={<Shield size={15}/>}/>
                <SecBtn id="code"     label="Custom Code" icon={<Code size={15}/>}/>
              </div>

              {/* BASIC */}
              {settingsSection === 'basic' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Basic Settings</h3>
                  <Row label="Blog Title" desc="The name of your site"><Field k="siteTitle" placeholder="My Blog"/></Row>
                  <Row label="Blog Description" desc="Shown in header and meta tags"><Field k="siteDesc" placeholder="A short description"/></Row>
                  <Row label="Blog URL" desc="Your site's public URL"><Field k="siteUrl" placeholder="https://yourdomain.com"/></Row>
                  <Row label="Author Name"><Field k="siteAuthor" placeholder="Your name"/></Row>
                  <Row label="Contact Email"><Field k="siteEmail" placeholder="you@email.com" type="email"/></Row>
                  <Row label="Language">
                    <select value={siteSettings.siteLang} onChange={e => updateSS('siteLang', e.target.value)}
                      style={{ ...inp, marginBottom:0, width:'220px' }}>
                      {[['en','English'],['ur','Urdu'],['ar','Arabic'],['fr','French'],['de','German'],['es','Spanish'],['zh','Chinese']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Row>
                  <Row label="Timezone">
                    <select value={siteSettings.timezone} onChange={e => updateSS('timezone', e.target.value)}
                      style={{ ...inp, marginBottom:0, width:'220px' }}>
                      {['UTC','Asia/Karachi','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Dubai','Asia/Kolkata'].map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </Row>
                </div>
              )}

              {/* POSTS */}
              {settingsSection === 'posts' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Posts & Display</h3>
                  <Row label="Posts Per Page" desc="How many posts to show on main page"><Field k="postsPerPage" type="number" placeholder="10"/></Row>
                  <Row label="Show Post Labels/Categories" desc="Display category tags on posts"><Toggle k="showLabels"/></Row>
                  <Row label="Show Share Buttons" desc="Facebook, Twitter, WhatsApp share"><Toggle k="showShareBtns"/></Row>
                  <Row label="Show Comment Count" desc="Display number of comments on each post"><Toggle k="showCommentCount"/></Row>
                  <div style={{ marginTop:'1.5rem' }}>
                    <div style={{ fontWeight:500, marginBottom:'0.5rem' }}>Post Template</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem' }}>Default HTML/text added to new posts</div>
                    <textarea value={siteSettings.postTemplate} onChange={e => updateSS('postTemplate', e.target.value)}
                      rows={5} placeholder="<p>Write your post here...</p>"
                      style={{ ...inp, resize:'vertical' }}/>
                  </div>
                </div>
              )}

              {/* COMMENTS */}
              {settingsSection === 'comments' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Comment Settings</h3>
                  <Row label="Enable Comments" desc="Allow visitors to leave comments"><Toggle k="commentsEnabled"/></Row>
                  <Row label="Who Can Comment">
                    <select value={siteSettings.whoCanComment} onChange={e => updateSS('whoCanComment', e.target.value)}
                      style={{ ...inp, marginBottom:0, width:'220px' }}>
                      <option value="anyone">Anyone</option>
                      <option value="registered">Registered Users Only</option>
                      <option value="members">Blog Members Only</option>
                      <option value="admin">Only Admin</option>
                    </select>
                  </Row>
                  <Row label="Comment Moderation">
                    <select value={siteSettings.commentModeration} onChange={e => updateSS('commentModeration', e.target.value)}
                      style={{ ...inp, marginBottom:0, width:'220px' }}>
                      <option value="never">Never (auto-approve)</option>
                      <option value="always">Always (manual approve)</option>
                      <option value="old">For posts older than 14 days</option>
                    </select>
                  </Row>
                  <Row label="Show Word Verification (CAPTCHA)" desc="Prevent spam comments"><Toggle k="showWordVerify"/></Row>
                  <Row label="Comment Notification Email" desc="Get email when someone comments"><Field k="commentNotifyEmail" placeholder="notify@email.com" type="email"/></Row>
                </div>
              )}

              {/* SEO */}
              {settingsSection === 'seo' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>SEO & Meta</h3>
                  <div style={{ marginBottom:'1.25rem' }}>
                    <div style={{ fontWeight:500, marginBottom:'0.4rem' }}>Meta Description</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem' }}>Shown in Google search results (max 160 chars)</div>
                    <textarea value={siteSettings.metaDesc} onChange={e => updateSS('metaDesc', e.target.value)} rows={3}
                      placeholder="Describe your site for search engines..."
                      style={{ ...inp, resize:'vertical' }}/>
                    <div style={{ fontSize:'0.75rem', color: siteSettings.metaDesc.length > 160 ? '#ef4444' : 'var(--text-secondary)' }}>{siteSettings.metaDesc.length}/160</div>
                  </div>
                  <div style={{ marginBottom:'1.25rem' }}>
                    <div style={{ fontWeight:500, marginBottom:'0.4rem' }}>Meta Keywords</div>
                    <input type="text" value={siteSettings.metaKeywords} onChange={e => updateSS('metaKeywords', e.target.value)}
                      placeholder="pdf, converter, document tools..." style={inp}/>
                  </div>
                  <Row label="Google Analytics ID" desc="e.g. G-XXXXXXXXXX"><Field k="googleAnalyticsId" placeholder="G-XXXXXXXXXX"/></Row>
                  <Row label="Google Search Console" desc="Verification meta tag content"><Field k="googleSearchConsole" placeholder="verification_code_here"/></Row>
                  <div style={{ marginTop:'1.25rem' }}>
                    <div style={{ fontWeight:500, marginBottom:'0.4rem' }}>robots.txt</div>
                    <textarea value={siteSettings.robotsTxt} onChange={e => updateSS('robotsTxt', e.target.value)} rows={5}
                      style={{ ...inp, fontFamily:'monospace', fontSize:'0.85rem', resize:'vertical' }}/>
                  </div>
                </div>
              )}

              {/* SOCIAL */}
              {settingsSection === 'social' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Social Media Links</h3>
                  {[['facebook','🔵 Facebook Page URL','https://facebook.com/yourpage'],['twitter','🐦 Twitter/X Profile URL','https://twitter.com/yourhandle'],['instagram','📸 Instagram URL','https://instagram.com/yourhandle'],['linkedin','💼 LinkedIn URL','https://linkedin.com/in/yourprofile'],['youtube','▶️ YouTube Channel URL','https://youtube.com/@yourchannel'],['whatsapp','💬 WhatsApp Number (with country code)','+923001234567']].map(([k,label,ph]) => (
                    <div key={k} style={{ marginBottom:'1rem' }}>
                      <div style={{ fontWeight:500, marginBottom:'0.4rem' }}>{label}</div>
                      <input type="text" value={siteSettings[k]||''} onChange={e => updateSS(k, e.target.value)}
                        placeholder={ph} style={inp}/>
                    </div>
                  ))}
                </div>
              )}

              {/* MONETIZATION */}
              {settingsSection === 'monetize' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Monetization</h3>
                  <Row label="Show Ads" desc="Display advertisements on the site"><Toggle k="showAds"/></Row>
                  <Row label="Google AdSense Publisher ID" desc="e.g. ca-pub-XXXXXXXXXXXXXXXX"><Field k="adsenseId" placeholder="ca-pub-XXXXXXXXXXXXXXXX"/></Row>
                  <Row label="Ad Placement">
                    <select value={siteSettings.adLocation} onChange={e => updateSS('adLocation', e.target.value)}
                      style={{ ...inp, marginBottom:0, width:'220px' }}>
                      <option value="sidebar">Sidebar</option>
                      <option value="header">Below Header</option>
                      <option value="footer">Above Footer</option>
                      <option value="between">Between Posts</option>
                      <option value="all">All Locations</option>
                    </select>
                  </Row>
                  <div style={{ marginTop:'1.5rem', padding:'1rem', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'0.75rem' }}>
                    <div style={{ fontWeight:600, color:'#f59e0b', marginBottom:'0.4rem' }}>💡 Tip</div>
                    <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>To connect Google AdSense, paste your AdSense Publisher ID above and enable ads. Make sure your site is approved by AdSense first.</div>
                  </div>
                </div>
              )}

              {/* PRIVACY */}
              {settingsSection === 'privacy' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Privacy & Visibility</h3>
                  <Row label="Site Visibility">
                    <select value={siteSettings.siteVisibility} onChange={e => updateSS('siteVisibility', e.target.value)}
                      style={{ ...inp, marginBottom:0, width:'220px' }}>
                      <option value="public">Public — Visible to everyone</option>
                      <option value="private">Private — Only admin can view</option>
                      <option value="members">Members Only</option>
                    </select>
                  </Row>
                  <Row label="Visible to Search Engines" desc="Allow Google to index your site"><Toggle k="searchEngineVisible"/></Row>
                  <Row label="Show Author Profile" desc="Display author info on posts"><Toggle k="showAuthorProfile"/></Row>
                  <div style={{ marginTop:'1.5rem', padding:'1rem', background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'0.75rem' }}>
                    <div style={{ fontWeight:600, color:'#ef4444', marginBottom:'0.4rem' }}>⚠️ Danger Zone</div>
                    <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'0.75rem' }}>These actions cannot be undone.</div>
                    <button onClick={() => { if(window.confirm('Clear ALL blog posts? This cannot be undone.')) { setPosts([]); LS.set('admin_blog',[]); alert('Done.'); } }}
                      style={{ padding:'0.6rem 1.2rem', background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', color:'#ef4444', borderRadius:'0.5rem', cursor:'pointer', marginRight:'0.75rem' }}>🗑 Delete All Posts</button>
                    <button onClick={() => { if(window.confirm('Clear ALL reviews?')) { setReviews([]); LS.set('admin_reviews',[]); alert('Done.'); } }}
                      style={{ padding:'0.6rem 1.2rem', background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', color:'#ef4444', borderRadius:'0.5rem', cursor:'pointer' }}>🗑 Delete All Reviews</button>
                  </div>
                </div>
              )}

              {/* SECURITY */}
              {settingsSection === 'security' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Security & Authentication</h3>
                  <div style={{ ...card, padding:'1.5rem' }}>
                    <div style={{ fontWeight:600, marginBottom:'0.5rem', fontSize:'1.1rem' }}>Change Admin Password</div>
                    <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>Change the password you use to log into the admin portal.</p>
                    
                    {pwStep === 0 && (
                      <button onClick={() => setPwStep(1)} style={{ padding:'0.7rem 1.5rem', background:'rgba(99,102,241,0.15)', border:'1px solid var(--primary)', color:'var(--primary)', borderRadius:'0.5rem', cursor:'pointer', fontWeight:600 }}>Change Password</button>
                    )}

                    {pwStep === 1 && (
                      <div style={{ background:'rgba(0,0,0,0.2)', padding:'1.5rem', borderRadius:'0.5rem' }}>
                        <div style={{ fontWeight:500, marginBottom:'0.75rem' }}>Verify Current Password</div>
                        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                          <input type={pwShowC ? 'text' : 'password'} value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} placeholder="Enter current password" style={{ ...inp, marginBottom:0, width:'100%' }}/>
                          <button onClick={() => setPwShowC(!pwShowC)} style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', padding:'0.5rem' }}>{pwShowC ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                        </div>
                        <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem' }}>
                          <button onClick={resetPwFlow} style={{ padding:'0.7rem 1.5rem', background:'transparent', border:'1px solid var(--surface-border)', color:'var(--text-secondary)', borderRadius:'0.5rem', cursor:'pointer' }}>Cancel</button>
                          <button onClick={handlePwVerify} style={{ padding:'0.7rem 1.5rem', background:'var(--primary)', border:'none', color:'white', borderRadius:'0.5rem', cursor:'pointer', fontWeight:600 }}>Verify</button>
                        </div>
                      </div>
                    )}

                    {pwStep === 2 && (
                      <div style={{ background:'rgba(0,0,0,0.2)', padding:'1.5rem', borderRadius:'0.5rem' }}>
                        <div style={{ fontWeight:500, marginBottom:'0.75rem', color:'#10b981' }}>Current Password Verified. Set New Password:</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                            <input type={pwShowN ? 'text' : 'password'} value={pwNew} onChange={e => setPwNew(e.target.value)} placeholder="New Password" style={{ ...inp, marginBottom:0, width:'100%' }}/>
                            <button onClick={() => setPwShowN(!pwShowN)} style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', padding:'0.5rem' }}>{pwShowN ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                          </div>
                          <input type={pwShowN ? 'text' : 'password'} value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="Confirm New Password" style={{ ...inp, marginBottom:0, width:'calc(100% - 42px)' }}/>
                        </div>
                        <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem' }}>
                          <button onClick={resetPwFlow} style={{ padding:'0.7rem 1.5rem', background:'transparent', border:'1px solid var(--surface-border)', color:'var(--text-secondary)', borderRadius:'0.5rem', cursor:'pointer' }}>Cancel</button>
                          <button onClick={handlePwChange} style={{ padding:'0.7rem 1.5rem', background:'#10b981', border:'none', color:'white', borderRadius:'0.5rem', cursor:'pointer', fontWeight:600 }}>Update Password</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CUSTOM CODE */}
              {settingsSection === 'code' && (
                <div>
                  <h3 style={{ marginBottom:'1.25rem', color:'var(--text-secondary)', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Custom Code Injection</h3>
                  <div style={{ marginBottom:'1.5rem' }}>
                    <div style={{ fontWeight:500, marginBottom:'0.4rem' }}>Header Code <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>(injected in &lt;head&gt;)</span></div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem' }}>Add Google Analytics, meta tags, custom scripts</div>
                    <textarea value={siteSettings.headerCode} onChange={e => updateSS('headerCode', e.target.value)} rows={6}
                      placeholder={'<!-- e.g. Google Analytics script -->'}
                      style={{ ...inp, fontFamily:'monospace', fontSize:'0.85rem', resize:'vertical' }}/>
                  </div>
                  <div style={{ marginBottom:'1.5rem' }}>
                    <div style={{ fontWeight:500, marginBottom:'0.4rem' }}>Footer Code <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>(injected before &lt;/body&gt;)</span></div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem' }}>Add chat widgets, analytics, custom scripts</div>
                    <textarea value={siteSettings.footerCode} onChange={e => updateSS('footerCode', e.target.value)} rows={6}
                      placeholder={'<!-- e.g. live chat widget -->'}
                      style={{ ...inp, fontFamily:'monospace', fontSize:'0.85rem', resize:'vertical' }}/>
                  </div>
                  <div>
                    <div style={{ fontWeight:500, marginBottom:'0.4rem' }}>Custom CSS</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'0.5rem' }}>Override site styles</div>
                    <textarea value={siteSettings.customCSS} onChange={e => updateSS('customCSS', e.target.value)} rows={8}
                      placeholder={'/* your custom styles */'}
                      style={{ ...inp, fontFamily:'monospace', fontSize:'0.85rem', resize:'vertical' }}/>
                  </div>
                </div>
              )}

              <div style={{ marginTop:'2rem', paddingTop:'1.5rem', borderTop:'1px solid var(--surface-border)', display:'flex', justifyContent:'flex-end' }}>
                <button onClick={saveSiteSettings} style={{ padding:'0.9rem 2.5rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:700, fontSize:'1rem' }}>💾 Save Settings</button>
              </div>
            </div>
          );
        })()}

        {/* ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Send Announcement</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This message will be displayed as a banner on the homepage. Leave blank to clear it.</p>
            <textarea
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              placeholder="Enter announcement message for all users..."
              rows={6}
              style={{ ...inp, resize: 'vertical', fontSize: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={saveAnnouncement} style={{ flex: 1, padding: '0.9rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>📢 Broadcast</button>
              <button onClick={() => { setAnnouncement(''); LS.set('admin_announcement', ''); }} style={{ padding: '0.9rem 1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer' }}>Clear</button>
            </div>
            {announcement && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(20,184,166,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Preview:</div>
                <div style={{ color: 'white' }}>{announcement}</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPortal;
