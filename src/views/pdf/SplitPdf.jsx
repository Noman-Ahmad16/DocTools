import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, Loader2, Download } from 'lucide-react';

const SplitPdf = () => {
  const [file, setFile] = useState(null);
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleSplit = async () => {
    if (!file) return;
    if (!startPage || !endPage) {
      setError('Please enter both start and end pages.');
      return;
    }
    
    if (parseInt(startPage) < 1 || parseInt(endPage) < parseInt(startPage)) {
      setError('Invalid page range.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('startPage', startPage);
    formData.append('endPage', endPage);

    try {
      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to split PDF');
      }

      // Download the split PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `split_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Split PDF</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Extract pages from your PDF file instantly and securely.
        </p>
      </div>

      <div className="glass-card">
        {!file ? (
          <div 
            className={`drop-zone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{ 
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--surface-border)'}`,
              borderRadius: '1rem', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer',
              background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.3s ease'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf" 
              style={{ display: 'none' }} 
            />
            <UploadCloud size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drag & Drop your PDF here</h3>
            <p style={{ color: 'var(--text-secondary)' }}>or click to browse from your device</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>Max file size: 50MB</p>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <File size={48} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', wordBreak: 'break-all' }}>{file.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Start Page</label>
                <input 
                  type="number" 
                  min="1"
                  value={startPage}
                  onChange={(e) => setStartPage(e.target.value)}
                  placeholder="e.g. 1"
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', width: '100px' }}
                />
              </div>
              <span style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>to</span>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>End Page</label>
                <input 
                  type="number" 
                  min="1"
                  value={endPage}
                  onChange={(e) => setEndPage(e.target.value)}
                  placeholder="e.g. 5"
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', width: '100px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setFile(null)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSplit}
                disabled={isLoading || !startPage || !endPage}
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><Download size={18} /> Split PDF</>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPdf;
