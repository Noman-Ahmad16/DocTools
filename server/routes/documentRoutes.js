const express = require('express');
const documentController = require('../controllers/documentController');

const router = express.Router();

router.post('/create-word', documentController.createWord);
router.post('/create-excel', documentController.createExcel);
router.post('/create-ppt', documentController.createPpt);

module.exports = router;
