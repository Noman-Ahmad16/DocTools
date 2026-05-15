import React from 'react';
import PptEditor from '../../components/PptEditor';

const EditPpt = () => {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Edit Presentation</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Modify and refine your PowerPoint slides with professional tools.</p>
      </div>
      <PptEditor />
    </div>
  );
};

export default EditPpt;
