const User = require('../models/User');
const { resolveLanguage, t } = require('../utils/i18n');

/**
 * Enforces granular user consent (Pillar 04) before accessing sensitive features.
 * @param {'aiChat' | 'moodTracking' | 'selfAssessment'} featureKey
 */
function requireConsent(featureKey) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).select('consents preferredLanguage country region');
      if (!user) {
        const lang = resolveLanguage(req);
        return res.status(404).json({ error: t(lang, 'userNotFound'), message: t(lang, 'userNotFound') });
      }

      req.currentUser = user;
      const hasConsent = Boolean(user.consents?.[featureKey]?.granted);

      if (!hasConsent) {
        const lang = resolveLanguage(req, user);
        return res.status(403).json({
          code: 'CONSENT_REQUIRED',
          feature: featureKey,
          error: t(lang, 'consentRequired'),
          message: t(lang, 'consentRequired'),
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireConsent };
