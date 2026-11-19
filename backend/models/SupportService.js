const mongoose = require('mongoose');

/**
 * Localized stepped-care directory entry (helplines, primary care, clinicians)
 * with transparent bilingual eligibility and cost metadata.
 */
const supportServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'puskesmas',
        'hospital',
        'psychologist',
        'psychiatrist',
        'tele_mental_health',
        'urgent_helpline',
      ],
      required: true,
    },
    country: { type: String, required: true, uppercase: true, trim: true },
    region: { type: String, required: true, trim: true },
    languages: { type: [String], default: ['id'] },
    phone: { type: String, default: '' },
    contactUrl: { type: String, default: '' },
    isFreeOrSubsidized: { type: Boolean, default: false },
    eligibilityEn: { type: String, default: '' },
    eligibilityId: { type: String, default: '' },
    descriptionEn: { type: String, default: '' },
    descriptionId: { type: String, default: '' },
    bookingUrl: { type: String, default: '' },
    lastVerifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportService', supportServiceSchema);
