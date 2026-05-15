const express = require('express');
const multer = require('multer');
const path = require('path');
const wordController = require('../controllers/wordController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/pdf-to-word', upload.single('pdf'), wordController.pdfToWord);
router.post('/word-to-ppt', upload.single('word'), wordController.wordToPpt);
router.post('/word-to-excel', upload.single('word'), wordController.wordToExcel);
router.post('/compress', upload.single('word'), wordController.compressWord);

module.exports = router;
