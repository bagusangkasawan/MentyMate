const mongoose = require('mongoose');
const { getDefaultLanguage } = require('../utils/i18n');

/**
 * User account schema storing authentication credentials, localization preferences,
 * optional trusted emergency contact, and granular revocable feature consents.
 */
const consentEntrySchema = new mongoose.Schema(
  {
    granted: { type: Boolean, default: false },
    updatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: false, trim: true },
    preferredLanguage: {
      type: String,
      enum: ['en', 'id'],
      default: getDefaultLanguage,
    },
    country: { type: String, default: 'ID', uppercase: true, trim: true },
    region: { type: String, default: '', trim: true },
    orgCode: { type: String, default: '', uppercase: true, trim: true },
    aiChatUsage: {
      date: { type: String, default: '' },
      count: { type: Number, default: 0 },
    },
    trustedContact: {
      name: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      relationship: { type: String, default: '', trim: true },
    },
    consents: {
      aiChat: { type: consentEntrySchema, default: () => ({ granted: false }) },
      moodTracking: { type: consentEntrySchema, default: () => ({ granted: false }) },
      selfAssessment: { type: consentEntrySchema, default: () => ({ granted: false }) },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
