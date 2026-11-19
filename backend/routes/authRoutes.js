/**
 * Authentication and profile preference routes (/api/auth).
 */
const express = require('express');
const { z } = require('zod');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const registerSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(128),
  phone: z.string().trim().max(24).optional(),
  preferredLanguage: z.enum(['en', 'id']).optional(),
  country: z.string().trim().min(2).max(10).optional(),
  region: z.string().trim().max(80).optional(),
  orgCode: z.string().trim().max(32).regex(/^[a-zA-Z0-9_-]*$/).optional(),
});

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  username: z.string().trim().min(3).max(50).optional(),
  password: z.string().min(6).max(128).optional(),
  phone: z.string().trim().max(24).optional(),
  preferredLanguage: z.enum(['en', 'id']).optional(),
  country: z.string().trim().min(2).max(10).optional(),
  region: z.string().trim().max(80).optional(),
  orgCode: z.string().trim().max(32).regex(/^[a-zA-Z0-9_-]*$/).optional(),
  trustedContact: z
    .object({
      name: z.string().trim().max(80).optional(),
      phone: z.string().trim().max(24).optional(),
      relationship: z.string().trim().max(40).optional(),
    })
    .optional(),
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, minLength: 3, maxLength: 50 }
 *               password: { type: string, minLength: 6, maxLength: 128 }
 *               phone: { type: string }
 *               preferredLanguage: { type: string, enum: [en, id] }
 *               country: { type: string, example: ID }
 *               region: { type: string }
 *     responses:
 *       201: { description: User registered }
 *       400: { description: Validation error or username exists }
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in and receive a JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: JWT token and preferredLanguage }
 *       400: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get authenticated user profile
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
router.get('/me', auth, authController.getMe);

/**
 * @openapi
 * /api/auth/update-profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update locale, country, region, password, or trusted contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Updated profile }
 */
router.put('/update-profile', auth, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
