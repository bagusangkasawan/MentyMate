const express = require('express');
const { z } = require('zod');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const auth = require('../middleware/authMiddleware');
const { requireConsent } = require('../middleware/consentMiddleware');
const { validate } = require('../middleware/validate');

const submitSchema = z
  .object({
    type: z.enum(['PHQ-9', 'GAD-7']),
    answers: z.array(z.number().int().min(0).max(3)),
    language: z.enum(['en', 'id']).optional(),
  })
  .refine(
    (data) => (data.type === 'PHQ-9' ? data.answers.length === 9 : data.answers.length === 7),
    { message: 'Answers length must match instrument (9 for PHQ-9, 7 for GAD-7).' }
  );

router.post('/', auth, requireConsent('selfAssessment'), validate(submitSchema), assessmentController.submitAssessment);
router.get('/', auth, requireConsent('selfAssessment'), assessmentController.getAssessments);
router.get('/insights', auth, requireConsent('selfAssessment'), assessmentController.getInsights);

module.exports = router;
