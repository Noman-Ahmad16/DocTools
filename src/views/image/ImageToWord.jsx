import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Type } from 'lucide-react';

const ImageToWord = () => (
  <ConversionTool
    title="Image to Word (OCR)"
    description="Extract text from your images using OCR and save it as an editable Word document."
    accept="image/*"
    apiEndpoint="/api/image/ocr"
    fieldName="image"
    outputFilename={(name) => name.split('.')[0] + '_extracted.docx'}
    accentColor="#6366f1"
    maxMB={10}
    icon={<Type size={48} color="#6366f1" />}
  />
);

export default ImageToWord;
