import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { MonitorPlay } from 'lucide-react';

const PptToPdf = () => (
  <ConversionTool
    title="PPT to PDF"
    description="Convert your PowerPoint presentation (.pptx) to PDF format."
    accept=".ppt,.pptx"
    apiEndpoint="/api/ppt/ppt-to-pdf"
    fieldName="ppt"
    outputFilename={(name) => name.replace(/\.pptx?$/i, '.pdf')}
    accentColor="#f97316"
    maxMB={50}
    icon={<MonitorPlay size={48} color="#f97316" />}
  />
);

export default PptToPdf;
