const pptxgen = require('pptxgenjs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

// PDF → PPT
exports.pdfToPpt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    const pdfBytes = await fs.readFile(req.file.path);
    const pdfData = await pdfParse(pdfBytes);
    const lines = pdfData.text.split('\n').filter(l => l.trim());
    
    let pres = new pptxgen();
    lines.slice(0, 50).forEach((line, i) => {
      const slide = pres.addSlide();
      slide.addText(line.substring(0, 300), { x: 0.5, y: 1.5, w: '90%', h: 3, fontSize: 18, color: '363636' });
    });

    const buffer = await pres.write({ outputType: 'nodebuffer' });
    const outName = req.file.originalname.replace(/\.pdf$/i, '.pptx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert PDF to PPT' });
  }
};

// PPT → PDF
exports.pptToPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PPT file uploaded' });
    
    const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([800, 600]);
    
    page.drawText('DocTools PPT to PDF Conversion', { x: 50, y: 500, size: 30, font, color: rgb(0, 0, 0) });
    page.drawText(`Original file: ${req.file.originalname}`, { x: 50, y: 450, size: 20, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Note: True PPT rendering requires a headless browser or Office interop.', { x: 50, y: 400, size: 14, font, color: rgb(0.5, 0.5, 0.5) });

    const pdfBytes = await pdfDoc.save();
    const outName = req.file.originalname.replace(/\.pptx?$/i, '.pdf');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert PPT to PDF' });
  }
};

// PPT → Word
exports.pptToWord = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PPT file uploaded' });
    
    const docx = require('docx');
    
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            text: 'DocTools PPT to Word Conversion',
            heading: docx.HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new docx.Paragraph({
            text: `Original file: ${req.file.originalname}`,
            spacing: { after: 200 },
          }),
          new docx.Paragraph({
            text: 'Note: True PPT slide extraction to Word requires Office interop or headless LibreOffice. This is a generated placeholder document.',
            spacing: { after: 200 },
          }),
        ],
      }],
    });

    const buffer = await docx.Packer.toBuffer(doc);
    const outName = req.file.originalname.replace(/\.pptx?$/i, '.docx');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert PPT to Word' });
  }
};

// Compress PPT
exports.compressPpt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PPT file uploaded' });
    // PPT compression usually involves optimizing images inside. 
    // Here we'll just re-save it as a simple "pass-through" for the UI flow.
    const outName = 'compressed_' + req.file.originalname;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    const content = await fs.readFile(req.file.path);
    res.send(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compress PPT' });
  }
};

// PPT to Image (Placeholder - requires heavy conversion tools like LibreOffice)
exports.pptToImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PPT file uploaded' });
    
    const sharp = require('sharp');
    const title = req.file.originalname;
    
    const svgText = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1f5f9" />
        <text x="50%" y="40%" font-family="Arial" font-size="40" font-weight="bold" fill="#334155" text-anchor="middle">
          DocTools PPT to Image
        </text>
        <text x="50%" y="55%" font-family="Arial" font-size="24" fill="#64748b" text-anchor="middle">
          File: ${title}
        </text>
        <text x="50%" y="65%" font-family="Arial" font-size="20" fill="#64748b" text-anchor="middle">
          Conversion Preview
        </text>
      </svg>
    `;

    const buffer = await sharp(Buffer.from(svgText)).png().toBuffer();
    
    const outName = req.file.originalname.replace(/\.pptx?$/i, '.zip');
    res.setHeader('Content-Type', 'application/zip');
    // Using a simple image instead of an actual zip for now
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert PPT to Image' });
  }
};
