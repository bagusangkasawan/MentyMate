/**
 * Public stepped-care local support directory routes (/api/support).
 */
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

/**
 * @openapi
 * /api/support/services:
 *   get:
 *     tags: [Support Directory]
 *     summary: List stepped-care local support services and helplines
 *     security: []
 *     parameters:
 *       - in: query
 *         name: country
 *         schema: { type: string, example: ID }
 *       - in: query
 *         name: region
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200: { description: Matching support services }
 */
router.get('/services', supportController.listServices);

module.exports = router;
