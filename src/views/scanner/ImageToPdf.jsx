import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { Camera, UploadCloud, Download, X, Settings, Maximize, File } from 'lucide-react';

const ImageToPdf = () => {
  const [images, setImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pageSize, setPageSize] = useState('original'); // 'original', 'a4'
  const [marginSize, setMarginSize] = useState(10); // in mm

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    
    try {
      // Load all image objects to get their true dimensions
      const imageObjects = await Promise.all(images.map(img => {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve({ preview: img.preview, width: image.width, height: image.height });
          image.onerror = reject;
          image.src = img.preview;
        });
      }));

      let doc;
      
      imageObjects.forEach((imgObj, index) => {
        if (pageSize === 'original') {
          // Use original image dimensions (in pixels mapped to px units)
          const pdfWidth = imgObj.width;
          const pdfHeight = imgObj.height;
          const orientation = pdfWidth > pdfHeight ? 'l' : 'p';
          
          if (index === 0) {
            doc = new jsPDF({ orientation, unit: 'px', format: [pdfWidth, pdfHeight] });
          } else {
            doc.addPage([pdfWidth, pdfHeight], orientation);
          }
          doc.addImage(imgObj.preview, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        } else {
          // Standard size like A4
          if (index === 0) {
            doc = new jsPDF({ format: pageSize });
          } else {
            doc.addPage(pageSize);
          }
          
          const pWidth = doc.internal.pageSize.getWidth();
          const pHeight = doc.internal.pageSize.getHeight();
          
          const margin = marginSize;
          const maxW = pWidth - (margin * 2);
          const maxH = pHeight - (margin * 2);
          
          // Calculate aspect ratio to fit within page
          const imgRatio = imgObj.width / imgObj.height;
          const pageRatio = maxW / maxH;
          
          let finalW = maxW;
          let finalH = maxH;
          
          if (imgRatio > pageRatio) {
            finalH = maxW / imgRatio;
          } else {
            finalW = maxH * imgRatio;
          }
          
          // Center the image
          const x = margin + (maxW - finalW) / 2;
          const y = margin + (maxH - finalH) / 2;
          
          doc.addImage(imgObj.preview, 'JPEG', x, y, finalW, finalH, undefined, 'FAST');
        }
      });
      
      doc.save('DocTools_Images.pdf');
    } catch (error) {
      console.error("Error creating PDF from images:", error);
      alert("Failed to convert images to PDF.");
    }
    setIsConverting(false);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Camera size={40} color="#6366f1" />
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Image to PDF</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Convert JPG, PNG to a PDF document.</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Settings size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Page Settings</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Page Size</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn ${pageSize === 'original' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPageSize('original')}
                style={{ flex: 1, padding: '0.5rem' }}
              >
                <Maximize size={16} /> Original
              </button>
              <button 
                className={`btn ${pageSize === 'a4' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPageSize('a4')}
                style={{ flex: 1, padding: '0.5rem' }}
              >
                <File size={16} /> A4
              </button>
            </div>
          </div>
          
          {pageSize !== 'original' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Margin (mm)</label>
              <input 
                type="number" 
                value={marginSize} 
                onChange={(e) => setMarginSize(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>
          )}
        </div>

        <label className="drop-zone" style={{ display: 'block' }}>
          <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Select Images</h3>
          <p style={{ color: 'var(--text-secondary)' }}>or click here to browse</p>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="input-file" 
            onChange={handleImageChange}
          />
        </label>
      </div>

      {images.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Selected Images ({images.length})</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {images.map((img, index) => (
              <div key={index} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', height: '120px' }}>
                <img src={img.preview} alt={`preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={generatePdf}
            disabled={isConverting}
            style={{ width: '100%', opacity: isConverting ? 0.5 : 1, cursor: isConverting ? 'not-allowed' : 'pointer' }}
          >
            {isConverting ? 'Converting...' : (
              <>
                <Download size={20} />
                Convert to PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageToPdf;
