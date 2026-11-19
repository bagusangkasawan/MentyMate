const SafetyIncident = require('../models/SafetyIncident');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { getCrisisProtocol } = require('../data/crisisTemplates');

const IMMINENT_PATTERNS = [
  // English
  /\b(kill myself|end my life|suicide|suicidal|want to die|wanna die|better off dead|take my own life)\b/i,
  /\b(cut myself|cutting myself|self[- ]?harm|hurt myself|overdose)\b/i,
  // Bahasa Indonesia
  /\b(bunuh diri|mengakhiri hidup|pengen mati|ingin mati|mau mati|lebih baik mati|nyakitin diri|melukai diri|sayat tangan|minum racun)\b/i,
];

const HIGH_RISK_PATTERNS = [
  /\b(no reason to live|can'?t go on|hopeless|give up on life|nobody cares if i die)\b/i,
  /\b(tidak ada harapan|nggak kuat lagi|ga kuat lagi|putus asa|hidup nggak ada artinya|lebih baik menghilang)\b/i,
];

/**
 * Deterministically inspects text for crisis signals (EN & ID).
 * @param {string} text
 * @returns {{ triggered: boolean, severity: 'imminent' | 'high' | null, triggerType: 'keyword' | null }}
 */
function detectCrisisText(text) {
  if (!text || typeof text !== 'string') {
    return { triggered: false, severity: null, triggerType: null };
  }

  for (const pattern of IMMINENT_PATTERNS) {
    if (pattern.test(text)) {
      return { triggered: true, severity: 'imminent', triggerType: 'keyword' };
    }
  }

  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(text)) {
      return { triggered: true, severity: 'high', triggerType: 'keyword' };
    }
  }

  return { triggered: false, severity: null, triggerType: null };
}

/**
 * Checks PHQ-9 / GAD-7 assessment outputs for crisis escalation triggers.
 * @param {object} params
 * @param {'PHQ-9' | 'GAD-7'} params.type
 * @param {number} params.totalScore
 * @param {number[]} params.answers
 * @returns {{ triggered: boolean, severity: 'imminent' | 'high' | 'moderate' | null, triggerType: 'phq9_item9' | 'score_threshold' | null }}
 */
function detectCrisisAssessment({ type, totalScore, answers }) {
  if (type === 'PHQ-9') {
    const item9 = Array.isArray(answers) ? Number(answers[8] || 0) : 0;
    if (item9 > 0) {
      return {
        triggered: true,
        severity: item9 >= 2 ? 'imminent' : 'high',
        triggerType: 'phq9_item9',
      };
    }
    if (totalScore >= 20) {
      return { triggered: true, severity: 'high', triggerType: 'score_threshold' };
    }
  }

  if (type === 'GAD-7' && totalScore >= 15) {
    return { triggered: true, severity: 'moderate', triggerType: 'score_threshold' };
  }

  return { triggered: false, severity: null, triggerType: null };
}

/**
 * Shared helper to log a minimized SafetyIncident, emit analytics, and return the crisis protocol.
 * @param {object} params
 * @param {string} params.userId
 * @param {'chat' | 'checkin' | 'phq9' | 'gad7'} params.source
 * @param {'imminent' | 'high' | 'moderate'} params.severity
 * @param {'keyword' | 'phq9_item9' | 'score_threshold'} params.triggerType
 * @param {'en' | 'id'} params.language
 * @param {string} params.country
 * @returns {Promise<{ crisisProtocol: object, incidentId: any }>}
 */
async function recordCrisisEscalation({ userId, source, severity, triggerType, language, country }) {
  const crisisProtocol = getCrisisProtocol(language, country);
  const incident = await SafetyIncident.create({
    userHash: SafetyIncident.hashUserId(userId),
    source,
    severity,
    triggerType,
    language,
    country,
    guidanceShown: true,
    guidanceCompleted: false,
  });

  await AnalyticsEvent.create({
    eventType: 'crisis_guidance_viewed',
    language,
    country,
  }).catch(() => {});

  return { crisisProtocol, incidentId: incident._id };
}

module.exports = { detectCrisisText, detectCrisisAssessment, recordCrisisEscalation };
