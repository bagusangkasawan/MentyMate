/**
 * MentyMate Express 5 API application.
 * Configures security headers (Helmet), multi-origin CORS, rate limiting,
 * bilingual i18n routes, and auto-seeded local support directory on MongoDB connect.
 */
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

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Health check and active default language flag
 *     security: []
 *     responses:
 *       200:
 *         description: Service health status
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    defaultLanguage: getDefaultLanguage(),
    supportedLanguages: ['en', 'id'],
  });
});

// Serverless-safe cached MongoDB connection on globalThis (awaited per request before DB routes)
/**
 * Ensures MongoDB is connected before handling database-backed requests in serverless environments.
 * Reconnects automatically if a frozen serverless container lost its socket.
 * @returns {Promise<void>}
 */
async function ensureDbConnected() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not configured.');
  }

  if (mongoose.connection.readyState === 1) return;

  if (mongoose.connection.readyState !== 2) {
    globalThis.__mentymateDbPromise = null;
  }

  if (!globalThis.__mentymateDbPromise) {
    globalThis.__mentymateDbPromise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 5,
        minPoolSize: 1,
      })
      .catch((err) => {
        globalThis.__mentymateDbPromise = null;
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  await globalThis.__mentymateDbPromise;
}

const requireDb = async (req, res, next) => {
  try {
    await ensureDbConnected();
    next();
  } catch {
    res.status(503).json({ error: t(resolveLanguage(req), 'serverError') });
  }
};

// Routes (DB-backed)
app.use('/api/auth', requireDb, authRoutes);
app.use('/api/checkin', requireDb, checkinRoutes);
app.use('/api/chat', requireDb, chatRoutes);
app.use('/api/assessments', requireDb, assessmentRoutes);
app.use('/api/support', requireDb, supportRoutes);
app.use('/api/privacy', requireDb, privacyRoutes);
app.use('/api/analytics', requireDb, analyticsRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (default lang: ${getDefaultLanguage()})`));
}

module.exports = app;
