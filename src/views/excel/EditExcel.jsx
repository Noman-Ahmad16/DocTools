import React, { useState } from 'react';
import OfficeToolbar from '../../components/OfficeToolbar';
import { Plus } from 'lucide-react';

const EditExcel = () => {
  const [title, setTitle] = useState('New Spreadsheet');
  const [headers, setHeaders] = useState(['ID', 'Name', 'Category', 'Status', 'Date']);
  const [rows, setRows] = useState([
    ['1', 'Project Alpha', 'Development', 'Active', '2026-05-06'],
    ['2', 'Project Beta', 'Design', 'Pending', '2026-05-10']
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const [styles, setStyles] = useState({});
  const [persistentStyles, setPersistentStyles] = useState({ bold: false, italic: false, underline: false, fontSize: '12pt', fontColor: '#ffffff', bgColor: 'transparent' });
  const [tableTheme, setTableTheme] = useState({ bg: '#0f172a', headerBg: 'rgba(255,255,255,0.05)', textColor: '#f8fafc' });

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const payload = {
        title: title,
        data: [headers, ...rows]
      };
      const response = await fetch('/api/document/create-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate Excel file.');
    } finally {
      setIsLoading(false);
    }
  };

  const addRow = () => setRows([...rows, new Array(headers.length).fill('')]);
  const addColumn = () => {
    setHeaders([...headers, `Col ${headers.length + 1}`]);
    setRows(rows.map(row => [...row, '']));
  };

  const handleAction = (type, val = null) => {
    const value = val !== null ? val : !persistentStyles[type];
    setPersistentStyles(prev => ({ ...prev, [type]: value }));
    
    if (activeCell === null) return;
    const key = typeof activeCell === 'string' ? activeCell : `${activeCell.r}-${activeCell.c}`;
    
    setStyles(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { ...persistentStyles }), [type]: value }
    }));
  };

  const handleKeyDown = (e, ri, ci) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      // Carry over styles to the next cell
      const nextR = e.key === 'Enter' ? ri + 1 : ri;
      const nextC = e.key === 'Tab' ? ci + 1 : ci;
      
      if (nextR < rows.length && nextC < headers.length) {
        const nextKey = `${nextR}-${nextC}`;
        if (!styles[nextKey]) {
          setStyles(prev => ({
            ...prev,
            [nextKey]: { ...persistentStyles }
          }));
        }
      }
    }
  };

  const getActiveStyle = () => {
    if (activeCell === null) return persistentStyles;
    const key = typeof activeCell === 'string' ? activeCell : `${activeCell.r}-${activeCell.c}`;
    return { ...persistentStyles, ...(styles[key] || {}) };
  };

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1200px' }}>
      <div style={{ background: '#1e293b', border: '1px solid var(--surface-border)', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '800px' }}>
        
        <OfficeToolbar 
          title={title} onDownload={handleDownload} type="excel" isLoading={isLoading} 
          onBold={() => handleAction('bold')}
          onItalic={() => handleAction('italic')}
          onUnderline={() => handleAction('underline')}
          onFontSize={(s) => handleAction('fontSize', s)}
          onFontColor={(c) => handleAction('fontColor', c)}
          onBgColor={(c) => handleAction('bgColor', c)}
          activeStates={getActiveStyle()}
        />

        <div style={{ padding: '0.5rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={addRow} className="btn-icon-sm" title="Add Row" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <Plus size={18} /> <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>Add Row</span>
          </button>
          <button onClick={addColumn} className="btn-icon-sm" title="Add Column" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <Plus size={18} /> <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>Add Column</span>
          </button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Table Theme:</span>
          {['#0f172a', '#ffffff', '#1e293b', '#000000'].map(c => (
            <div key={c} onClick={() => setTableTheme({ ...tableTheme, bg: c, textColor: c === '#ffffff' ? '#0f172a' : '#f8fafc' })} 
                 style={{ width: '20px', height: '20px', background: c, borderRadius: '4px', cursor: 'pointer', border: tableTheme.bg === c ? '2px solid var(--primary)' : '1px solid #444' }} />
          ))}
        </div>

        <div style={{ flex: 1, padding: '1rem', background: tableTheme.bg, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', background: tableTheme.bg, borderRadius: '0.5rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ width: '40px', padding: '1rem', color: 'var(--text-secondary)' }}>#</th>
                {headers.map((h, i) => {
                  const s = styles[`h-${i}`] || {};
                  return (
                    <th key={i} style={{ padding: '0', borderRight: '1px solid var(--surface-border)', background: s.bgColor || 'rgba(255,255,255,0.05)' }}>
                      <input 
                        value={h}
                        onFocus={() => setActiveCell(`h-${i}`)}
                        onChange={(e) => {
                          const newHeaders = [...headers];
                          newHeaders[i] = e.target.value;
                          setHeaders(newHeaders);
                        }}
                        style={{ 
                          width: '100%', padding: '1rem', background: 'transparent', 
                          border: 'none', color: s.fontColor || '#22c55e', outline: 'none',
                          textAlign: 'center', fontWeight: s.bold ? 'bold' : 'bold', 
                          fontStyle: s.italic ? 'italic' : 'normal',
                          textDecoration: s.underline ? 'underline' : 'none',
                          fontSize: s.fontSize || '1rem'
                        }}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{ri + 1}</td>
                  {row.map((cell, ci) => {
                    const s = styles[`${ri}-${ci}`] || {};
                    return (
                      <td key={ci} style={{ padding: '0', borderRight: '1px solid var(--surface-border)' }}>
                        <input 
                          value={cell} 
                          onFocus={() => setActiveCell({ r: ri, c: ci })}
                          onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                          onChange={(e) => { const nr = [...rows]; nr[ri][ci] = e.target.value; setRows(nr); }}
                          style={{ 
                            width: '100%', padding: '0.75rem 1rem', background: s.bgColor || 'transparent', 
                            border: 'none', color: s.fontColor || tableTheme.textColor, outline: 'none',
                            fontWeight: (s.bold !== undefined ? s.bold : persistentStyles.bold) ? 'bold' : 'normal',
                            fontStyle: (s.italic !== undefined ? s.italic : persistentStyles.italic) ? 'italic' : 'normal',
                            textDecoration: (s.underline !== undefined ? s.underline : persistentStyles.underline) ? 'underline' : 'none',
                            fontSize: s.fontSize || persistentStyles.fontSize || '1rem', textAlign: 'center'
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EditExcel;
