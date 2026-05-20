const mammoth = require('mammoth');
const docx = require('docx');
const ExcelJS = require('exceljs');
const pptxgen = require('pptxgenjs');
const { PDFParse } = require('pdf-parse');
const fs = require('fs').promises;

// PDF → Word
exports.pdfToWord = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    const pdfBytes = await fs.readFile(req.file.path);
    const parser = new PDFParse({ data: pdfBytes });
    const pdfData = await parser.getText();
    const text = pdfData.text;
    const lines = text.split('\n').filter(l => l.trim());
    const doc = new docx.Document({
      sections: [{
        children: lines.map(line =>
          new docx.Paragraph({ children: [new docx.TextRun(line.trim())] })
        )
      }]
    });
    const buffer = await docx.Packer.toBuffer(doc);
    const outName = req.file.originalname.replace(/\.pdf$/i, '.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert PDF to Word' });
  }
};

// Word → PPT
exports.wordToPpt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Word file uploaded' });
    const result = await mammoth.extractRawText({ path: req.file.path });
    const paragraphs = result.value.split('\n').filter(p => p.trim()).slice(0, 20);
    let pres = new pptxgen();
    const titleSlide = pres.addSlide();
    titleSlide.addText(paragraphs[0] || 'Presentation', { x: 0.5, y: 2, w: '90%', h: 1.5, fontSize: 32, bold: true, align: 'center', color: '363636' });
    for (let i = 1; i < paragraphs.length; i++) {
      const slide = pres.addSlide();
      slide.addText(paragraphs[i], { x: 0.5, y: 1.5, w: '90%', h: 3, fontSize: 22, align: 'left', color: '363636' });
    }
    const buffer = await pres.write({ outputType: 'nodebuffer' });
    const outName = req.file.originalname.replace(/\.docx?$/i, '.pptx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert Word to PPT' });
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
    lines.forEach((line, i) => {
      sheet.addRow([`Line ${i + 1}`, line.trim()]);
    });
    sheet.getRow(1).font = { bold: true };
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

// Compress Word (re-save)
exports.compressWord = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Word file uploaded' });
    const result = await mammoth.extractRawText({ path: req.file.path });
    const lines = result.value.split('\n').filter(l => l.trim());
    const doc = new docx.Document({
      sections: [{
        children: lines.map(line => new docx.Paragraph({ children: [new docx.TextRun(line)] }))
      }]
    });
    const buffer = await docx.Packer.toBuffer(doc);
    const outName = 'compressed_' + req.file.originalname;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compress Word file' });
  }
};
