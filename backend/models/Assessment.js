const mongoose = require('mongoose');

/**
 * Validated PHQ-9 (0-27) and GAD-7 (0-21) self-assessment record,
 * including deterministic severity band and PHQ-9 Item 9 self-harm flag.
 */
const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['PHQ-9', 'GAD-7'], required: true },
    language: { type: String, enum: ['en', 'id'], default: 'en' },
    answers: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.every((v) => Number.isInteger(v) && v >= 0 && v <= 3),
        message: 'Each answer must be an integer between 0 and 3.',
      },
    },
    totalScore: { type: Number, required: true, min: 0, max: 27 },
    severityBand: {
      type: String,
      enum: ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe'],
      required: true,
    },
    item9Flag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
