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

router.post('/', auth, requireConsent('moodTracking'), validate(checkinSchema), checkinController.checkin);
router.get('/', auth, requireConsent('moodTracking'), checkinController.getCheckins);
router.get('/recommendation', auth, requireConsent('moodTracking'), checkinController.getRecommendation);
router.get('/wellbeing-summary', auth, requireConsent('moodTracking'), checkinController.getWellbeingSummary);

module.exports = router;
