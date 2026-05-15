import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Image as ImageIcon } from 'lucide-react';

const PdfToImage = () => (
  <ConversionTool
    title="PDF to Image"
    description="Export each page of your PDF as a separate JPG image."
    accept=".pdf"
    apiEndpoint="/api/pdf/to-image"
    fieldName="pdf"
    outputFilename={(name) => name.replace(/\.pdf$/i, '.zip')}
    accentColor="#e11d48"
    maxMB={50}
    icon={<ImageIcon size={48} color="#e11d48" />}
  />
);

export default PdfToImage;
