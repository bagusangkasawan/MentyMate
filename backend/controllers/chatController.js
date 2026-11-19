/**
 * AI Companion chat controller with pre-LLM deterministic crisis interception
 * and localized human crisis protocol endpoints.
 */
const { createChatCompletion } = require('../config/geminiClient');
const User = require('../models/User');
const SafetyIncident = require('../models/SafetyIncident');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { detectCrisisText, recordCrisisEscalation } = require('../services/crisisDetector');
const { resolveLanguage, t } = require('../utils/i18n');

const DAILY_CHAT_LIMIT = 15;

/**
 * Evaluates and increments a user's daily AI Companion message quota (UTC day).
 * @param {{ date?: string, count?: number } | undefined} usage
 * @param {string} [todayDate]
 * @returns {{ allowed: boolean, nextUsage: { date: string, count: number }, limit: number, remaining: number }}
 */
function evaluateDailyChatQuota(usage, todayDate = new Date().toISOString().slice(0, 10)) {
  const currentCount = usage?.date === todayDate ? Number(usage.count || 0) : 0;
  if (currentCount >= DAILY_CHAT_LIMIT) {
    return {
      allowed: false,
      nextUsage: { date: todayDate, count: currentCount },
      limit: DAILY_CHAT_LIMIT,
      remaining: 0,
    };
  }
  const nextCount = currentCount + 1;
  return {
    allowed: true,
    nextUsage: { date: todayDate, count: nextCount },
    limit: DAILY_CHAT_LIMIT,
    remaining: Math.max(0, DAILY_CHAT_LIMIT - nextCount),
  };
}

exports.DAILY_CHAT_LIMIT = DAILY_CHAT_LIMIT;
exports.evaluateDailyChatQuota = evaluateDailyChatQuota;

/**
 * Builds the non-clinical preventive wellbeing system prompt for the active language.
 * @param {'en' | 'id'} lang
 * @returns {string}
 */
function buildSystemPrompt(lang) {
  if (lang === 'id') {
    return (
      "Kamu adalah asisten dukungan kesejahteraan mental preventif bernama 'MentyMate'. " +
      'Berikan respons yang empatik, tenang, terstruktur, dan ringkas dalam Bahasa Indonesia. ' +
      'Jangan pernah mendiagnosis kondisi medis/psikiatri, jangan meresepkan obat, dan jangan mengklaim sebagai tenaga klinis. ' +
      'Jika pengguna tampak tertekan, dorong mereka untuk menggunakan langkah perawatan diri yang aman atau menghubungi profesional/orang tepercaya.'
    );
  }
  return (
    "You are 'MentyMate', a preventive mental wellbeing companion. " +
    'Respond with empathy, clarity, and conciseness in English. ' +
    'Never diagnose medical or psychiatric conditions, never prescribe medication, and never claim to be a clinician. ' +
    'Encourage safe self-care steps and human professional or trusted-person support when needed.'
  );
}

exports.chatWithBot = async (req, res) => {
  const { message } = req.body;
  const user = req.currentUser;
  const lang = resolveLanguage(req, user);
  const country = user?.country || 'ID';

  if (!message || !message.trim()) {
    return res.status(400).json({ error: t(lang, 'messageRequired') });
  }

  try {
    // Pillar 03: Deterministic safety gate BEFORE LLM call
    const crisisCheck = detectCrisisText(message);
    if (crisisCheck.triggered) {
      const { crisisProtocol, incidentId } = await recordCrisisEscalation({
        userId: req.userId,
        source: 'chat',
        severity: crisisCheck.severity,
        triggerType: crisisCheck.triggerType,
        language: lang,
        country,
      });

      return res.json({
        reply: crisisProtocol.chatReply,
        isCrisis: true,
        incidentId,
        crisisProtocol,
      });
    }

    // Enforce daily AI quota after deterministic crisis check so safety escalations are never blocked.
    const quotaResult = evaluateDailyChatQuota(user?.aiChatUsage);
    if (!quotaResult.allowed) {
      return res.status(429).json({
        code: 'CHAT_QUOTA_EXCEEDED',
        error: t(lang, 'chatQuotaExceeded'),
        message: t(lang, 'chatQuotaExceeded'),
        quota: { limit: quotaResult.limit, remaining: 0 },
      });
    }

    const payload = {
      messages: [
        { role: 'system', content: buildSystemPrompt(lang) },
        { role: 'user', content: message.trim() },
      ],
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 1,
    };

    const response = await createChatCompletion(payload);
    const botReply = response.choices?.[0]?.message?.content?.trim();

    if (!botReply) {
      return res.status(500).json({ error: t(lang, 'botError') });
    }

    await User.findByIdAndUpdate(req.userId, { aiChatUsage: quotaResult.nextUsage }).catch(() => {});

    res.json({
      reply: botReply,
      isCrisis: false,
      quota: { limit: quotaResult.limit, remaining: quotaResult.remaining },
    });
  } catch (error) {
    console.error('Error in chatWithBot:', error.message);
    res.status(500).json({ error: t(lang, 'botError') });
  }
};

exports.acknowledgeCrisisGuidance = async (req, res) => {
  const { incidentId } = req.body;
  const lang = resolveLanguage(req, req.currentUser);
  const country = req.currentUser?.country || 'ID';

  try {
    if (incidentId) {
      await SafetyIncident.findByIdAndUpdate(incidentId, { guidanceCompleted: true });
    }
    await AnalyticsEvent.create({
      eventType: 'crisis_guidance_completed',
      language: lang,
      country,
    }).catch(() => {});

    res.json({ acknowledged: true });
  } catch (error) {
    console.error('Error acknowledging crisis guidance:', error.message);
    res.status(500).json({ error: t(lang, 'serverError') });
  }
};
