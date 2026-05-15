import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, Loader2, Download } from 'lucide-react';

const ConvertImage = () => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('png');
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

  const handleConvert = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('format', format);

    try {
      const response = await fetch('/api/image/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const oldExt = file.name.substring(file.name.lastIndexOf('.'));
      const newName = `converted_${file.name.replace(oldExt, '.' + format)}`;
      a.download = newName;
      
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
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Convert Image</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Change image formats easily (JPG, PNG, WEBP).
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
            
            <div style={{ marginBottom: '2rem', textAlign: 'left', maxWidth: '300px', margin: '0 auto 2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Target Format
              </label>
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.75rem', borderRadius: '0.5rem', 
                  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', 
                  color: 'white', fontSize: '1rem' 
                }}
              >
                <option value="jpeg">JPEG / JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
                <option value="avif">AVIF</option>
                <option value="tiff">TIFF</option>
              </select>
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
                onClick={handleConvert}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Converting...</>
                ) : (
                  <><Download size={18} /> Convert Image</>
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

export default ConvertImage;
