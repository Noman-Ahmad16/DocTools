import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, Loader2, Download } from 'lucide-react';

/**
 * Reusable file-conversion tool component.
 * Props:
 *  - title: string
 *  - description: string
 *  - accept: string (e.g. ".pdf" or "image/*")
 *  - apiEndpoint: string (e.g. "/api/pdf/compress")
 *  - fieldName: string (form field name for the file, e.g. "pdf" or "image")
 *  - outputFilename: function(originalName) => string
 *  - accentColor: string (CSS color for button/icon)
 *  - maxMB: number (max file size in MB)
 *  - extraFields: array of { name, label, type, options, placeholder } for extra form fields
 *  - icon: ReactNode
 */
const ConversionTool = ({
  title,
  description,
  accept = '.pdf',
  apiEndpoint,
  fieldName = 'file',
  outputFilename,
  accentColor = 'var(--primary)',
  maxMB = 50,
  extraFields = [],
  icon,
}) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [extraValues, setExtraValues] = useState(
    extraFields.reduce((acc, f) => ({ ...acc, [f.name]: f.defaultValue || '' }), {})
  );
  const fileInputRef = useRef(null);

  const validateAndSetFile = (f) => {
    setError(null); setDone(false);
    if (f.size > maxMB * 1024 * 1024) {
      return setError(`File size must be less than ${maxMB}MB.`);
    }
    setFile(f);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsLoading(true); setError(null); setDone(false);

    const formData = new FormData();
    formData.append(fieldName, file);
    Object.entries(extraValues).forEach(([key, val]) => formData.append(key, val));

    try {
      const res = await fetch(apiEndpoint, { method: 'POST', body: formData });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Conversion failed. Please try again.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilename ? outputFilename(file.name) : `converted_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        {icon && <div style={{ marginBottom: '1rem' }}>{icon}</div>}
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{description}</p>
      </div>

      <div className="glass-card">
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files?.[0] && validateAndSetFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current.click()}
            style={{
              border: `2px dashed ${isDragging ? accentColor : 'var(--surface-border)'}`,
              borderRadius: '1rem', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer',
              background: isDragging ? 'rgba(99,102,241,0.05)' : 'transparent', transition: 'all 0.3s'
            }}
          >
            <input
              type="file" ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
              accept={accept} style={{ display: 'none' }}
            />
            <UploadCloud size={64} color={accentColor} style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drag & Drop your file here</h3>
            <p style={{ color: 'var(--text-secondary)' }}>or click to browse • Max {maxMB}MB</p>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <UploadCloud size={48} color={accentColor} style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.25rem', wordBreak: 'break-all' }}>{file.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            {/* Extra Fields */}
            {extraFields.length > 0 && (
              <div style={{ maxWidth: '400px', margin: '0 auto 2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {extraFields.map((field) => (
                  <div key={field.name}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        value={extraValues[field.name]}
                        onChange={(e) => setExtraValues({ ...extraValues, [field.name]: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', fontSize: '1rem' }}
                      >
                        {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={extraValues[field.name]}
                        onChange={(e) => setExtraValues({ ...extraValues, [field.name]: e.target.value })}
                        placeholder={field.placeholder || ''}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'white', fontSize: '1rem' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {done && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>✅ Done! File downloaded successfully.</p>}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setFile(null); setDone(false); setError(null); }} disabled={isLoading}>
                Change File
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConvert}
                disabled={isLoading}
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
              >
                {isLoading
                  ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  : <><Download size={18} /> Convert & Download</>
                }
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', display: 'flex', gap: '0.5rem', color: '#fca5a5' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />{error}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ConversionTool;
