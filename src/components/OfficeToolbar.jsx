import React from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Type, Image as ImageIcon, Save, Download, Share2, FolderOpen, Grid, Sparkles, ChevronDown, Palette, PaintBucket } from 'lucide-react';

const OfficeToolbar = ({ 
  title, 
  onDownload, 
  onImport,
  onBold, 
  onItalic, 
  onUnderline, 
  onAlign, 
  onInsertImage,
  onThemeChange,
  onFontSize,
  onFontColor,
  onBgColor,
  activeStates = { bold: false, italic: false, underline: false, align: 'left', fontSize: '12pt', fontColor: '#000000', bgColor: 'transparent' },
  type = 'word',
  isLoading = false 
}) => {
  const handlePreventFocus = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    if (callback) callback();
  };

  const getBtnStyle = (isActive) => ({
    width: '36px', 
    height: '36px',
    background: isActive ? 'white' : 'transparent',
    border: isActive ? 'none' : '1px solid transparent',
    color: isActive ? '#1e293b' : 'var(--text-secondary)',
    borderRadius: '8px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: isActive ? '0 4px 15px rgba(255,255,255,0.3)' : 'none',
    transform: isActive ? 'scale(1.05)' : 'scale(1)'
  });

  const fontSizes = ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt', '48pt', '64pt', '72pt', '100pt'];

  return (
    <div className="office-ribbon" style={{ 
      background: 'rgba(30, 41, 59, 0.98)', 
      backdropFilter: 'blur(30px)', 
      borderBottom: '2px solid var(--surface-border)', 
      padding: '0.75rem 1.5rem', 
      display: 'flex', 
      alignItems: 'center', 
      position: 'relative', 
      zIndex: 50, 
      overflowX: 'auto', 
      whiteSpace: 'nowrap', 
      WebkitOverflowScrolling: 'touch', 
      minHeight: '64px',
      gap: '1rem'
    }}>
      {/* App Icon & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <div style={{ 
          width: '36px', height: '36px', 
          background: type === 'word' ? '#2b579a' : type === 'ppt' ? '#b7472a' : '#217346', 
          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)', fontSize: '1.1rem'
        }}>
          {type === 'word' ? 'W' : type === 'ppt' ? 'P' : 'X'}
        </div>
        <div className="toolbar-title-box" style={{ display: 'flex', flexDirection: 'column' }}>
           <span style={{ fontWeight: '700', color: 'white', fontSize: '0.95rem', lineHeight: '1' }}>{title}</span>
           <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>DocTools Pro Suite</span>
        </div>
      </div>

      {/* Main Ribbon Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <label className="office-ribbon-tab" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
          <FolderOpen size={14} style={{ marginRight: '6px' }}/> File
          <input type="file" hidden onChange={onImport} accept={type === 'word' ? '.docx,.txt' : type === 'ppt' ? '.pptx' : '.xlsx'} />
        </label>
        <div className="office-ribbon-tab active">Home</div>
        <div className="office-ribbon-tab" onMouseDown={(e) => handlePreventFocus(e, onInsertImage)}>Insert</div>
        <div className="office-ribbon-tab" onMouseDown={(e) => handlePreventFocus(e, onThemeChange)}>Design</div>
      </div>

      {/* Formatting Tools */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '12px', flexShrink: 0 }}>
        
        {/* Font Size Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0 0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'white', marginRight: '0.25rem' }}>{activeStates.fontSize || '12pt'}</span>
          <select 
            onChange={(e) => onFontSize(e.target.value)}
            value={activeStates.fontSize || '12pt'}
            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
          >
            {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={12} color="var(--text-secondary)" />
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

        <button onMouseDown={(e) => handlePreventFocus(e, onBold)} title="Bold" style={getBtnStyle(activeStates.bold)}><Bold size={18}/></button>
        <button onMouseDown={(e) => handlePreventFocus(e, onItalic)} title="Italic" style={getBtnStyle(activeStates.italic)}><Italic size={18}/></button>
        <button onMouseDown={(e) => handlePreventFocus(e, onUnderline)} title="Underline" style={getBtnStyle(activeStates.underline)}><Underline size={18}/></button>
        
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

        {/* Font Color Picker */}
        <div style={{ position: 'relative' }}>
          <button onMouseDown={(e) => e.preventDefault()} title="Font Color" style={{ ...getBtnStyle(false), position: 'relative' }}>
            <Palette size={18} color={activeStates.fontColor || 'white'} />
            <input 
              type="color" 
              value={activeStates.fontColor || '#ffffff'} 
              onInput={(e) => onFontColor(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
            />
          </button>
          <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '2px', background: activeStates.fontColor || 'white' }} />
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

        {/* Background Color Picker */}
        <div style={{ position: 'relative' }}>
          <button onMouseDown={(e) => e.preventDefault()} title="Background Color" style={{ ...getBtnStyle(false), position: 'relative' }}>
            <PaintBucket size={18} color={activeStates.bgColor && activeStates.bgColor !== 'transparent' ? activeStates.bgColor : 'white'} />
            <input 
              type="color" 
              value={activeStates.bgColor && activeStates.bgColor !== 'transparent' ? activeStates.bgColor : '#ffffff'} 
              onInput={(e) => onBgColor(e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
            />
          </button>
          <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '2px', background: activeStates.bgColor || 'transparent' }} />
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
        
        <button onMouseDown={(e) => handlePreventFocus(e, () => onAlign('left'))} title="Align Left" style={getBtnStyle(activeStates.align === 'left')}><AlignLeft size={18}/></button>
        <button onMouseDown={(e) => handlePreventFocus(e, () => onAlign('center'))} title="Align Center" style={getBtnStyle(activeStates.align === 'center')}><AlignCenter size={18}/></button>
        <button onMouseDown={(e) => handlePreventFocus(e, () => onAlign('right'))} title="Align Right" style={getBtnStyle(activeStates.align === 'right')}><AlignRight size={18}/></button>
      </div>

      <div style={{ flex: 1, minWidth: '20px' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, paddingRight: '0.5rem' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: title, text: 'Check out this document', url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
        >
          <Share2 size={16}/> <span>Share</span>
        </button>
        <button className="btn btn-primary" onClick={onDownload} disabled={isLoading} style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', background: type === 'word' ? '#2b579a' : type === 'ppt' ? '#b7472a' : '#217346', fontWeight: '700', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isLoading ? 'Exporting...' : <><Download size={16}/> <span>Export</span></>}
        </button>
      </div>
    </div>

  );
};

export default OfficeToolbar;
