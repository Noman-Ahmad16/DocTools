import React from 'react';
import { 
  FileText, Layers, Minimize2, FilePlus, Edit, Lock, Unlock, Type, 
  Image as ImageIcon, FileImage, FileInput, MonitorPlay, LayoutTemplate, 
  AlignLeft, Table, Crop, Camera, ScanLine, ImagePlus, SlidersHorizontal, Search
} from 'lucide-react';

export const toolCategories = [
  {
    name: 'PDF Tools',
    id: 'pdf-tools',
    tools: [
      { id: 'merge-pdf', title: 'Merge PDF', description: 'Combine multiple PDFs into one', icon: <Layers size={32} color="#6366f1" />, to: '/pdf/merge' },
      { id: 'split-pdf', title: 'Split PDF', description: 'Split PDF into separate pages/files', icon: <FileText size={32} color="#a855f7" />, to: '/pdf/split' },
      { id: 'compress-pdf', title: 'Compress PDF', description: 'Reduce file size', icon: <Minimize2 size={32} color="#ec4899" />, to: '/pdf/compress' },
      { id: 'create-pdf', title: 'Create PDF', description: 'Build new PDF from scratch', icon: <FilePlus size={32} color="#14b8a6" />, to: '/pdf/create' },
      { id: 'edit-pdf', title: 'Edit PDF', description: 'Add text, highlight, annotate', icon: <Edit size={32} color="#f59e0b" />, to: '/pdf/edit' },
      { id: 'lock-pdf', title: 'Lock PDF', description: 'Password protect PDF', icon: <Lock size={32} color="#ef4444" />, to: '/pdf/lock' },
      { id: 'unlock-pdf', title: 'Unlock PDF', description: 'Remove PDF password', icon: <Unlock size={32} color="#22c55e" />, to: '/pdf/unlock' },
      { id: 'text-to-pdf', title: 'Text to PDF', description: 'Convert typed/pasted text to PDF', icon: <Type size={32} color="#3b82f6" />, to: '/pdf/text-to-pdf' },
      { id: 'image-to-pdf', title: 'Image to PDF', description: 'Convert JPG/PNG to PDF', icon: <ImageIcon size={32} color="#6366f1" />, to: '/scanner/image-to-pdf' },
      { id: 'pdf-to-image', title: 'PDF to Image', description: 'Export PDF pages as JPG/PNG', icon: <FileImage size={32} color="#a855f7" />, to: '/pdf/to-image' },
      { id: 'pdf-to-word', title: 'PDF to Word', description: 'Convert PDF to editable .docx', icon: <AlignLeft size={32} color="#3b82f6" />, to: '/pdf/to-word' },
      { id: 'pdf-to-ppt', title: 'PDF to PPT', description: 'Convert PDF to .pptx', icon: <MonitorPlay size={32} color="#f97316" />, to: '/pdf/to-ppt' },
      { id: 'pdf-to-excel', title: 'PDF to Excel', description: 'Convert PDF tables to .xlsx', icon: <Table size={32} color="#22c55e" />, to: '/pdf/to-excel' },
      { id: 'word-to-pdf', title: 'Word to PDF', description: 'Convert .docx to PDF', icon: <FileInput size={32} color="#3b82f6" />, to: '/pdf/word-to-pdf' },
      { id: 'ppt-to-pdf', title: 'PPT to PDF', description: 'Convert .pptx to PDF', icon: <FileInput size={32} color="#f97316" />, to: '/pdf/ppt-to-pdf' },
      { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Convert .xlsx to PDF', icon: <FileInput size={32} color="#22c55e" />, to: '/pdf/excel-to-pdf' }
    ]
  },
  {
    name: 'PPT Tools',
    id: 'ppt-tools',
    tools: [
      { id: 'create-ppt', title: 'Create PPT', description: 'Build new presentation with templates', icon: <FilePlus size={32} color="#f97316" />, to: '/ppt/create' },
      { id: 'edit-ppt', title: 'Edit PPT', description: 'Edit slides (font, colors, background)', icon: <Edit size={32} color="#f97316" />, to: '/ppt/edit' },
      { id: 'compress-ppt', title: 'Compress PPT', description: 'Reduce file size', icon: <Minimize2 size={32} color="#f97316" />, to: '/ppt/compress' },
      { id: 'ppt-to-pdf-alias', title: 'PPT to PDF', description: 'Convert to PDF', icon: <FileInput size={32} color="#f97316" />, to: '/pdf/ppt-to-pdf' },
      { id: 'ppt-to-word', title: 'PPT to Word', description: 'Convert slides to Word', icon: <AlignLeft size={32} color="#f97316" />, to: '/ppt/to-word' },
      { id: 'ppt-to-image', title: 'PPT to Image', description: 'Export slides as images', icon: <FileImage size={32} color="#f97316" />, to: '/ppt/to-image' },
      { id: 'pdf-to-ppt-alias', title: 'PDF to PPT', description: 'Convert PDF to presentation', icon: <MonitorPlay size={32} color="#f97316" />, to: '/pdf/to-ppt' }
    ]
  },
  {
    name: 'Word Tools',
    id: 'word-tools',
    tools: [
      { id: 'create-word', title: 'Create Word', description: 'Build new .docx document', icon: <FilePlus size={32} color="#3b82f6" />, to: '/word/create' },
      { id: 'edit-word', title: 'Edit Word', description: 'Edit and format document', icon: <Edit size={32} color="#3b82f6" />, to: '/word/edit' },
      { id: 'compress-word', title: 'Compress Word', description: 'Reduce file size', icon: <Minimize2 size={32} color="#3b82f6" />, to: '/word/compress' },
      { id: 'word-to-pdf-alias', title: 'Word to PDF', description: 'Convert to PDF', icon: <FileInput size={32} color="#3b82f6" />, to: '/pdf/word-to-pdf' },
      { id: 'word-to-ppt', title: 'Word to PPT', description: 'Convert to presentation', icon: <MonitorPlay size={32} color="#3b82f6" />, to: '/word/to-ppt' },
      { id: 'word-to-excel', title: 'Word to Excel', description: 'Convert tables to Excel', icon: <Table size={32} color="#3b82f6" />, to: '/word/to-excel' },
      { id: 'pdf-to-word-alias', title: 'PDF to Word', description: 'Convert PDF to editable Word', icon: <AlignLeft size={32} color="#3b82f6" />, to: '/pdf/to-word' }
    ]
  },
  {
    name: 'Excel Tools',
    id: 'excel-tools',
    tools: [
      { id: 'create-excel', title: 'Create Excel', description: 'Build new spreadsheet', icon: <FilePlus size={32} color="#22c55e" />, to: '/excel/create' },
      { id: 'edit-excel', title: 'Edit Excel', description: 'Edit data and formatting', icon: <Edit size={32} color="#22c55e" />, to: '/excel/edit' },
      { id: 'compress-excel', title: 'Compress Excel', description: 'Reduce file size', icon: <Minimize2 size={32} color="#22c55e" />, to: '/excel/compress' },
      { id: 'excel-to-pdf-alias', title: 'Excel to PDF', description: 'Convert to PDF', icon: <FileInput size={32} color="#22c55e" />, to: '/pdf/excel-to-pdf' },
      { id: 'excel-to-word', title: 'Excel to Word', description: 'Convert to Word document', icon: <AlignLeft size={32} color="#22c55e" />, to: '/excel/to-word' },
      { id: 'pdf-to-excel-alias', title: 'PDF to Excel', description: 'Convert PDF tables to Excel', icon: <Table size={32} color="#22c55e" />, to: '/pdf/to-excel' },
      { id: 'word-to-excel-alias', title: 'Word to Excel', description: 'Convert Word tables to Excel', icon: <Table size={32} color="#22c55e" />, to: '/word/to-excel' }
    ]
  },
  {
    name: 'Image Tools',
    id: 'image-tools',
    tools: [
      { id: 'image-to-pdf-alias', title: 'Image to PDF', description: 'Convert images to PDF', icon: <ImageIcon size={32} color="#ec4899" />, to: '/scanner/image-to-pdf' },
      { id: 'compress-image', title: 'Compress Image', description: 'Reduce image size', icon: <Minimize2 size={32} color="#ec4899" />, to: '/image/compress' },
      { id: 'convert-image', title: 'Convert Image', description: 'Change format (JPG/PNG/WEBP etc)', icon: <ImagePlus size={32} color="#ec4899" />, to: '/image/convert' },
      { id: 'resize-image', title: 'Resize Image', description: 'Change dimensions', icon: <Crop size={32} color="#ec4899" />, to: '/image/resize' },
      { id: 'image-to-word', title: 'Image to Word', description: 'Extract text from image (OCR)', icon: <AlignLeft size={32} color="#ec4899" />, to: '/image/ocr' }
    ]
  },
  {
    name: 'Scan Tools',
    id: 'scan-tools',
    tools: [
      { id: 'camera-scan', title: 'Camera Scan', description: 'Open camera with corner guide overlays', icon: <Camera size={32} color="#14b8a6" />, to: '/scan/camera' },
      { id: 'gallery-import', title: 'Gallery Import', description: 'Import from device gallery', icon: <ImagePlus size={32} color="#14b8a6" />, to: '/scan/gallery' },
      { id: 'auto-enhance', title: 'Auto Enhance', description: 'Brightness/Contrast sliders', icon: <SlidersHorizontal size={32} color="#14b8a6" />, to: '/scan/enhance' },
      { id: 'scan-ocr', title: 'Scan + OCR', description: 'Extract text from scanned document', icon: <ScanLine size={32} color="#14b8a6" />, to: '/scan/ocr' }
    ]
  }
];

export const getAllTools = () => {
  return toolCategories.flatMap(category => category.tools);
};
