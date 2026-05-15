import React from 'react';
import ConversionTool from '../../components/ConversionTool';
import { Minimize2 } from 'lucide-react';

const CompressExcel = () => (
  <ConversionTool
    title="Compress Excel"
    description="Reduce the size of your Excel files for easier sharing."
    accept=".xls,.xlsx"
    apiEndpoint="/api/excel/compress"
    fieldName="excel"
    outputFilename={(name) => 'compressed_' + name}
    accentColor="#10b981"
    maxMB={20}
    icon={<Minimize2 size={48} color="#10b981" />}
  />
);

export default CompressExcel;
