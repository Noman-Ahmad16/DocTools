import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { FileText } from 'lucide-react';

const PptToWord = () => (
  <ConversionTool
    title="PPT to Word"
    description="Export slide content from your presentation into a Word document."
    accept=".ppt,.pptx"
    apiEndpoint="/api/ppt/ppt-to-word"
    fieldName="ppt"
    outputFilename={(name) => name.replace(/\.pptx?$/i, '.docx')}
    accentColor="#f97316"
    maxMB={50}
    icon={<FileText size={48} color="#f97316" />}
  />
);

export default PptToWord;
