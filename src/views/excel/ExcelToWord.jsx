import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { FileText } from 'lucide-react';

const ExcelToWord = () => (
  <ConversionTool
    title="Excel to Word"
    description="Convert your Excel data tables into a Microsoft Word document."
    accept=".xls,.xlsx"
    apiEndpoint="/api/excel/excel-to-word"
    fieldName="excel"
    outputFilename={(name) => name.replace(/\.xlsx?$/i, '.docx')}
    accentColor="#10b981"
    maxMB={20}
    icon={<FileText size={48} color="#10b981" />}
  />
);

export default ExcelToWord;
