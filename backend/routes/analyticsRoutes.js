/**
 * Public PII-free analytics routes (/api/analytics) for event ingestion and summary metrics.
 */
const express = require('express');
const { z } = require('zod');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { validate } = require('../middleware/validate');

const eventSchema = z.object({
  eventType: z.enum([
    'screening_started',
    'screening_completed',
    'checkin_submitted',
    'activity_used',
    'directory_viewed',
    'referral_followup_confirmed',
    'crisis_guidance_viewed',
    'crisis_guidance_completed',
  ]),
  language: z.enum(['en', 'id']).optional(),
  country: z.string().max(10).optional(),
  orgCode: z.string().trim().max(32).optional(),
  metadata: z
    .object({
      instrument: z.string().max(30).optional(),
      category: z.string().max(50).optional(),
    })
    .optional(),
});

/**
 * @openapi
 * /api/analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Get aggregated PII-free impact and safety outcome metrics
 *     security: []
 *     responses:
 *       200: { description: Aggregated impact summary }
 */
router.get('/summary', analyticsController.getSummary);

/**
 * @openapi
 * /api/analytics/events:
 *   post:
 *     tags: [Analytics]
 *     summary: Record a PII-free analytics event
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventType]
 *             properties:
 *               eventType: { type: string }
 *               language: { type: string, enum: [en, id] }
 *               country: { type: string }
 *               metadata: { type: object }
 *     responses:
 *       201: { description: Event recorded }
 */
router.post('/events', validate(eventSchema), analyticsController.recordEvent);

module.exports = router;
