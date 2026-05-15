import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { MonitorPlay } from 'lucide-react';

const PdfToPpt = () => (
  <ConversionTool
    title="PDF to PPT"
    description="Convert your PDF pages into slides for a PowerPoint presentation (.pptx)."
    accept=".pdf"
    apiEndpoint="/api/ppt/pdf-to-ppt"
    fieldName="pdf"
    outputFilename={(name) => name.replace(/\.pdf$/i, '.pptx')}
    accentColor="#f97316"
    maxMB={50}
    icon={<MonitorPlay size={48} color="#f97316" />}
  />
);

export default PdfToPpt;
