const fs = require('fs');

async function test() {
  try {
    const { PDFDocument } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([800, 600]);
    const pdfBytes = await pdfDoc.save();
    
    // Create native File object
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('pdf', blob, 'dummy.pdf');

    console.log('Sending to Office (5003)...');
    const res = await fetch('http://localhost:5003/api/ppt/pdf-to-ppt', {
      method: 'POST',
      body: formData
    });
    
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    if (!res.ok) {
      console.log('Error Text:', await res.text());
    } else {
      console.log('Success, response length:', (await res.arrayBuffer()).byteLength);
    }
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
