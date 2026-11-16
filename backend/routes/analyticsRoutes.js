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
  metadata: z
    .object({
      instrument: z.string().max(30).optional(),
      category: z.string().max(50).optional(),
    })
    .optional(),
});

// Public aggregated, PII-free impact & safety metrics
router.get('/summary', analyticsController.getSummary);
router.post('/events', validate(eventSchema), analyticsController.recordEvent);

module.exports = router;
