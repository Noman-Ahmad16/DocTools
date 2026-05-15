import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Table } from 'lucide-react';

const WordToExcel = () => (
  <ConversionTool
    title="Word to Excel"
    description="Extract lists or tables from your Word document into an Excel spreadsheet."
    accept=".doc,.docx"
    apiEndpoint="/api/word/word-to-excel"
    fieldName="word"
    outputFilename={(name) => name.replace(/\.docx?$/i, '.xlsx')}
    accentColor="#2563eb"
    maxMB={20}
    icon={<Table size={48} color="#2563eb" />}
  />
);

export default WordToExcel;
