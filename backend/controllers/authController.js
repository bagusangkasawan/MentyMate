/**
 * Authentication and user localization/emergency-contact profile controller.
 */
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDefaultLanguage, resolveLanguage, t } = require('../utils/i18n');

/**
 * Registers a new user with bcrypt-hashed password and default language/country preferences.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
exports.register = async (req, res) => {
  const { username, password, phone, preferredLanguage, country, region, orgCode } = req.body;
  const lang = preferredLanguage || resolveLanguage(req);

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: t(lang, 'usernameExists') });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      phone: phone || undefined,
      preferredLanguage: preferredLanguage || getDefaultLanguage(),
      country: (country || 'ID').toUpperCase(),
      region: region || '',
      orgCode: (orgCode || '').toUpperCase(),
    });

    await user.save();
    res.status(201).json({ message: t(lang, 'userCreated') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: t(lang, 'serverError') });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const lang = resolveLanguage(req);
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: t(lang, 'userNotFound') });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: t(lang, 'invalidCredentials') });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      token,
      preferredLanguage: user.preferredLanguage,
      country: user.country,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: t(lang, 'serverError') });
  }
};

exports.getMe = async (req, res) => {
  const lang = resolveLanguage(req);
  try {
    const user = await User.findById(req.userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: t(lang, 'userNotFound') });
    }
    res.json(user);
  } catch (err) {
    console.error('Error getMe:', err.message);
    res.status(500).json({ message: t(lang, 'serverError') });
  }
};

exports.updateProfile = async (req, res) => {
  const lang = resolveLanguage(req);
  try {
    const { username, password, phone, preferredLanguage, country, region, orgCode, trustedContact } = req.body;
    const updates = {};

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: t(lang, 'userNotFound') });

    if (username) updates.username = username;

    if (password) {
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: t(lang, 'samePassword') });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    if (phone !== undefined) updates.phone = phone;
    if (preferredLanguage) updates.preferredLanguage = preferredLanguage;
    if (country) updates.country = country.toUpperCase();
    if (region !== undefined) updates.region = region;
    if (orgCode !== undefined) updates.orgCode = orgCode.toUpperCase();
    if (trustedContact) updates.trustedContact = trustedContact;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: t(lang, 'noUpdates') });
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json({ message: t(updatedUser.preferredLanguage || lang, 'profileUpdated'), user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: t(lang, 'serverError') });
  }
};
