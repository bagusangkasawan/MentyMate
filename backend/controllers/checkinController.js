require('dotenv').config();
const Checkin = require('../models/Checkin');
const Assessment = require('../models/Assessment');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { createChatCompletion } = require('../config/geminiClient');
const { detectCrisisText, recordCrisisEscalation } = require('../services/crisisDetector');
const { computeBaselineAndTrend } = require('../services/scoring');
const { encryptText, decryptText } = require('../utils/crypto');
const { resolveLanguage, t } = require('../utils/i18n');

exports.checkin = async (req, res) => {
  const { mood, description = '', physicalMetrics } = req.body;
  const userId = req.userId;
  const user = req.currentUser;
  const lang = resolveLanguage(req, user);
  const country = user?.country || 'ID';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existingCheckin = await Checkin.findOne({
      userId,
      date: { $gte: today },
    });

    if (existingCheckin) {
      return res.status(400).json({ message: t(lang, 'checkinExistsToday') });
    }

    // Pillar 03: Check journal note for crisis signals before encrypting
    const crisisCheck = detectCrisisText(description);
    let crisisProtocol = null;
    let incidentId = null;

    if (crisisCheck.triggered) {
      const escalated = await recordCrisisEscalation({
        userId,
        source: 'checkin',
        severity: crisisCheck.severity,
        triggerType: crisisCheck.triggerType,
        language: lang,
        country,
      });
      crisisProtocol = escalated.crisisProtocol;
      incidentId = escalated.incidentId;
    }

    const checkin = new Checkin({
      userId,
      mood,
      description: encryptText(description),
      physicalMetrics,
    });
    await checkin.save();

    await AnalyticsEvent.create({
      eventType: 'checkin_submitted',
      language: lang,
      country,
    }).catch(() => {});

    res.status(201).json({
      message: t(lang, 'checkinSaved'),
      isCrisis: crisisCheck.triggered,
      incidentId,
      crisisProtocol,
    });
  } catch (err) {
    console.error('Error in checkin:', err.message);
    res.status(500).json({ message: t(lang, 'serverError') });
  }
};

exports.getCheckins = async (req, res) => {
  const lang = resolveLanguage(req, req.currentUser);
  try {
    const checkins = await Checkin.find({ userId: req.userId }).sort({ date: -1 });
    const safeCheckins = checkins.map((c) => ({
      ...c.toObject(),
      description: decryptText(c.description),
    }));
    res.json(safeCheckins);
  } catch (err) {
    console.error('Error getCheckins:', err.message);
    res.status(500).json({ message: t(lang, 'serverError') });
  }
};

exports.getRecommendation = async (req, res) => {
  const lang = resolveLanguage(req, req.currentUser);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const todayCheckin = await Checkin.findOne({
      userId: req.userId,
      date: { $gte: today },
    });

    if (!todayCheckin) {
      return res.status(400).json({
        code: 'CHECKIN_REQUIRED_TODAY',
        message:
          lang === 'id'
            ? 'Silakan isi daily check-in hari ini terlebih dahulu agar AI Pattern Reflection menyertakan kondisimu hari ini.'
            : 'Please complete today’s daily check-in first so AI Pattern Reflection includes your latest reflection.',
      });
    }

    if (todayCheckin.aiRecommendation && todayCheckin.aiRecommendationLang === lang) {
      return res.json({ recommendation: todayCheckin.aiRecommendation, cached: true });
    }

    const recentCheckins = await Checkin.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(5);

    const descriptions = recentCheckins
      .map((c) => {
        const pm = c.physicalMetrics
          ? ` | Sleep: ${c.physicalMetrics.sleepDurationHours ?? '-'}h (Q:${c.physicalMetrics.sleepQuality ?? '-'}/5), Energy: ${c.physicalMetrics.energyLevel ?? '-'}/5, Stress: ${c.physicalMetrics.stressLevel ?? '-'}/5`
          : '';
        return `Date: ${c.date.toDateString()}, Mood: ${c.mood}, Note: ${decryptText(c.description)}${pm}`;
      })
      .join('\n');

    const prompt =
      lang === 'id'
        ? `Berikut catatan mood & kondisi fisik beberapa hari terakhir:\n\n${descriptions}\n\nBerikan analisis pola non-diagnostik yang ringkas (tanpa mengklaim diagnosis atau hubungan sebab-akibat medis) dan 3 rekomendasi kebiasaan sehat praktis dalam Bahasa Indonesia.`
        : `Here are the recent daily mood and physical wellbeing logs:\n\n${descriptions}\n\nProvide a concise, non-diagnostic pattern reflection (do not claim medical causation or diagnosis) and 3 practical healthy habit recommendations in English.`;

    const payload = {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 1,
    };

    const response = await createChatCompletion(payload);
    const output = response.choices?.[0]?.message?.content || '';

    if (output) {
      todayCheckin.aiRecommendation = output;
      todayCheckin.aiRecommendationLang = lang;
      await todayCheckin.save();
    }

    res.json({ recommendation: output, cached: false });
  } catch (err) {
    console.error('Error in getRecommendation:', err.message);
    res.status(500).json({ message: t(lang, 'botError') });
  }
};

// Pillar 05: Voluntary shareable Wellbeing Summary for healthcare professionals
exports.getWellbeingSummary = async (req, res) => {
  const lang = resolveLanguage(req, req.currentUser);
  try {
    const [checkins, assessments] = await Promise.all([
      Checkin.find({ userId: req.userId }).sort({ date: -1 }).limit(14),
      Assessment.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(10),
    ]);

    const baseline = computeBaselineAndTrend(assessments, checkins);
    const withPhysical = checkins.filter((c) => c.physicalMetrics);

    const avg = (getter) => {
      const vals = withPhysical.map(getter).filter((v) => typeof v === 'number');
      return vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    };

    res.json({
      generatedAt: new Date().toISOString(),
      periodDays: 14,
      disclaimer:
        lang === 'id'
          ? 'Ringkasan ini disusun dari pemantauan mandiri pengguna untuk dibagikan secara sukarela kepada tenaga kesehatan. Bukan merupakan diagnosis klinis.'
          : 'This summary reflects user self-monitoring data for voluntary sharing with healthcare professionals. It is not a clinical diagnosis.',
      baseline,
      physicalAverages: {
        sleepQuality: avg((c) => c.physicalMetrics.sleepQuality),
        sleepDurationHours: avg((c) => c.physicalMetrics.sleepDurationHours),
        energyLevel: avg((c) => c.physicalMetrics.energyLevel),
        physicalActivityMinutes: avg((c) => c.physicalMetrics.physicalActivityMinutes),
        stressLevel: avg((c) => c.physicalMetrics.stressLevel),
      },
      recentAssessments: assessments.slice(0, 4).map((a) => ({
        type: a.type,
        totalScore: a.totalScore,
        severityBand: a.severityBand,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error getWellbeingSummary:', err.message);
    res.status(500).json({ message: t(lang, 'serverError') });
  }
};
