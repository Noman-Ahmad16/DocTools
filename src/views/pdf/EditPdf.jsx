import React, { useState, useRef } from 'react';
import OfficeToolbar from '../../components/OfficeToolbar';
import { UploadCloud, ChevronLeft, ChevronRight, Type, Eraser } from 'lucide-react';

const EditPdf = () => {
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tool, setTool] = useState('text');
  const [color, setColor] = useState('#000000');
  const [textStyle, setTextStyle] = useState({ bold: false, italic: false, underline: false, fontSize: '24pt', fontColor: '#000000' });
  const [annotations, setAnnotations] = useState([]);

  const canvasRef = useRef(null);

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') setFile(f);
  };

  const handleAction = (type, val = null) => {
    if (type === 'fontSize' || type === 'fontColor') {
      setTextStyle(prev => ({ ...prev, [type]: val }));
      if (type === 'fontColor') setColor(val);
    } else {
      setTextStyle(prev => ({ ...prev, [type]: !prev[type] }));
    }
  };

  const addAnnotation = (e) => {
    if (!file || tool !== 'text') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const text = prompt('Enter text for PDF:');
    if (text) {
      setAnnotations([...annotations, {
        id: Date.now(), page: currentPage, x, y, text, color,
        style: { ...textStyle }
      }]);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      for (const a of annotations) {
        if (a.page - 1 < pages.length) {
          const page = pages[a.page - 1];
          const pageHeight = page.getHeight();
          
          let r = 0, g = 0, b = 0;
          if (a.color.startsWith('#')) {
            const hex = a.color.replace('#', '');
            r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
            g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
            b = parseInt(hex.substring(4, 6), 16) / 255 || 0;
          }
          
          let fontSize = parseInt(a.style.fontSize) || 18;
          let textFont = a.style.bold ? boldFont : font;
          
          page.drawText(a.text, {
            x: a.x,
            y: pageHeight - a.y - fontSize,
            size: fontSize,
            font: textFont,
            color: rgb(r, g, b)
          });
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${file.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF', error);
      alert('Failed to export PDF.');
    }
    setIsProcessing(false);
  };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1200px' }}>
      <div style={{ background: '#1e293b', border: '1px solid var(--surface-border)', borderRadius: '1.25rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '880px', boxShadow: '0 30px 70px rgba(0,0,0,0.5)' }}>
        
        <OfficeToolbar 
          title={file ? file.name : "Professional PDF Editor"} 
          onDownload={handleDownload} 
          onImport={() => document.getElementById('pdf-upload').click()}
          onFontSize={(s) => handleAction('fontSize', s)}
          onFontColor={(c) => handleAction('fontColor', c)}
          type="word" 
          onBold={() => handleAction('bold')}
          onItalic={() => handleAction('italic')}
          onUnderline={() => handleAction('underline')}
          activeStates={{ ...textStyle, align: 'left' }}
        />

        {!file ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', cursor: 'pointer', border: '2px dashed var(--primary)' }} onClick={() => document.getElementById('pdf-upload').click()}>
              <input type="file" id="pdf-upload" hidden accept=".pdf" onChange={onFileChange} />
              <UploadCloud size={80} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
              <h2>Upload PDF Document</h2>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div className="office-sidebar" style={{ width: '300px', background: '#1e293b', borderRight: '1px solid var(--surface-border)', padding: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Edit Tools</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
                <button className={`btn ${tool === 'text' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTool('text')}><Type size={18}/> Text</button>
                <button className={`btn ${tool === 'erase' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTool('erase')}><Eraser size={18}/> Erase</button>
              </div>

              <h4 style={{ marginBottom: '1rem' }}>Style Preview</h4>
              <div style={{ 
                padding: '1.5rem', background: 'white', color: color, borderRadius: '8px', textAlign: 'center',
                fontWeight: textStyle.bold ? 'bold' : 'normal',
                fontStyle: textStyle.italic ? 'italic' : 'normal',
                textDecoration: textStyle.underline ? 'underline' : 'none',
                fontSize: textStyle.fontSize || '24pt', border: '3px solid var(--primary)',
                minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                Aa Bb Cc
              </div>
            </div>

            <div className="office-canvas" style={{ flex: 1, background: '#020617', padding: '3rem', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div ref={canvasRef} onClick={addAnnotation} style={{ width: '595px', height: '842px', background: 'white', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
                {annotations.filter(a => a.page === currentPage).map((a, idx) => (
                  <div key={a.id} 
                    style={{ 
                      position: 'absolute', left: a.x, top: a.y, color: a.color, 
                      fontWeight: a.style.bold ? 'bold' : 'normal', fontStyle: a.style.italic ? 'italic' : 'normal', textDecoration: a.style.underline ? 'underline' : 'none',
                      fontSize: a.style.fontSize || '18px', padding: '4px 8px', borderRadius: '4px'
                    }}>
                    {a.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPdf;
