const docx = require('docx');
const ExcelJS = require('exceljs');
const pptxgen = require('pptxgenjs');

exports.createWord = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({ error: 'Title or content is required' });
    }

    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            text: title || 'DocTools Generated Document',
            heading: docx.HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new docx.Paragraph({
            text: content || '',
            spacing: { before: 200, after: 200 },
          }),
        ],
      }],
    });

    const buffer = await docx.Packer.toBuffer(doc);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'document'}.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Word document' });
  }
};

exports.createExcel = async (req, res) => {
  try {
    const { title, data } = req.body; // data expected as 2D array: [['Name', 'Age'], ['Ali', '25']]

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet 1');

    if (data && Array.isArray(data)) {
      data.forEach(row => {
        sheet.addRow(row);
      });
      // Basic styling for header
      if (data.length > 0) {
        sheet.getRow(1).font = { bold: true };
      }
    } else {
      sheet.addRow(['Sample Column 1', 'Sample Column 2']);
      sheet.addRow(['Sample Data 1', 'Sample Data 2']);
      sheet.getRow(1).font = { bold: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'spreadsheet'}.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Excel document' });
  }
};

exports.createPpt = async (req, res) => {
  try {
    const { title, slides } = req.body; // slides expected as array of strings for slide text

    let pres = new pptxgen();

    if (slides && Array.isArray(slides) && slides.length > 0) {
      // Title slide
      let titleSlide = pres.addSlide();
      titleSlide.addText(title || 'DocTools Presentation', { x: 1, y: 1, w: '80%', h: 1, fontSize: 36, align: 'center', bold: true, color: '363636' });

      // Content slides
      slides.forEach(slideText => {
        let slide = pres.addSlide();
        slide.addText(slideText, { x: 0.5, y: 0.5, w: '90%', h: '80%', fontSize: 24, align: 'center', color: '363636' });
      });
    } else {
      // Default sample slide
      let slide = pres.addSlide();
      slide.addText(title || 'DocTools Presentation', { x: 1, y: 1, w: '80%', h: 1, fontSize: 36, align: 'center', bold: true, color: '363636' });
      slide.addText('Add your content here.', { x: 1, y: 2.5, w: '80%', h: 1, fontSize: 24, align: 'center', color: '666666' });
    }

    const buffer = await pres.write({ outputType: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'presentation'}.pptx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create PPT' });
  }
};
