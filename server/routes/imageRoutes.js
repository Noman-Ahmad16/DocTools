const express = require('express');
const multer = require('multer');
const path = require('path');
const imageController = require('../controllers/imageController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'img-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max for images
});

router.post('/compress', upload.single('image'), imageController.compressImage);
router.post('/resize', upload.single('image'), imageController.resizeImage);
router.post('/convert', upload.single('image'), imageController.convertImage);
router.post('/ocr', upload.single('image'), imageController.imageToWord);

module.exports = router;
