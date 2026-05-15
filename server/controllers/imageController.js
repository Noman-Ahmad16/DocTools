const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

exports.compressImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const inputPath = req.file.path;
    const { quality = 60 } = req.body; // Default quality 60%
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    let buffer;
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      buffer = await image.jpeg({ quality: parseInt(quality) }).toBuffer();
    } else if (metadata.format === 'png') {
      buffer = await image.png({ quality: parseInt(quality), compressionLevel: 9 }).toBuffer();
    } else if (metadata.format === 'webp') {
      buffer = await image.webp({ quality: parseInt(quality) }).toBuffer();
    } else {
      // Fallback
      buffer = await image.jpeg({ quality: parseInt(quality) }).toBuffer();
    }

    res.setHeader('Content-Type', `image/${metadata.format}`);
    res.setHeader('Content-Disposition', `attachment; filename="compressed_${req.file.originalname}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compress image' });
  }
};

exports.resizeImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const inputPath = req.file.path;
    const { width, height } = req.body;
    
    if (!width && !height) return res.status(400).json({ error: 'Width or height is required' });

    const resizeOptions = {
      fit: sharp.fit.fill,
      withoutEnlargement: false
    };

    if (width) resizeOptions.width = parseInt(width);
    if (height) resizeOptions.height = parseInt(height);

    const buffer = await sharp(inputPath).resize(resizeOptions).toBuffer();
    
    const metadata = await sharp(inputPath).metadata();
    res.setHeader('Content-Type', `image/${metadata.format}`);
    res.setHeader('Content-Disposition', `attachment; filename="resized_${req.file.originalname}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resize image' });
  }
};

exports.convertImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const inputPath = req.file.path;
    const { format } = req.body; // jpeg, png, webp, etc.
    
    if (!format) return res.status(400).json({ error: 'Target format is required' });

    const buffer = await sharp(inputPath).toFormat(format).toBuffer();

    // Replace original extension with new format
    const oldExt = path.extname(req.file.originalname);
    const newFilename = `converted_${req.file.originalname.replace(oldExt, '.' + format)}`;

    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="${newFilename}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to convert image' });
  }
};

exports.imageToWord = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    
    const Tesseract = require('tesseract.js');
    const docx = require('docx');
    
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
    
    const doc = new docx.Document({
      sections: [{
        children: text.split('\n').map(line => new docx.Paragraph({
          children: [new docx.TextRun(line)]
        }))
      }]
    });

    const buffer = await docx.Packer.toBuffer(doc);
    const outName = req.file.originalname.replace(path.extname(req.file.originalname), '.docx');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="ocr_${outName}"`);
    res.send(buffer);
  } catch (err) {
    console.error('OCR Error:', err);
    res.status(500).json({ error: 'Failed to extract text from image' });
  }
};
