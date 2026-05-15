import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Table } from 'lucide-react';

const ExcelToPdf = () => (
  <ConversionTool
    title="Excel to PDF"
    description="Convert your Excel spreadsheet (.xlsx) to PDF format."
    accept=".xls,.xlsx"
    apiEndpoint="/api/excel/excel-to-pdf"
    fieldName="excel"
    outputFilename={(name) => name.replace(/\.xlsx?$/i, '.pdf')}
    accentColor="#22c55e"
    maxMB={20}
    icon={<Table size={48} color="#22c55e" />}
  />
);

export default ExcelToPdf;
