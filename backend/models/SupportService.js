const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportService', supportServiceSchema);
