import React, { useState, useRef, useEffect, useCallback } from 'react';
import OfficeToolbar from './OfficeToolbar';
import { Plus, Trash2, Layout, Palette, Sparkles, CheckCircle2, Star, Zap, Copy, MonitorPlay } from 'lucide-react';

const SlideContentBlock = ({ initialHtml, onChange, onUpdateStates, style, slideId, onKeyDown }) => {
  const elRef = useRef(null);
  
  useEffect(() => {
    if (elRef.current && elRef.current.innerHTML !== initialHtml) {
      elRef.current.innerHTML = initialHtml;
    }
  }, [slideId]);

  return (
    <div
      ref={elRef}
      contentEditable="true"
      suppressContentEditableWarning={true}
      onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      onInput={(e) => onChange(e.currentTarget.innerHTML)}
      onKeyDown={onKeyDown}
      onSelect={onUpdateStates}
      onMouseUp={onUpdateStates}
      onKeyUp={onUpdateStates}
      style={style}
    />
  );
};

const PptEditor = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [isTemplateSelected, setIsTemplateSelected] = useState(false);
  const [slides, setSlides] = useState([
    { id: 1, title: 'Welcome to DocTools', content: 'Professional Presentation Generator', layout: 'title', theme: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStates, setActiveStates] = useState({ bold: false, italic: false, underline: false, align: 'left', fontSize: '24pt', fontColor: '#ffffff', bgColor: 'transparent' });
  const savedSelection = useRef(null);

  const activeSlide = slides[activeSlideIndex];

  const updateActiveStates = () => {
    saveSelection();
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

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      savedSelection.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
      
      // Force focus on the element containing the selection
      let node = savedSelection.current.startContainer;
      while (node && node.nodeType !== 1) { node = node.parentNode; }
      if (node && node.focus) node.focus();
    }
  };

  const handleAction = (type, val = null) => {
    restoreSelection();
    setTimeout(() => {
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
      saveSelection();
    }, 10);
  };

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          restoreSelection();
          setTimeout(() => {
            document.execCommand('insertImage', false, ev.target.result);
            saveSelection();
          }, 10);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleFontSize = (size) => {
    restoreSelection();
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
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
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
    try {
      // Strip HTML tags because pptxgenjs does not parse raw HTML
      const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };

      const cleanSlides = slides.map(s => {
        const title = stripHtml(s.title);
        const content = stripHtml(s.content);
        return `${title}\n\n${content}`;
      });

      const response = await fetch('/api/document/create-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: stripHtml(slides[0].title), slides: cleanSlides })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation_${Date.now()}.pptx`;
      a.click();
    } catch (err) { alert('Failed'); }
    finally { setIsLoading(false); }
  };

  const templates = [
    { name: 'Modern Business', color: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', textColor: '#f8fafc', icon: <Plus size={40} /> },
    { name: 'Creative Portfolio', color: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', textColor: '#ffffff', icon: <Palette size={40} /> },
    { name: 'Education Bright', color: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', textColor: '#0f172a', icon: <Plus size={40} /> },
    { name: 'Deep Space', color: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', textColor: '#6366f1', icon: <Sparkles size={40} /> },
    { name: 'Elegant Gold', color: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', textColor: '#f59e0b', icon: <Star size={40} /> },
    { name: 'Vibrant Pulse', color: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', textColor: '#ffffff', icon: <Zap size={40} /> }
  ];

  const selectTemplate = (temp) => {
    setSlides([
      { 
        id: 1, 
        title: 'New Presentation', 
        content: 'Add your professional content here...', 
        layout: 'title', 
        theme: temp.color 
      }
    ]);
    setIsTemplateSelected(true);
  };

  if (!isTemplateSelected) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Choose Template</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Start with a professionally designed layout for your presentation.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {templates.map(temp => (
            <div key={temp.name} className="glass-card" onClick={() => selectTemplate(temp)} style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}>
              <div style={{ height: '180px', background: temp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: temp.textColor }}>
                {temp.icon}
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ fontSize: '1.25rem' }}>{temp.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Premium slide layout</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const updateSlideContent = (field, value) => {
    const newSlides = [...slides];
    newSlides[activeSlideIndex][field] = value;
    setSlides(newSlides);
  };

  const addNewSlide = () => {
    const newId = Math.max(...slides.map(s => s.id), 0) + 1;
    const newSlide = { id: newId, title: 'New Slide', content: 'Click to add content', layout: 'content', theme: slides[0].theme };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const duplicateSlide = () => {
    const newId = Math.max(...slides.map(s => s.id), 0) + 1;
    const newSlide = { ...activeSlide, id: newId };
    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) {
      alert('You must have at least one slide.');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (activeSlideIndex >= newSlides.length) {
      setActiveSlideIndex(newSlides.length - 1);
    } else if (activeSlideIndex === index && index > 0) {
      setActiveSlideIndex(index - 1);
    }
  };


  return (
    <div className="ppt-editor-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', background: '#020617', border: '1px solid var(--surface-border)', borderRadius: '1rem', overflow: 'hidden' }}>
      <OfficeToolbar 
        title="Presentation" onDownload={handleDownload} type="ppt" isLoading={isLoading}
        onBold={() => handleAction('bold')} onItalic={() => handleAction('italic')} onUnderline={() => handleAction('underline')}
        onFontSize={handleFontSize} 
        onFontColor={(c) => handleAction('fontColor', c)}
        onBgColor={(c) => handleAction('bgColor', c)}
        onInsertImage={handleInsertImage}
        activeStates={activeStates}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar - Slide Thumbnails */}
        <div style={{ width: '220px', background: '#0f172a', borderRight: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column' }}>
          {/* Sidebar Toolbar */}
          <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={addNewSlide} title="New Slide" style={{ flex: 1, padding: '0.5rem', background: '#b7472a', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontWeight: 600, fontSize: '0.85rem' }}>
              <Plus size={16} /> New
            </button>
            <button onClick={duplicateSlide} title="Duplicate Slide" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Copy size={16} />
            </button>
            <button onClick={() => deleteSlide(activeSlideIndex)} title="Delete Slide" style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={16} />
            </button>
          </div>
          
          {/* Thumbnails List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {slides.map((slide, idx) => (
              <div 
                key={slide.id} 
                onClick={() => setActiveSlideIndex(idx)}
                style={{ 
                  display: 'flex', gap: '0.5rem', cursor: 'pointer', group: 'true' 
                }}
              >
                <div style={{ fontSize: '0.75rem', color: activeSlideIndex === idx ? '#b7472a' : 'var(--text-secondary)', fontWeight: 'bold', paddingTop: '0.25rem' }}>
                  {idx + 1}
                </div>
                <div style={{ 
                  flex: 1, aspectRatio: '16/9', borderRadius: '0.5rem', padding: '0.5rem',
                  background: slide.theme, position: 'relative', overflow: 'hidden',
                  border: activeSlideIndex === idx ? '2px solid #b7472a' : '2px solid transparent',
                  boxShadow: activeSlideIndex === idx ? '0 0 0 2px rgba(183, 71, 42, 0.3)' : '0 4px 6px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s'
                }}>
                  {/* Thumbnail Preview Content */}
                  <div style={{ 
                    transform: 'scale(0.15)', transformOrigin: 'top left', width: '666%', height: '666%',
                    color: slide.theme.includes('f8fafc') ? '#0f172a' : 'white',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>{slide.title.replace(/<[^>]+>/g, '') || 'Title'}</div>
                    <div style={{ fontSize: '2rem', opacity: 0.8, marginTop: '2rem' }}>{slide.content.replace(/<[^>]+>/g, '') || 'Content'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="editor-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#020617', overflow: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            {/* The Slide */}
            <div style={{ 
              width: '100%', maxWidth: '960px', aspectRatio: '16/9', 
              background: activeSlide.theme, borderRadius: '0.5rem', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)', 
              display: 'flex', flexDirection: 'column', padding: '5%', 
              color: activeSlide.theme.includes('f8fafc') ? '#0f172a' : 'white', 
              position: 'relative',
              textAlign: 'center',
              justifyContent: 'center',
              margin: 'auto'
            }}>
               <SlideContentBlock 
                 slideId={'title-' + activeSlide.id}
                 initialHtml={activeSlide.title}
                 onChange={(html) => updateSlideContent('title', html)}
                 onKeyDown={handleKeyDown} 
                 onUpdateStates={updateActiveStates} 
                 style={{ fontSize: '4.5rem', fontWeight: 'bold', outline: 'none', marginBottom: '1.5rem', minHeight: '1.2em', cursor: 'text' }}
               />
               <SlideContentBlock 
                 slideId={'content-' + activeSlide.id}
                 initialHtml={activeSlide.content}
                 onChange={(html) => updateSlideContent('content', html)}
                 onKeyDown={handleKeyDown} 
                 onUpdateStates={updateActiveStates} 
                 style={{ fontSize: '2rem', outline: 'none', opacity: 0.8, minHeight: '1.2em', cursor: 'text' }}
               />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer / Status Bar */}
      <div style={{ height: '32px', background: '#b7472a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', fontSize: '0.75rem', color: 'white', fontWeight: 500, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
          <span style={{ opacity: 0.8 }}>DocTools Presentation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: 0.9 }}>
             <MonitorPlay size={14} /> <span>Slide Show</span>
          </div>
          <span>English (US)</span>
        </div>
      </div>
    </div>
  );
};

export default PptEditor;
