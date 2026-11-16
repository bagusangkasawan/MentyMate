const test = require('node:test');
const assert = require('node:assert/strict');

const { detectCrisisText, detectCrisisAssessment } = require('../services/crisisDetector');
const { scoreAssessment, computeBaselineAndTrend } = require('../services/scoring');
const { getCrisisProtocol } = require('../data/crisisTemplates');
const { getDefaultLanguage, resolveLanguage } = require('../utils/i18n');
const { encryptText, decryptText } = require('../utils/crypto');

test('Crisis detector triggers on EN and ID high-risk phrases without false positives', () => {
  const enHit = detectCrisisText('I feel like I want to kill myself tonight');
  assert.equal(enHit.triggered, true);
  assert.equal(enHit.severity, 'imminent');

  const idHit = detectCrisisText('rasanya pengen bunuh diri aja');
  assert.equal(idHit.triggered, true);
  assert.equal(idHit.severity, 'imminent');

  const safe = detectCrisisText('I felt stressed about my university exams today');
  assert.equal(safe.triggered, false);
});

test('PHQ-9 Item 9 and severe score trigger crisis escalation', () => {
  const item9Hit = detectCrisisAssessment({
    type: 'PHQ-9',
    totalScore: 6,
    answers: [1, 1, 1, 1, 0, 0, 0, 1, 1],
  });
  assert.equal(item9Hit.triggered, true);
  assert.equal(item9Hit.triggerType, 'phq9_item9');

  const gadSafe = detectCrisisAssessment({
    type: 'GAD-7',
    totalScore: 8,
    answers: [1, 1, 1, 1, 2, 1, 1],
  });
  assert.equal(gadSafe.triggered, false);
});

test('PHQ-9 and GAD-7 scoring computes exact totals and severity bands', () => {
  const phq = scoreAssessment('PHQ-9', [2, 2, 2, 2, 1, 1, 1, 1, 0]);
  assert.equal(phq.totalScore, 12);
  assert.equal(phq.severityBand, 'moderate');
  assert.equal(phq.item9Flag, false);

  const gad = scoreAssessment('GAD-7', [3, 3, 2, 2, 2, 2, 1]);
  assert.equal(gad.totalScore, 15);
  assert.equal(gad.severityBand, 'severe');
});

test('Baseline and trend calculation handles longitudinal check-ins and assessments', () => {
  const result = computeBaselineAndTrend(
    [{ type: 'PHQ-9', totalScore: 9 }, { type: 'GAD-7', totalScore: 7 }],
    [{ mood: 'baik' }, { mood: 'baik' }, { mood: 'baik' }, { mood: 'buruk' }, { mood: 'buruk' }]
  );
  assert.equal(result.checkinCount, 5);
  assert.equal(result.moodTrend, 'improving');
  assert.equal(result.latestPhq9, 9);
  assert.equal(result.latestGad7, 7);
});

test('Crisis templates return localized EN/ID guidance and country-specific contacts', () => {
  const idProto = getCrisisProtocol('id', 'ID');
  assert.equal(idProto.language, 'id');
  assert.ok(idProto.localContacts.some((c) => c.phone === '112'));

  const usProto = getCrisisProtocol('en', 'US');
  assert.equal(usProto.language, 'en');
  assert.ok(usProto.localContacts.some((c) => c.phone === '988'));

  const aeProto = getCrisisProtocol('en', 'AE');
  assert.equal(aeProto.language, 'en');
  assert.ok(aeProto.localContacts.some((c) => c.phone === '8001717'));
});

test('DEFAULT_LANGUAGE flag defaults to en and switches cleanly to id', () => {
  delete process.env.DEFAULT_LANGUAGE;
  assert.equal(getDefaultLanguage(), 'en');

  process.env.DEFAULT_LANGUAGE = 'id';
  assert.equal(getDefaultLanguage(), 'id');
  assert.equal(resolveLanguage({}), 'id');

  delete process.env.DEFAULT_LANGUAGE;
});

test('Field-level encryption round-trips plaintext when DATA_ENCRYPTION_KEY is set', () => {
  process.env.DATA_ENCRYPTION_KEY = 'test-secret-key-for-mentymate';
  const note = 'Private journal reflection';
  const encrypted = encryptText(note);
  assert.notEqual(encrypted, note);
  assert.ok(encrypted.startsWith('enc:v1:'));
  assert.equal(decryptText(encrypted), note);
  delete process.env.DATA_ENCRYPTION_KEY;
});
