const express = require('express');
const router = express.Router();
const iframeController = require('../controllers/iframeController');

router.get('/unavailiframe', iframeController.getUnavailFrame);
router.get('/reserveiframe', iframeController.getResIframe);

module.exports = router;