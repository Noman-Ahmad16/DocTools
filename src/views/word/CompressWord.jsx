import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Minimize2 } from 'lucide-react';

const CompressWord = () => (
  <ConversionTool
    title="Compress Word"
    description="Reduce the file size of your Microsoft Word document while maintaining quality."
    accept=".doc,.docx"
    apiEndpoint="/api/word/compress"
    fieldName="word"
    outputFilename={(name) => 'compressed_' + name}
    accentColor="#2563eb"
    maxMB={20}
    icon={<Minimize2 size={48} color="#2563eb" />}
  />
);

export default CompressWord;
