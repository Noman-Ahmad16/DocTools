import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Image as ImageIcon, SlidersHorizontal, Download, FileText, Trash2, ChevronLeft, ChevronRight, RotateCw, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const ScanPage = () => {
  const [mode, setMode] = useState('home'); // home | camera | gallery | enhance | result
  const [stream, setStream] = useState(null);
  const [scannedPages, setScannedPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [colorMode, setColorMode] = useState('color'); // color | bw | auto
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Scan line animation
  useEffect(() => {
    if (mode !== 'camera') return;
    const interval = setInterval(() => {
      setScanLine(prev => (prev >= 100 ? 0 : prev + 2));
    }, 30);
    return () => clearInterval(interval);
  }, [mode]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setMode('camera');
    } catch (err) {
      alert('Camera access denied or not available. Please allow camera permission.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.92);
    setScannedPages(prev => [...prev, imageData]);
    setCurrentPage(scannedPages.length);
  };

  // Gallery import
  const handleGalleryImport = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScannedPages(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    if (files.length > 0) {
      setMode('enhance');
      stopCamera();
    }
  };

  // Auto-date filename
  const getAutoFilename = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `Scan_${dd}-${mm}-${yyyy}`;
  };

  // Apply filters to canvas
  const applyFilters = (img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.filter = colorMode === 'bw'
      ? `brightness(${brightness}%) contrast(${contrast * 1.5}%) grayscale(100%)`
      : `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Save as PDF
  const saveAsPdf = async () => {
    if (scannedPages.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const pageData of scannedPages) {
        const imgBytes = await fetch(pageData).then(r => r.arrayBuffer());
        const img = await pdfDoc.embedJpg(imgBytes);
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${getAutoFilename()}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { alert('Failed to create PDF: ' + err.message); }
    setIsProcessing(false);
  };

  // Save as JPG
  const saveAsJpg = () => {
    if (scannedPages.length === 0) return;
    const page = scannedPages[currentPage];
    const a = document.createElement('a');
    a.href = page; a.download = `${getAutoFilename()}_page${currentPage + 1}.jpg`; a.click();
  };

  // Backend Export
  const handleExport = async (format) => {
    if (scannedPages.length === 0) return;
    setIsProcessing(true);
    try {
      const endpoint = format === 'docx' ? '/api/pdf/to-word' : format === 'pptx' ? '/api/ppt/pdf-to-ppt' : '/api/excel/pdf-to-excel';
      // In a real app, we'd convert base64 to Blob and send via FormData
      // Since we already have PDF export locally, we can just send the PDF blob to these endpoints
      const pdfDoc = await PDFDocument.create();
      for (const pageData of scannedPages) {
        const imgBytes = await fetch(pageData).then(r => r.arrayBuffer());
        const img = await pdfDoc.embedJpg(imgBytes);
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'scan.pdf');
      
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${getAutoFilename()}.${format}`; a.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (err) { alert('Export failed: ' + err.message); }
    setIsProcessing(false);
  };

  const removePage = (idx) => {
    setScannedPages(prev => prev.filter((_, i) => i !== idx));
    if (currentPage >= scannedPages.length - 1) setCurrentPage(Math.max(0, currentPage - 1));
  };

  const goToResult = () => { stopCamera(); setMode('enhance'); };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '900px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Scan Tools</h1>
        <p style={{ color: 'var(--text-secondary)' }}>CamScanner-style document scanning, enhancing, and saving.</p>
      </div>

      {/* HOME - Choose mode */}
      {mode === 'home' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <button onClick={startCamera} className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'rgba(20,184,166,0.05)', transition: 'all 0.3s' }}>
            <Camera size={56} color="#14b8a6" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Camera Scan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Open camera with corner guides & animated scan line</p>
          </button>
          <button onClick={() => galleryInputRef.current.click()} className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'rgba(99,102,241,0.05)', transition: 'all 0.3s' }}>
            <ImageIcon size={56} color="#6366f1" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Gallery Import</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Import images from your device gallery</p>
          </button>
          <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryImport} />
        </div>
      )}

      {/* CAMERA VIEW */}
      {mode === 'camera' && (
        <div className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', background: '#000', aspectRatio: '4/3' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            
            {/* Corner guide overlays */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
              <div key={corner} style={{
                position: 'absolute', width: '30px', height: '30px',
                top: corner.includes('top') ? '10px' : 'auto', bottom: corner.includes('bottom') ? '10px' : 'auto',
                left: corner.includes('left') ? '10px' : 'auto', right: corner.includes('right') ? '10px' : 'auto',
                borderTop: corner.includes('top') ? '3px solid #14b8a6' : 'none',
                borderBottom: corner.includes('bottom') ? '3px solid #14b8a6' : 'none',
                borderLeft: corner.includes('left') ? '3px solid #14b8a6' : 'none',
                borderRight: corner.includes('right') ? '3px solid #14b8a6' : 'none',
              }} />
            ))}

            {/* Animated scan line */}
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '2px',
              top: `${scanLine}%`, background: 'linear-gradient(90deg, transparent, #14b8a6, transparent)',
              boxShadow: '0 0 8px #14b8a6', transition: 'top 0.03s linear'
            }} />

            {/* Page count badge */}
            {scannedPages.length > 0 && (
              <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#14b8a6', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                {scannedPages.length}
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => galleryInputRef.current.click()} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
              <ImageIcon size={22} />
            </button>
            <button onClick={capturePhoto}
              style={{ width: '70px', height: '70px', borderRadius: '50%', border: '4px solid white', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#14b8a6' }} />
            </button>
            {scannedPages.length > 0
              ? <button onClick={goToResult} className="btn btn-primary" style={{ padding: '0.75rem 1rem', background: '#14b8a6' }}>
                  Done ({scannedPages.length})
                </button>
              : <button onClick={() => { stopCamera(); setMode('home'); }} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                  Cancel
                </button>
            }
          </div>
          <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryImport} />
        </div>
      )}

      {/* ENHANCE & RESULT */}
      {mode === 'enhance' && scannedPages.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          {/* Preview */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem', background: '#000', minHeight: '300px' }}>
              <img
                src={scannedPages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                style={{
                  width: '100%', display: 'block', borderRadius: '0.5rem',
                  filter: colorMode === 'bw' ? `brightness(${brightness}%) contrast(${contrast * 1.5}%) grayscale(100%)` : `brightness(${brightness}%) contrast(${contrast}%)`
                }}
              />
            </div>

            {/* Page navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} className="btn btn-secondary" disabled={currentPage === 0} style={{ padding: '0.5rem' }}>
                <ChevronLeft size={20} />
              </button>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Page {currentPage + 1} of {scannedPages.length}</span>
              <button onClick={() => setCurrentPage(Math.min(scannedPages.length - 1, currentPage + 1))} className="btn btn-secondary" disabled={currentPage === scannedPages.length - 1} style={{ padding: '0.5rem' }}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Controls Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <SlidersHorizontal size={20} color="#14b8a6" />
                <h3 style={{ margin: 0 }}>Auto Enhance</h3>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Brightness</span><span>{brightness}%</span>
                </div>
                <input type="range" min="50" max="200" value={brightness} onChange={e => setBrightness(e.target.value)} style={{ width: '100%', accentColor: '#14b8a6' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Contrast</span><span>{contrast}%</span>
                </div>
                <input type="range" min="50" max="200" value={contrast} onChange={e => setContrast(e.target.value)} style={{ width: '100%', accentColor: '#14b8a6' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['color', 'bw', 'auto'].map(m => (
                  <button key={m} onClick={() => setColorMode(m)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.4rem', border: colorMode === m ? '2px solid #14b8a6' : '1px solid var(--surface-border)', background: colorMode === m ? 'rgba(20,184,166,0.15)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: colorMode === m ? 'bold' : 'normal' }}>
                    {m === 'bw' ? 'B&W' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Page thumbnails */}
            <div className="glass-card" style={{ padding: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pages ({scannedPages.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                {scannedPages.map((page, idx) => (
                  <div key={idx} onClick={() => setCurrentPage(idx)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.35rem', cursor: 'pointer', background: currentPage === idx ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.02)', border: currentPage === idx ? '1px solid #14b8a6' : '1px solid transparent' }}>
                    <img src={page} alt="" style={{ width: '36px', height: '28px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                    <span style={{ fontSize: '0.8rem', flex: 1 }}>Page {idx + 1}</span>
                    <button onClick={(e) => { e.stopPropagation(); removePage(idx); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={startCamera} className="btn btn-secondary" style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem', fontSize: '0.85rem' }}>
                <Camera size={16} /> Add More Pages
              </button>
            </div>

            {/* Save Options */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Save As</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button onClick={saveAsPdf} className="btn btn-primary" disabled={isProcessing} style={{ gridColumn: 'span 2' }}>
                  {isProcessing ? <Loader2 size={16} className="spin" /> : <><Download size={16} /> PDF</>}
                </button>
                <button onClick={() => handleExport('docx')} className="btn btn-secondary" disabled={isProcessing} style={{ fontSize: '0.8rem' }}>Word</button>
                <button onClick={() => handleExport('pptx')} className="btn btn-secondary" disabled={isProcessing} style={{ fontSize: '0.8rem' }}>PPT</button>
                <button onClick={() => handleExport('xlsx')} className="btn btn-secondary" disabled={isProcessing} style={{ fontSize: '0.8rem' }}>Excel</button>
                <button onClick={saveAsJpg} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>JPG</button>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.75rem', textAlign: 'center' }}>
                {getAutoFilename()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state after gallery import but no pages */}
      {mode === 'enhance' && scannedPages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No pages scanned yet.</p>
          <button onClick={() => setMode('home')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Back</button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ScanPage;
