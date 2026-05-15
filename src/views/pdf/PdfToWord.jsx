import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { FileText } from 'lucide-react';

const PdfToWord = () => (
  <ConversionTool
    title="PDF to Word"
    description="Convert your PDF to an editable Microsoft Word document (.docx)."
    accept=".pdf"
    apiEndpoint="/api/word/pdf-to-word"
    fieldName="pdf"
    outputFilename={(name) => name.replace(/\.pdf$/i, '.docx')}
    accentColor="#2563eb"
    maxMB={50}
    icon={<FileText size={48} color="#2563eb" />}
  />
);

export default PdfToWord;
