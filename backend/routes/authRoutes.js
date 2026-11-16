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
  trustedContact: z
    .object({
      name: z.string().trim().max(80).optional(),
      phone: z.string().trim().max(24).optional(),
      relationship: z.string().trim().max(40).optional(),
    })
    .optional(),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', auth, authController.getMe);
router.put('/update-profile', auth, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
