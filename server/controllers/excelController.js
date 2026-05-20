const ExcelJS = require('exceljs');
const docx = require('docx');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

// PDF → Excel
exports.pdfToExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    const pdfBytes = await fs.readFile(req.file.path);
    const parser = new PDFParse({ data: pdfBytes });
    const pdfData = await parser.getText();
    const lines = pdfData.text.split('\n').filter(l => l.trim());
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Extracted Data');
    sheet.addRow(['#', 'Content']);
    sheet.getRow(1).font = { bold: true };
    lines.forEach((line, i) => sheet.addRow([i + 1, line.trim()]));
    const buffer = await workbook.xlsx.writeBuffer();
    const outName = req.file.originalname.replace(/\.pdf$/i, '.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert PDF to Excel' });
  }
};

// Excel → PDF
exports.excelToPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Excel file uploaded' });
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    
    const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    let page = pdfDoc.addPage([595, 842]);
    let y = 800;
    
    workbook.eachSheet(sheet => {
      if (y < 100) { page = pdfDoc.addPage(); y = 800; }
      page.drawText(`Sheet: ${sheet.name}`, { x: 50, y, size: 16, font, color: rgb(0, 0, 0) });
      y -= 30;
      
      sheet.eachRow((row, rowNumber) => {
        if (y < 50) { page = pdfDoc.addPage(); y = 800; }
        const rowData = row.values.slice(1).join(' | ');
        page.drawText((rowData || ' ').substring(0, 90), { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        y -= 15;
      });
      y -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    const outName = req.file.originalname.replace(/\.xlsx?$/i, '.pdf');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert Excel to PDF' });
  }
};

// Excel → Word
exports.excelToWord = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Excel file uploaded' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const rows = [];
    workbook.eachSheet(sheet => {
      sheet.eachRow(row => {
        rows.push(row.values.slice(1).join(' | '));
      });
    });
    const doc = new docx.Document({
      sections: [{
        children: rows.map(row => new docx.Paragraph({ children: [new docx.TextRun(row)] }))
      }]
    });
    const buffer = await docx.Packer.toBuffer(doc);
    const outName = req.file.originalname.replace(/\.xlsx?$/i, '.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert Excel to Word' });
  }
};

// Word → Excel
exports.wordToExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Word file uploaded' });
    const result = await mammoth.extractRawText({ path: req.file.path });
    const lines = result.value.split('\n').filter(l => l.trim());
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');
    sheet.addRow(['#', 'Content']);
    sheet.getRow(1).font = { bold: true };
    lines.forEach((line, i) => sheet.addRow([i + 1, line.trim()]));
    const buffer = await workbook.xlsx.writeBuffer();
    const outName = req.file.originalname.replace(/\.docx?$/i, '.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert Word to Excel' });
  }
};

// Compress Excel
exports.compressExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Excel file uploaded' });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const buffer = await workbook.xlsx.writeBuffer();
    const outName = 'compressed_' + req.file.originalname;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compress Excel' });
  }
};
