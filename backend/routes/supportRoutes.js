const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Public support directory (no login required)
router.get('/services', supportController.listServices);

module.exports = router;
