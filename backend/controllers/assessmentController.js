const Assessment = require('../models/Assessment');
const Checkin = require('../models/Checkin');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { scoreAssessment, computeBaselineAndTrend } = require('../services/scoring');
const { detectCrisisAssessment, recordCrisisEscalation } = require('../services/crisisDetector');
const { resolveLanguage, t } = require('../utils/i18n');

exports.submitAssessment = async (req, res) => {
  const { type, answers } = req.body;
  const user = req.currentUser;
  const lang = resolveLanguage(req, user);
  const country = user?.country || 'ID';

  try {
    const { totalScore, severityBand, item9Flag } = scoreAssessment(type, answers);
    const assessment = await Assessment.create({
      userId: req.userId,
      type,
      language: lang,
      answers,
      totalScore,
      severityBand,
      item9Flag,
    });

    await AnalyticsEvent.create({
      eventType: 'screening_completed',
      language: lang,
      country,
      metadata: { instrument: type },
    }).catch(() => {});

    const crisisCheck = detectCrisisAssessment({ type, totalScore, answers });
    let crisisProtocol = null;
    let incidentId = null;

    if (crisisCheck.triggered) {
      const escalated = await recordCrisisEscalation({
        userId: req.userId,
        source: type === 'PHQ-9' ? 'phq9' : 'gad7',
        severity: crisisCheck.severity,
        triggerType: crisisCheck.triggerType,
        language: lang,
        country,
      });
      crisisProtocol = escalated.crisisProtocol;
      incidentId = escalated.incidentId;
    }

    res.status(201).json({
      assessment,
      isCrisis: crisisCheck.triggered,
      incidentId,
      crisisProtocol,
    });
  } catch (err) {
    console.error('Error submitAssessment:', err.message);
    res.status(400).json({ error: err.message || t(lang, 'serverError') });
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(30);
    res.json(assessments);
  } catch (err) {
    console.error('Error getAssessments:', err.message);
    res.status(500).json({ error: t(resolveLanguage(req), 'serverError') });
  }
};

exports.getInsights = async (req, res) => {
  const lang = resolveLanguage(req, req.currentUser);
  try {
    const [assessments, checkins] = await Promise.all([
      Assessment.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20),
      Checkin.find({ userId: req.userId }).sort({ date: -1 }).limit(30),
    ]);

    const baseline = computeBaselineAndTrend(assessments, checkins);
    const disclaimer =
      lang === 'id'
        ? 'Hasil skrining PHQ-9 dan GAD-7 ini bersifat reflektif untuk deteksi dini dan bukan merupakan diagnosis klinis.'
        : 'PHQ-9 and GAD-7 screening results are for early self-awareness only and do not constitute a clinical diagnosis.';

    res.json({ baseline, disclaimer, recentAssessments: assessments.slice(0, 6) });
  } catch (err) {
    console.error('Error getInsights:', err.message);
    res.status(500).json({ error: t(lang, 'serverError') });
  }
};
