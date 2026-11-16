const User = require('../models/User');
const Checkin = require('../models/Checkin');
const Assessment = require('../models/Assessment');
const { decryptText } = require('../utils/crypto');
const { resolveLanguage, t } = require('../utils/i18n');

exports.getConsents = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('consents preferredLanguage country region trustedContact');
    if (!user) return res.status(404).json({ error: t(resolveLanguage(req), 'userNotFound') });
    res.json({
      consents: user.consents,
      preferredLanguage: user.preferredLanguage,
      country: user.country,
      region: user.region,
      trustedContact: user.trustedContact,
    });
  } catch (err) {
    res.status(500).json({ error: t(resolveLanguage(req), 'serverError') });
  }
};

exports.updateConsents = async (req, res) => {
  const { aiChat, moodTracking, selfAssessment } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: t(resolveLanguage(req), 'userNotFound') });

    const now = new Date();
    if (typeof aiChat === 'boolean') user.consents.aiChat = { granted: aiChat, updatedAt: now };
    if (typeof moodTracking === 'boolean') user.consents.moodTracking = { granted: moodTracking, updatedAt: now };
    if (typeof selfAssessment === 'boolean') user.consents.selfAssessment = { granted: selfAssessment, updatedAt: now };

    await user.save();
    res.json({ consents: user.consents });
  } catch (err) {
    res.status(500).json({ error: t(resolveLanguage(req), 'serverError') });
  }
};

exports.exportMyData = async (req, res) => {
  try {
    const [user, checkins, assessments] = await Promise.all([
      User.findById(req.userId).select('-password'),
      Checkin.find({ userId: req.userId }).sort({ date: -1 }),
      Assessment.find({ userId: req.userId }).sort({ createdAt: -1 }),
    ]);

    if (!user) return res.status(404).json({ error: t(resolveLanguage(req), 'userNotFound') });

    const decryptedCheckins = checkins.map((c) => ({
      ...c.toObject(),
      description: decryptText(c.description),
    }));

    res.json({
      exportedAt: new Date().toISOString(),
      profile: user,
      checkins: decryptedCheckins,
      assessments,
    });
  } catch (err) {
    res.status(500).json({ error: t(resolveLanguage(req), 'serverError') });
  }
};

exports.deleteMyAccount = async (req, res) => {
  try {
    await Promise.all([
      Checkin.deleteMany({ userId: req.userId }),
      Assessment.deleteMany({ userId: req.userId }),
      User.findByIdAndDelete(req.userId),
    ]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: t(resolveLanguage(req), 'serverError') });
  }
};
