import React from 'react';
import { useLocation } from 'react-router-dom';

const ToolPlaceholder = () => {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }} className="text-gradient">
          Tool in Development
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The tool for <strong>{path}</strong> is currently being built and will be available soon.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={() => window.history.back()} className="btn btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolPlaceholder;
