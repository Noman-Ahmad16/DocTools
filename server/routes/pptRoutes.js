const express = require('express');
const multer = require('multer');
const path = require('path');
const pptController = require('../controllers/pptController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/ppt-to-pdf', upload.single('ppt'), pptController.pptToPdf);
router.post('/pdf-to-ppt', upload.single('pdf'), pptController.pdfToPpt);
router.post('/ppt-to-word', upload.single('ppt'), pptController.pptToWord);
router.post('/ppt-to-image', upload.single('ppt'), pptController.pptToImage);
router.post('/compress', upload.single('ppt'), pptController.compressPpt);

module.exports = router;
