import React from 'react';
import EditExcel from './EditExcel';

const CreateExcel = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Spreadsheet Designer</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Build and export high-quality spreadsheets with ease.</p>
      </div>
      <EditExcel />
    </div>
  );
};

export default CreateExcel;
