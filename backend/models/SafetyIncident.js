const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Privacy-preserving safety incident log using a one-way SHA-256 `userHash`
 * instead of raw user IDs or message content.
 */
const safetyIncidentSchema = new mongoose.Schema(
  {
    userHash: { type: String, required: false },
    source: {
      type: String,
      enum: ['chat', 'checkin', 'phq9', 'gad7'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['moderate', 'high', 'imminent'],
      required: true,
    },
    triggerType: {
      type: String,
      enum: ['keyword', 'phq9_item9', 'score_threshold'],
      required: true,
    },
    language: { type: String, enum: ['en', 'id'], default: 'en' },
    country: { type: String, default: 'ID' },
    guidanceShown: { type: Boolean, default: true },
    guidanceCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

safetyIncidentSchema.statics.hashUserId = function hashUserId(userId) {
  if (!userId) return undefined;
  return crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 24);
};

module.exports = mongoose.model('SafetyIncident', safetyIncidentSchema);
