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

router.get('/consents', auth, privacyController.getConsents);
router.put('/consents', auth, validate(consentUpdateSchema), privacyController.updateConsents);
router.get('/export', auth, privacyController.exportMyData);
router.delete('/account', auth, privacyController.deleteMyAccount);

module.exports = router;
