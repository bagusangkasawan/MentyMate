/**
 * Authenticated, consent-gated PHQ-9 & GAD-7 assessment routes (/api/assessments).
 */
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

/**
 * @openapi
 * /api/assessments:
 *   post:
 *     tags: [Assessments]
 *     summary: Submit PHQ-9 (9 items) or GAD-7 (7 items) screening
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, answers]
 *             properties:
 *               type: { type: string, enum: [PHQ-9, GAD-7] }
 *               answers: { type: array, items: { type: integer, minimum: 0, maximum: 3 } }
 *               language: { type: string, enum: [en, id] }
 *     responses:
 *       201: { description: Scored assessment (with crisisProtocol if triggered) }
 *       403: { description: selfAssessment consent required }
 *   get:
 *     tags: [Assessments]
 *     summary: Get authenticated user assessment history
 *     responses:
 *       200: { description: List of assessments }
 */
router.post('/', auth, requireConsent('selfAssessment'), validate(submitSchema), assessmentController.submitAssessment);
router.get('/', auth, requireConsent('selfAssessment'), assessmentController.getAssessments);

/**
 * @openapi
 * /api/assessments/insights:
 *   get:
 *     tags: [Assessments]
 *     summary: Get longitudinal personal baseline and trend insights
 *     responses:
 *       200: { description: Baseline and trend summary }
 */
router.get('/insights', auth, requireConsent('selfAssessment'), assessmentController.getInsights);

module.exports = router;
