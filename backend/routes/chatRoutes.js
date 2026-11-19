/**
 * AI Companion chat and public crisis-guidance routes (/api/chat).
 */
const express = require('express');
const { z } = require('zod');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');
const { requireConsent } = require('../middleware/consentMiddleware');
const { validate } = require('../middleware/validate');
const { getCrisisProtocol } = require('../data/crisisTemplates');
const { resolveLanguage } = require('../utils/i18n');

const chatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  language: z.enum(['en', 'id']).optional(),
});

const ackSchema = z.object({
  incidentId: z.string().optional(),
  language: z.enum(['en', 'id']).optional(),
});

/**
 * @openapi
 * /api/chat/crisis-guidance:
 *   get:
 *     tags: [Chat & Safety]
 *     summary: Get localized pre-reviewed crisis guidance and emergency helplines
 *     security: []
 *     parameters:
 *       - in: query
 *         name: country
 *         schema: { type: string, example: ID }
 *     responses:
 *       200: { description: Localized crisis protocol }
 */
router.get('/crisis-guidance', (req, res) => {
  const lang = resolveLanguage(req);
  const country = (req.query.country || 'ID').toString().toUpperCase();
  res.json(getCrisisProtocol(lang, country));
});

/**
 * @openapi
 * /api/chat:
 *   post:
 *     tags: [Chat & Safety]
 *     summary: Send message to Gemini AI Companion (intercepted deterministically on crisis)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               language: { type: string, enum: [en, id] }
 *     responses:
 *       200: { description: AI reply or deterministic crisisProtocol }
 *       403: { description: aiChat consent required }
 */
router.post('/', auth, requireConsent('aiChat'), validate(chatSchema), chatController.chatWithBot);

/**
 * @openapi
 * /api/chat/crisis-ack:
 *   post:
 *     tags: [Chat & Safety]
 *     summary: Acknowledge that the user reviewed crisis support guidance
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               incidentId: { type: string }
 *               language: { type: string, enum: [en, id] }
 *     responses:
 *       200: { description: Acknowledgment recorded }
 */
router.post('/crisis-ack', auth, validate(ackSchema), chatController.acknowledgeCrisisGuidance);

module.exports = router;
