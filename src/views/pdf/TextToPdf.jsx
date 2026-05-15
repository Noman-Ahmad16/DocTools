import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { FileText, Download } from 'lucide-react';

const TextToPdf = () => {
  const [text, setText] = useState('');

  const generatePdf = () => {
    if (!text.trim()) return;
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Split text into lines that fit within the page width
    const lines = doc.splitTextToSize(text, maxLineWidth);
    
    let y = margin + 10; // start slightly lower
    const pageHeight = doc.internal.pageSize.getHeight();
    
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin + 10;
      }
      doc.text(lines[i], margin, y);
      y += 6; // line height
    }
    
    doc.save('DocTools_Text.pdf');
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FileText size={40} color="#ec4899" />
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Text to PDF</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Convert your text into a clean PDF document.</p>
        </div>
      </div>
      
      <div className="glass-card">
        <textarea 
          style={{
            width: '100%',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--surface-border)',
            borderRadius: '0.5rem',
            padding: '1rem',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            resize: 'vertical',
            marginBottom: '1.5rem',
            fontFamily: 'inherit'
          }}
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <button 
          className="btn btn-primary" 
          onClick={generatePdf}
          disabled={!text.trim()}
          style={{ width: '100%', opacity: !text.trim() ? 0.5 : 1, cursor: !text.trim() ? 'not-allowed' : 'pointer' }}
        >
          <Download size={20} />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default TextToPdf;
