import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, Loader2, Download } from 'lucide-react';

const ResizeImage = () => {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
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
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleResize = async () => {
    if (!file) return;
    if (!width && !height) {
      setError('Please provide at least width or height.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);

    try {
      const response = await fetch('/api/image/resize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resize image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `resized_${file.name}`;
      
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
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Resize Image</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Change image dimensions exactly how you need them.
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
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <UploadCloud size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drag & Drop your Image here</h3>
            <p style={{ color: 'var(--text-secondary)' }}>or click to browse from your device</p>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <ImageIcon size={48} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', wordBreak: 'break-all' }}>{file.name}</h3>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Width (px)</label>
                <input 
                  type="number" 
                  min="1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 800"
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', width: '120px' }}
                />
              </div>
              <span style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>x</span>
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Height (px)</label>
                <input 
                  type="number" 
                  min="1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 600"
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', width: '120px' }}
                />
              </div>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Leave one field blank to maintain aspect ratio automatically.
            </p>

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
                onClick={handleResize}
                disabled={isLoading || (!width && !height)}
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Resizing...</>
                ) : (
                  <><Download size={18} /> Resize Image</>
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

export default ResizeImage;
