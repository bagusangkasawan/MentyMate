const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'screening_started',
        'screening_completed',
        'checkin_submitted',
        'activity_used',
        'directory_viewed',
        'referral_followup_confirmed',
        'crisis_guidance_viewed',
        'crisis_guidance_completed',
      ],
      required: true,
    },
    language: { type: String, enum: ['en', 'id'], default: 'en' },
    country: { type: String, default: 'ID', uppercase: true },
    metadata: {
      instrument: { type: String, required: false },
      category: { type: String, required: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
