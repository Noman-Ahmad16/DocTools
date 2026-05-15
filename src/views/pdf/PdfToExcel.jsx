import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Table } from 'lucide-react';

const PdfToExcel = () => (
  <ConversionTool
    title="PDF to Excel"
    description="Extract tables and data from your PDF into a Microsoft Excel spreadsheet (.xlsx)."
    accept=".pdf"
    apiEndpoint="/api/excel/pdf-to-excel"
    fieldName="pdf"
    outputFilename={(name) => name.replace(/\.pdf$/i, '.xlsx')}
    accentColor="#10b981"
    maxMB={50}
    icon={<Table size={48} color="#10b981" />}
  />
);

export default PdfToExcel;
