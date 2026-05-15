import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { MonitorPlay } from 'lucide-react';

const WordToPpt = () => (
  <ConversionTool
    title="Word to PPT"
    description="Transform your Word document content into a PowerPoint presentation."
    accept=".doc,.docx"
    apiEndpoint="/api/word/word-to-ppt"
    fieldName="word"
    outputFilename={(name) => name.replace(/\.docx?$/i, '.pptx')}
    accentColor="#2563eb"
    maxMB={20}
    icon={<MonitorPlay size={48} color="#2563eb" />}
  />
);

export default WordToPpt;
