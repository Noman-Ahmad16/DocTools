import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Image as ImageIcon } from 'lucide-react';

const PptToImage = () => (
  <ConversionTool
    title="PPT to Image"
    description="Export each slide of your presentation as a separate high-quality image."
    accept=".ppt,.pptx"
    apiEndpoint="/api/ppt/ppt-to-image"
    fieldName="ppt"
    outputFilename={(name) => name.replace(/\.pptx?$/i, '.zip')}
    accentColor="#f97316"
    maxMB={50}
    icon={<ImageIcon size={48} color="#f97316" />}
  />
);

export default PptToImage;
