import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { AlignLeft } from 'lucide-react';

const WordToPdf = () => (
  <ConversionTool
    title="Word to PDF"
    description="Convert your .docx Word document to a PDF file instantly."
    accept=".doc,.docx"
    apiEndpoint="/api/pdf/word-to-pdf"
    fieldName="word"
    outputFilename={(name) => name.replace(/\.docx?$/i, '.pdf')}
    accentColor="#3b82f6"
    maxMB={20}
    icon={<AlignLeft size={48} color="#3b82f6" />}
  />
);

export default WordToPdf;
