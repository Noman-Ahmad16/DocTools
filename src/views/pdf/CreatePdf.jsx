import React, { useState, useRef, useEffect } from 'react';
import OfficeToolbar from '../../components/OfficeToolbar';

const CreatePdf = () => {
  const [title, setTitle] = useState('New Document');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStates, setActiveStates] = useState({ bold: false, italic: false, underline: false, align: 'left', fontSize: '12pt', fontColor: '#000000' });
  const editorRef = useRef(null);

  const updateActiveStates = () => {
    setActiveStates(prev => ({
      ...prev,
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      align: document.queryCommandState('justifyCenter') ? 'center' : 
             document.queryCommandState('justifyRight') ? 'right' : 'left',
      fontColor: document.queryCommandValue('foreColor') || prev.fontColor
    }));
  };

  const handleAction = (cmd, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, val);
      setActiveStates(prev => ({ ...prev, [cmd]: !prev[cmd] }));
    }
  };

  const handleFontSize = (size) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.toString().length > 0) {
          const span = document.createElement('span');
          span.style.fontSize = size;
          span.appendChild(range.extractContents());
          range.insertNode(span);
        } else {
          const span = document.createElement('span');
          span.style.fontSize = size;
          span.innerHTML = '&#8203;';
          range.insertNode(span);
          const newRange = document.createRange();
          newRange.setStart(span, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
      setActiveStates(prev => ({ ...prev, fontSize: size }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      setTimeout(() => {
        if (activeStates.bold) document.execCommand('bold', false, null);
        if (activeStates.italic) document.execCommand('italic', false, null);
        if (activeStates.underline) document.execCommand('underline', false, null);
        document.execCommand('foreColor', false, activeStates.fontColor);
      }, 10);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    const content = editorRef.current?.innerHTML || '';
    try {
      const response = await fetch('/api/pdf/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pdf`;
      a.click();
    } catch (err) { alert('Download failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1000px' }}>
      <div style={{ background: '#1e293b', border: '1px solid var(--surface-border)', borderRadius: '1.25rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '880px', boxShadow: '0 30px 70px rgba(0,0,0,0.5)' }}>
        
        <OfficeToolbar 
          title={title} onDownload={handleDownload} type="word" isLoading={isLoading}
          onBold={() => handleAction('bold')}
          onItalic={() => handleAction('italic')}
          onUnderline={() => handleAction('underline')}
          onFontSize={handleFontSize}
          onFontColor={(c) => handleAction('foreColor', c)}
          activeStates={activeStates}
        />
        
        <div className="office-canvas" style={{ padding: '40px', background: '#0f172a', overflowY: 'auto' }}>
          <div 
            ref={editorRef}
            contentEditable="true"
            suppressContentEditableWarning={true}
            onSelect={updateActiveStates}
            onKeyUp={updateActiveStates}
            onKeyDown={handleKeyDown}
            style={{ 
              width: '100%', maxWidth: '816px', background: 'white', color: '#1e293b', 
              padding: '96px', borderRadius: '4px', border: 'none', outline: 'none', 
              fontSize: activeStates.fontSize, lineHeight: '1.6', boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
              minHeight: '1056px', fontFamily: 'Arial, sans-serif', textAlign: 'left'
            }}
          >
            Start creating your professional PDF here...
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePdf;
