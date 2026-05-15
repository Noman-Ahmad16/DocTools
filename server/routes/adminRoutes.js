const express = require('express');
const adminController = require('../controllers/adminController');
const geminiController = require('../controllers/geminiController');

const router = express.Router();

// Public
router.get('/blog', adminController.getPosts);
router.get('/reviews', adminController.getReviews);
router.post('/reviews', adminController.addReview);
router.post('/urdu-process', geminiController.processUrduText);
router.get('/announcements', adminController.getAnnouncement);
router.get('/stats', adminController.getStats); // public to fetch if needed

// Admin Auth
router.post('/login', adminController.login);
router.get('/security-question', adminController.getSecurityQuestion);
router.post('/reset-password', adminController.resetPassword);

// Admin Restricted (in prod add middleware)
router.post('/blog', adminController.createPost);
router.put('/blog/:id', adminController.updatePost);
router.delete('/blog/:id', adminController.deletePost);

router.post('/reviews/approve/:id', adminController.approveReview);
router.delete('/reviews/:id', adminController.deleteReview);

router.put('/stats', adminController.updateStats);

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

router.get('/earnings', adminController.getEarnings);
router.put('/earnings', adminController.updateEarnings);

router.post('/announcements', adminController.updateAnnouncement);

module.exports = router;
