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

// Public crisis guidance endpoint (no login required)
router.get('/crisis-guidance', (req, res) => {
  const lang = resolveLanguage(req);
  const country = (req.query.country || 'ID').toString().toUpperCase();
  res.json(getCrisisProtocol(lang, country));
});

router.post('/', auth, requireConsent('aiChat'), validate(chatSchema), chatController.chatWithBot);
router.post('/crisis-ack', auth, validate(ackSchema), chatController.acknowledgeCrisisGuidance);

module.exports = router;
