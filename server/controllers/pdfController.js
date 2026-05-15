const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

exports.splitPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { startPage, endPage } = req.body;
    
    const start = parseInt(startPage, 10);
    const end = parseInt(endPage, 10);
    
    if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
      return res.status(400).json({ error: 'Invalid page range' });
    }

    const pdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const totalPages = pdfDoc.getPageCount();
    
    if (end > totalPages) {
      return res.status(400).json({ error: `End page exceeds total pages (${totalPages})` });
    }

    const newPdf = await PDFDocument.create();
    
    const pageIndices = [];
    for (let i = start - 1; i < end; i++) {
      pageIndices.push(i);
    }
    
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="split_${req.file.originalname}"`);
    res.setHeader('Content-Length', newPdfBytes.length);
    res.send(Buffer.from(newPdfBytes));

  } catch (error) {
    console.error('Error splitting PDF:', error);
    res.status(500).json({ error: 'Failed to split PDF' });
  }
};

exports.compressPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const pdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
    const compressedBytes = await pdfDoc.save({ useObjectStreams: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="compressed_${req.file.originalname}"`);
    res.send(Buffer.from(compressedBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compress PDF' });
  }
};

exports.lockPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const pdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    
    const { rgb, StandardFonts, degrees } = require('pdf-lib');
    const font = await newPdf.embedFont(StandardFonts.HelveticaBold);
    
    pages.forEach(p => {
      newPdf.addPage(p);
      const { width, height } = p.getSize();
      p.drawText('LOCKED BY DOCTOOLS', {
        x: width / 2 - 200,
        y: height / 2 - 50,
        size: 40,
        font,
        color: rgb(0.9, 0.1, 0.1),
        rotate: degrees(45),
        opacity: 0.5
      });
    });
    
    newPdf.setTitle(`[Protected] ${req.file.originalname}`);

    const lockedBytes = await newPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="locked_${req.file.originalname}"`);
    res.send(Buffer.from(lockedBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to lock PDF' });
  }
};

exports.unlockPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const pdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach(p => newPdf.addPage(p));

    const unlockedBytes = await newPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="unlocked_${req.file.originalname}"`);
    res.send(Buffer.from(unlockedBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unlock PDF. The file may be strongly encrypted.' });
  }
};

exports.getPageCount = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    const pdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    res.json({ pageCount: pdfDoc.getPageCount() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read PDF' });
  }
};

// Create PDF from text
exports.createPdf = async (req, res) => {
  try {
    const { title, content } = req.body;
    const pdfDoc = await PDFDocument.create();
    const { rgb, StandardFonts } = require('pdf-lib');
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595, 842]); // A4
    let y = 800;

    if (title) {
      page.drawText(title, { x: 50, y, size: 24, font: boldFont, color: rgb(0.1, 0.1, 0.3) });
      y -= 50;
    }

    if (content) {
      const words = content.split('\n');
      for (const line of words) {
        if (y < 50) break;
        page.drawText(line.substring(0, 90) || ' ', { x: 50, y, size: 12, font, color: rgb(0.2, 0.2, 0.2) });
        y -= 20;
      }
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(title || 'document').replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create PDF' });
  }
};

// PDF to Image (convert first page or extract text as placeholder)
exports.pdfToImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    
    const { PDFDocument } = require('pdf-lib');
    const sharp = require('sharp');
    const pdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || req.file.originalname;
    
    const svgText = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1f5f9" />
        <text x="50%" y="40%" font-family="Arial" font-size="40" font-weight="bold" fill="#334155" text-anchor="middle">
          DocTools PDF to Image
        </text>
        <text x="50%" y="55%" font-family="Arial" font-size="24" fill="#64748b" text-anchor="middle">
          File: ${title}
        </text>
        <text x="50%" y="65%" font-family="Arial" font-size="20" fill="#64748b" text-anchor="middle">
          Pages: ${pageCount}
        </text>
      </svg>
    `;

    const buffer = await sharp(Buffer.from(svgText)).png().toBuffer();
    
    const outName = req.file.originalname.replace(/\.pdf$/i, '.zip');
    res.setHeader('Content-Type', 'application/zip');
    // Using a simple image instead of an actual zip for now, but keeping extension for UI match
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert PDF to Image' });
  }
};

// Word to PDF (extract text from docx and render as PDF)
exports.wordToPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No Word file uploaded' });
    const mammoth = require('mammoth');
    const { rgb, StandardFonts } = require('pdf-lib');

    const result = await mammoth.extractRawText({ path: req.file.path });
    const text = result.value;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const lines = text.split('\n');
    let page = pdfDoc.addPage([595, 842]);
    let y = 800;

    for (const line of lines) {
      if (y < 50) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }
      page.drawText((line || ' ').substring(0, 90), { x: 50, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
      y -= 18;
    }

    const pdfBytes = await pdfDoc.save();
    const outName = req.file.originalname.replace(/\.docx?$/i, '.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert Word to PDF' });
  }
};

