import React from 'react';
import PptEditor from '../../components/PptEditor';

const CreatePpt = () => {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>PowerPoint Designer</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Create professional presentations with our advanced visual editor.</p>
      </div>
      <PptEditor />
    </div>
  );
};

export default CreatePpt;
