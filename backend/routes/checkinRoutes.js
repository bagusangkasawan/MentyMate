/**
 * Authenticated, consent-gated daily check-in, Gemini reflection, and 14-day summary routes (/api/checkin).
 */
const express = require('express');
const { z } = require('zod');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const auth = require('../middleware/authMiddleware');
const { requireConsent } = require('../middleware/consentMiddleware');
const { validate } = require('../middleware/validate');

const checkinSchema = z.object({
  mood: z.enum(['baik', 'sedang', 'buruk']),
  description: z.string().max(2000).optional().default(''),
  language: z.enum(['en', 'id']).optional(),
  physicalMetrics: z
    .object({
      sleepQuality: z.number().min(1).max(5).optional(),
      sleepDurationHours: z.number().min(0).max(24).optional(),
      energyLevel: z.number().min(1).max(5).optional(),
      physicalActivityMinutes: z.number().min(0).max(1440).optional(),
      stressLevel: z.number().min(1).max(5).optional(),
      wearableSource: z.enum(['manual', 'future_wearable']).optional(),
    })
    .optional(),
});

/**
 * @openapi
 * /api/checkin:
 *   post:
 *     tags: [Check-in]
 *     summary: Submit daily mood and optional physical habit check-in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mood]
 *             properties:
 *               mood: { type: string, enum: [baik, sedang, buruk] }
 *               description: { type: string }
 *               language: { type: string, enum: [en, id] }
 *               physicalMetrics: { type: object }
 *     responses:
 *       201: { description: Check-in recorded (with crisisProtocol if triggered) }
 *       403: { description: moodTracking consent required }
 *   get:
 *     tags: [Check-in]
 *     summary: Get authenticated user check-in history
 *     responses:
 *       200: { description: List of check-ins }
 */
router.post('/', auth, requireConsent('moodTracking'), validate(checkinSchema), checkinController.checkin);
router.get('/', auth, requireConsent('moodTracking'), checkinController.getCheckins);

/**
 * @openapi
 * /api/checkin/recommendation:
 *   get:
 *     tags: [Check-in]
 *     summary: Get or generate daily Gemini coping recommendation
 *     responses:
 *       200: { description: Daily recommendation text }
 */
router.get('/recommendation', auth, requireConsent('moodTracking'), checkinController.getRecommendation);

/**
 * @openapi
 * /api/checkin/wellbeing-summary:
 *   get:
 *     tags: [Check-in]
 *     summary: Generate 14-day physical + mental wellbeing clinician handover summary
 *     responses:
 *       200: { description: 14-day summary payload }
 */
router.get('/wellbeing-summary', auth, requireConsent('moodTracking'), checkinController.getWellbeingSummary);

module.exports = router;
