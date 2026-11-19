const mongoose = require('mongoose');

/**
 * Daily mood and optional physical-habit check-in schema.
 * Reflection `description` is encrypted at rest via AES-256-GCM when configured,
 * and `aiRecommendation` caches daily Gemini suggestions per language.
 */
const physicalMetricsSchema = new mongoose.Schema(
  {
    sleepQuality: { type: Number, min: 1, max: 5, required: false },
    sleepDurationHours: { type: Number, min: 0, max: 24, required: false },
    energyLevel: { type: Number, min: 1, max: 5, required: false },
    physicalActivityMinutes: { type: Number, min: 0, max: 1440, required: false },
    stressLevel: { type: Number, min: 1, max: 5, required: false },
    wearableSource: {
      type: String,
      enum: ['manual', 'future_wearable'],
      default: 'manual',
    },
  },
  { _id: false }
);

const checkinSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mood: { type: String, enum: ['baik', 'sedang', 'buruk'], required: true },
  description: { type: String, default: '' },
  physicalMetrics: { type: physicalMetricsSchema, default: undefined },
  aiRecommendation: { type: String, default: '' },
  aiRecommendationLang: { type: String, default: '' },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Checkin', checkinSchema);
