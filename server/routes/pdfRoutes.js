const express = require('express');
const multer = require('multer');
const path = require('path');
const pdfController = require('../controllers/pdfController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/split', upload.single('pdf'), pdfController.splitPdf);
router.post('/compress', upload.single('pdf'), pdfController.compressPdf);
router.post('/lock', upload.single('pdf'), pdfController.lockPdf);
router.post('/unlock', upload.single('pdf'), pdfController.unlockPdf);
router.post('/page-count', upload.single('pdf'), pdfController.getPageCount);
router.post('/create', pdfController.createPdf);
router.post('/word-to-pdf', upload.single('word'), pdfController.wordToPdf);
router.post('/to-image', upload.single('pdf'), pdfController.pdfToImage);

module.exports = router;
