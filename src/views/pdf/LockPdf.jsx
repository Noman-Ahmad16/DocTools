import React, { useState, useRef } from 'react';
import { UploadCloud, Lock, AlertCircle, Loader2, Download, Eye, EyeOff } from 'lucide-react';

const LockPdf = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (f) => {
    setError(null); setDone(false);
    if (f.type !== 'application/pdf') return setError('Please select a valid PDF file.');
    if (f.size > 50 * 1024 * 1024) return setError('File size must be less than 50MB.');
    setFile(f);
  };

  const handleLock = async () => {
    if (!password) return setError('Please enter a password.');
    setIsLoading(true); setError(null); setDone(false);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('password', password);
    try {
      const res = await fetch('/api/pdf/lock', { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to lock PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `locked_${file.name}`; a.click();
      window.URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Lock PDF</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Password protect your PDF file to restrict access.</p>
      </div>
      <div className="glass-card">
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files?.[0] && validateAndSetFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current.click()}
            style={{ border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--surface-border)'}`, borderRadius: '1rem', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(99,102,241,0.05)' : 'transparent', transition: 'all 0.3s' }}
          >
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} accept=".pdf" style={{ display: 'none' }} />
            <UploadCloud size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drag & Drop your PDF here</h3>
            <p style={{ color: 'var(--text-secondary)' }}>or click to browse • Max 50MB</p>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Lock size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', wordBreak: 'break-all' }}>{file.name}</h3>
            <div style={{ maxWidth: '400px', margin: '1.5rem auto', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Set Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', fontSize: '1rem' }}
                />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {done && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>✅ PDF locked and downloaded!</p>}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setFile(null); setPassword(''); setDone(false); }} disabled={isLoading}>Cancel</button>
              <button className="btn btn-primary" onClick={handleLock} disabled={isLoading || !password} style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
                {isLoading ? <><Loader2 size={18} /> Locking...</> : <><Download size={18} /> Lock & Download</>}
              </button>
            </div>
          </div>
        )}
        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', display: 'flex', gap: '0.5rem', color: '#fca5a5' }}>
            <AlertCircle size={20} />{error}
          </div>
        )}
      </div>
    </div>
  );
};

export default LockPdf;
