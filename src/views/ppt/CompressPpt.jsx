import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Minimize2 } from 'lucide-react';

const CompressPpt = () => (
  <ConversionTool
    title="Compress PPT"
    description="Optimize and reduce the file size of your PowerPoint presentation."
    accept=".ppt,.pptx"
    apiEndpoint="/api/ppt/compress"
    fieldName="ppt"
    outputFilename={(name) => 'compressed_' + name}
    accentColor="#f97316"
    maxMB={50}
    icon={<Minimize2 size={48} color="#f97316" />}
  />
);

export default CompressPpt;
