const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const chatRoutes = require('./routes/chatRoutes');
const setupSwagger = require('./swagger');

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// CORS hanya izinkan origin dari env
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Global limiter: 100 request / 15 menit per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: "Terlalu banyak request, coba lagi nanti." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Terapkan limiter ke semua endpoint /api/*
app.use('/api', apiLimiter);

// Middleware
app.use(express.json());
setupSwagger(app);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    const { name } = mongoose.connection;
    console.log(`MongoDB connected database: ${name}`);
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/chat', chatRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
