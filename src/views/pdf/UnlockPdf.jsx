import React, { useState, useRef } from 'react';
import { UploadCloud, Unlock, AlertCircle, Loader2, Download } from 'lucide-react';

const UnlockPdf = () => {
  const [file, setFile] = useState(null);
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

  const handleUnlock = async () => {
    setIsLoading(true); setError(null); setDone(false);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await fetch('/api/pdf/unlock', { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to unlock PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `unlocked_${file.name}`; a.click();
      window.URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Unlock PDF</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Remove restrictions from your PDF and make it freely accessible.</p>
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
            <Unlock size={48} color="#22c55e" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', wordBreak: 'break-all' }}>{file.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', padding: '0.75rem', background: 'rgba(234,179,8,0.1)', borderRadius: '0.5rem', border: '1px solid rgba(234,179,8,0.3)' }}>
              ⚠️ This tool works best on lightly restricted PDFs. Strongly encrypted files may not be unlocked.
            </p>
            {done && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>✅ PDF unlocked and downloaded!</p>}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setFile(null); setDone(false); }} disabled={isLoading}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUnlock} disabled={isLoading} style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}>
                {isLoading ? <><Loader2 size={18} /> Unlocking...</> : <><Download size={18} /> Unlock & Download</>}
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

export default UnlockPdf;
