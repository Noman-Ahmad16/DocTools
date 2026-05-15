const express = require('express');
const multer = require('multer');
const path = require('path');
const excelController = require('../controllers/excelController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/excel-to-pdf', upload.single('excel'), excelController.excelToPdf);
router.post('/pdf-to-excel', upload.single('pdf'), excelController.pdfToExcel);
router.post('/excel-to-word', upload.single('excel'), excelController.excelToWord);
router.post('/word-to-excel', upload.single('word'), excelController.wordToExcel);
router.post('/compress', upload.single('excel'), excelController.compressExcel);

module.exports = router;
