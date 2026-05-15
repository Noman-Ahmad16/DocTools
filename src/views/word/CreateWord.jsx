import React from 'react';
import EditWord from './EditWord';

const CreateWord = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Word Designer</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Write and format professional documents instantly.</p>
      </div>
      <EditWord />
    </div>
  );
};

export default CreateWord;
