const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const chatRoutes = require('./routes/chatRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const supportRoutes = require('./routes/supportRoutes');
const privacyRoutes = require('./routes/privacyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const setupSwagger = require('./swagger');
const { ensureSupportServicesSeeded } = require('./data/seedSupportServices');
const { getDefaultLanguage, resolveLanguage, t } = require('./utils/i18n');

dotenv.config();

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is required in production.');
  process.exit(1);
}

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: (req) => ({ error: t(resolveLanguage(req), 'rateLimitExceeded') }),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use(express.json({ limit: '100kb' }));
setupSwagger(app);

// Health & config endpoint (exposes default language flag)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    defaultLanguage: getDefaultLanguage(),
    supportedLanguages: ['en', 'id'],
  });
});

// MongoDB connection
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, {})
    .then(async () => {
      const { name } = mongoose.connection;
      console.log(`MongoDB connected database: ${name}`);
      await ensureSupportServicesSeeded();
    })
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (default lang: ${getDefaultLanguage()})`));
}

module.exports = app;
