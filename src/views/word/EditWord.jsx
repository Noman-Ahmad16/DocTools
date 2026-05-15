import React, { useState, useRef, useEffect } from 'react';
import OfficeToolbar from '../../components/OfficeToolbar';

const EditWord = () => {
  const [title, setTitle] = useState('Untitled Document');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStates, setActiveStates] = useState({ bold: false, italic: false, underline: false, align: 'left', fontSize: '12pt', fontColor: '#000000', bgColor: 'transparent' });
  const editorRef = useRef(null);

  const updateActiveStates = () => {
    // Only update states from the document if the user hasn't manually toggled something recently
    // Or we can just sync it normally. But the user wants it to be "Sticky".
    setActiveStates(prev => ({
      ...prev,
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      align: document.queryCommandState('justifyCenter') ? 'center' : 
             document.queryCommandState('justifyRight') ? 'right' : 'left',
      fontColor: document.queryCommandValue('foreColor') || prev.fontColor,
      bgColor: document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor') || 'transparent'
    }));
  };

  const handleAction = (type, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      let cmd = type;
      if (type === 'fontColor') cmd = 'foreColor';
      if (type === 'bgColor') cmd = 'hiliteColor';
      
      if (type === 'bgColor') {
        document.execCommand('hiliteColor', false, val);
        document.execCommand('backColor', false, val);
      } else {
        document.execCommand(cmd, false, val);
      }
      setActiveStates(prev => ({ ...prev, [type]: val !== null ? val : !prev[type] }));
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
          // For next typing, insert a span and move cursor inside
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

  const handleFontColor = (color) => {
    handleAction('foreColor', color);
  };

  const handleKeyDown = (e) => {
    // If Enter or Tab is pressed, we want to ensure styles are preserved
    if (e.key === 'Enter' || e.key === 'Tab') {
      // Small timeout to let the browser create the new line, then re-apply active styles
      setTimeout(() => {
        if (activeStates.bold) document.execCommand('bold', false, null);
        if (activeStates.italic) document.execCommand('italic', false, null);
        if (activeStates.underline) document.execCommand('underline', false, null);
        document.execCommand('foreColor', false, activeStates.fontColor);
        document.execCommand('hiliteColor', false, activeStates.bgColor);
      }, 10);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    let content = editorRef.current?.innerHTML || '';
    
    // Strip HTML tags because backend docx generator does not parse raw HTML
    const stripHtml = (html) => {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };
    
    content = stripHtml(content);
    
    try {
      const response = await fetch('/api/document/create-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.docx`;
      a.click();
    } catch (err) { alert('Download failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1000px' }}>
      <div style={{ background: '#1e293b', border: '1px solid var(--surface-border)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '600px' }}>
        
        <OfficeToolbar 
          title={title} 
          onDownload={handleDownload} 
          onImport={(e) => {
            const file = e.target.files[0];
            if (file) {
              setTitle(file.name.split('.')[0]);
              const reader = new FileReader();
              reader.onload = (re) => { if (editorRef.current) editorRef.current.innerHTML = re.target.result; };
              reader.readAsText(file);
            }
          }}
          onFontSize={(s) => handleAction('fontSize', s)}
          onFontColor={(c) => handleAction('fontColor', c)}
          onBgColor={(c) => handleAction('bgColor', c)}
          activeStates={activeStates}
          type="word" 
          isLoading={isLoading}
          onBold={() => handleAction('bold')}
          onItalic={() => handleAction('italic')}
          onUnderline={() => handleAction('underline')}
          onAlign={(align) => handleAction(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`)}
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
            Start typing your professional document here...
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWord;
