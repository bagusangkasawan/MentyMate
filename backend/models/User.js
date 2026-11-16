const mongoose = require('mongoose');
const { getDefaultLanguage } = require('../utils/i18n');

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
