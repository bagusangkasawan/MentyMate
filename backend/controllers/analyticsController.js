const AnalyticsEvent = require('../models/AnalyticsEvent');
const SafetyIncident = require('../models/SafetyIncident');
const Assessment = require('../models/Assessment');
const { resolveLanguage, t } = require('../utils/i18n');

exports.recordEvent = async (req, res) => {
  const { eventType, language, country, metadata } = req.body;
  const lang = language || resolveLanguage(req);

  try {
    const event = await AnalyticsEvent.create({
      eventType,
      language: lang,
      country: (country || 'ID').toUpperCase(),
      metadata,
    });
    res.status(201).json({ id: event._id, recorded: true });
  } catch (err) {
    res.status(500).json({ error: t(lang, 'serverError') });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const [eventCounts, langCounts, countryCounts, safetySummary, multiAssessments] =
      await Promise.all([
        AnalyticsEvent.aggregate([{ $group: { _id: '$eventType', count: { $sum: 1 } } }]),
        AnalyticsEvent.aggregate([{ $group: { _id: '$language', count: { $sum: 1 } } }]),
        AnalyticsEvent.aggregate([{ $group: { _id: '$country', count: { $sum: 1 } } }]),
        SafetyIncident.aggregate([
          {
            $group: {
              _id: null,
              totalIncidents: { $sum: 1 },
              guidanceShown: { $sum: { $cond: ['$guidanceShown', 1, 0] } },
              guidanceCompleted: { $sum: { $cond: ['$guidanceCompleted', 1, 0] } },
            },
          },
        ]),
        Assessment.aggregate([
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: { userId: '$userId', type: '$type' },
              firstScore: { $first: '$totalScore' },
              latestScore: { $last: '$totalScore' },
              count: { $sum: 1 },
            },
          },
          { $match: { count: { $gte: 2 } } },
        ]),
      ]);

    const byType = Object.fromEntries(eventCounts.map((e) => [e._id, e.count]));
    const byLanguage = Object.fromEntries(langCounts.map((l) => [l._id, l.count]));
    const byCountry = Object.fromEntries(
      countryCounts.filter((c) => c._id).map((c) => [c._id, c.count])
    );

    const safety = safetySummary[0] || {
      totalIncidents: 0,
      guidanceShown: 0,
      guidanceCompleted: 0,
    };

    const improvedUsers = multiAssessments.filter((a) => a.latestScore < a.firstScore).length;
    const avgScoreDelta =
      multiAssessments.length > 0
        ? Number(
            (
              multiAssessments.reduce((acc, a) => acc + (a.firstScore - a.latestScore), 0) /
              multiAssessments.length
            ).toFixed(1)
          )
        : 0;

    const screeningStarted = byType.screening_started || 0;
    const screeningCompleted = byType.screening_completed || 0;

    res.json({
      outcomes: {
        screeningStarted,
        screeningCompleted,
        screeningCompletionRate:
          screeningStarted > 0
            ? Math.min(100, Math.round((screeningCompleted / screeningStarted) * 100))
            : 100,
        checkinSubmitted: byType.checkin_submitted || 0,
        activityUsed: byType.activity_used || 0,
        directoryViewed: byType.directory_viewed || 0,
        referralFollowupConfirmed: byType.referral_followup_confirmed || 0,
        symptomImprovement: {
          trackedPairs: multiAssessments.length,
          improvedRate:
            multiAssessments.length > 0
              ? Math.round((improvedUsers / multiAssessments.length) * 100)
              : 0,
          avgPointReduction: avgScoreDelta,
        },
      },
      safety: {
        totalIncidents: safety.totalIncidents,
        guidanceShown: safety.guidanceShown,
        guidanceCompleted: safety.guidanceCompleted,
        guidanceCompletionRate:
          safety.guidanceShown > 0
            ? Math.round((safety.guidanceCompleted / safety.guidanceShown) * 100)
            : 100,
      },
      languageAccessibility: {
        en: byLanguage.en || 0,
        id: byLanguage.id || 0,
      },
      geographyFairness: byCountry,
    });
  } catch (err) {
    console.error('Error getSummary:', err.message);
    res.status(500).json({ error: t(resolveLanguage(req), 'serverError') });
  }
};
