const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch'); // wait, fetch is built-in in node 18+, but using node-fetch might be needed if old node, but Node is v24.

async function test() {
  try {
    // create a dummy pdf
    const { PDFDocument } = require('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([800, 600]);
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('dummy.pdf', pdfBytes);

    const form = new FormData();
    form.append('pdf', fs.createReadStream('dummy.pdf'));

    console.log('Sending to Office Service directly (5003)...');
    const res = await fetch('http://localhost:5003/api/ppt/pdf-to-ppt', {
      method: 'POST',
      body: form
    });
    console.log('5003 Status:', res.status);
    if (!res.ok) {
      console.log('5003 Error:', await res.text());
    } else {
      console.log('5003 Success!');
    }

    console.log('Sending to Gateway (5000)...');
    const form2 = new FormData();
    form2.append('pdf', fs.createReadStream('dummy.pdf'));
    const res2 = await fetch('http://localhost:5000/api/ppt/pdf-to-ppt', {
      method: 'POST',
      body: form2
    });
    console.log('5000 Status:', res2.status);
    if (!res2.ok) {
      console.log('5000 Error:', await res2.text());
    } else {
      console.log('5000 Success!');
    }

  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
