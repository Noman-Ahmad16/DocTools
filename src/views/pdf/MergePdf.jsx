import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FilePlus, UploadCloud, Download, X } from 'lucide-react';

const MergePdf = () => {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DocTools_Merged.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error merging PDFs', error);
      alert('Failed to merge PDFs. Please try again.');
    }
    setIsMerging(false);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FilePlus size={40} color="#a855f7" />
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Merge PDF</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Combine multiple PDF files into one.</p>
        </div>
      </div>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <label className="drop-zone" style={{ display: 'block' }}>
          <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Select PDF files</h3>
          <p style={{ color: 'var(--text-secondary)' }}>or click here to browse</p>
          <input 
            type="file" 
            multiple 
            accept="application/pdf" 
            className="input-file" 
            onChange={handleFileChange}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Selected Files ({files.length})</h3>
          <ul style={{ marginBottom: '2rem' }}>
            {files.map((file, index) => (
              <li key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                marginBottom: '0.5rem',
                borderRadius: '0.5rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FilePlus size={16} /> {file.name}
                </span>
                <button 
                  onClick={() => removeFile(index)} 
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </li>
            ))}
          </ul>
          
          <button 
            className="btn btn-primary" 
            onClick={mergePdfs}
            disabled={files.length < 2 || isMerging}
            style={{ width: '100%', opacity: (files.length < 2 || isMerging) ? 0.5 : 1, cursor: (files.length < 2 || isMerging) ? 'not-allowed' : 'pointer' }}
          >
            {isMerging ? 'Merging...' : (
              <>
                <Download size={20} />
                Merge & Download PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MergePdf;
