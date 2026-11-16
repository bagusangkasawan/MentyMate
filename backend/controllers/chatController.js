const { createChatCompletion } = require('../config/geminiClient');
const SafetyIncident = require('../models/SafetyIncident');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { detectCrisisText, recordCrisisEscalation } = require('../services/crisisDetector');
const { resolveLanguage, t } = require('../utils/i18n');

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

    res.json({ reply: botReply, isCrisis: false });
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
