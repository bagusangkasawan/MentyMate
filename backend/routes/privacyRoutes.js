/**
 * Authenticated user privacy, consent, data export, and account deletion routes (/api/privacy).
 */
const express = require('express');
const { z } = require('zod');
const router = express.Router();
const privacyController = require('../controllers/privacyController');
const auth = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const consentUpdateSchema = z.object({
  aiChat: z.boolean().optional(),
  moodTracking: z.boolean().optional(),
  selfAssessment: z.boolean().optional(),
});

/**
 * @openapi
 * /api/privacy/consents:
 *   get:
 *     tags: [Privacy]
 *     summary: Get granular consent toggles and locale settings
 *     responses:
 *       200: { description: Consent settings }
 *   put:
 *     tags: [Privacy]
 *     summary: Grant or revoke feature consents (aiChat, moodTracking, selfAssessment)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aiChat: { type: boolean }
 *               moodTracking: { type: boolean }
 *               selfAssessment: { type: boolean }
 *     responses:
 *       200: { description: Updated consents }
 */
router.get('/consents', auth, privacyController.getConsents);
router.put('/consents', auth, validate(consentUpdateSchema), privacyController.updateConsents);

/**
 * @openapi
 * /api/privacy/export:
 *   get:
 *     tags: [Privacy]
 *     summary: Export all authenticated user records as JSON
 *     responses:
 *       200: { description: Full user data export }
 */
router.get('/export', auth, privacyController.exportMyData);

/**
 * @openapi
 * /api/privacy/account:
 *   delete:
 *     tags: [Privacy]
 *     summary: Permanently delete user account and all associated records
 *     responses:
 *       200: { description: Account deleted }
 */
router.delete('/account', auth, privacyController.deleteMyAccount);

module.exports = router;
