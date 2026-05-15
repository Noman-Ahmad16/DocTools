import React from 'react';
import { Layout, Briefcase, GraduationCap, Palette, Zap, Star } from 'lucide-react';

const PptTemplates = () => {
  const categories = [
    { id: 'business', name: 'Business', icon: <Briefcase/>, color: '#3b82f6' },
    { id: 'education', name: 'Education', icon: <GraduationCap/>, color: '#10b981' },
    { id: 'creative', name: 'Creative', icon: <Palette/>, color: '#f43f5e' },
    { id: 'minimal', name: 'Minimal', icon: <Layout/>, color: '#6366f1' },
    { id: 'professional', name: 'Professional', icon: <Star/>, color: '#f59e0b' },
    { id: 'colorful', name: 'Colorful', icon: <Zap/>, color: '#ec4899' }
  ];

  const handleDownload = async (cat) => {
    try {
      const response = await fetch('/api/document/create-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `${cat.name} Template`, 
          slides: [`Overview of ${cat.name}`, `Key Features of ${cat.name} Template`, `Thank you for choosing DocTools!`]
        })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cat.id}_template.pptx`;
      a.click();
    } catch (err) { alert('Download failed'); }
  };

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>PPT Templates</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Download professional, ready-to-use presentation templates for every occasion.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {categories.map(cat => (
          <div key={cat.id} className="glass-card tool-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '1.5rem', background: `${cat.color}15`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              {React.cloneElement(cat.icon, { size: 40 })}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{cat.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Premium {cat.name.toLowerCase()} templates with professional slides.</p>
            <button className="btn btn-primary" onClick={() => handleDownload(cat)} style={{ width: '100%', background: cat.color }}>Download Template</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PptTemplates;
