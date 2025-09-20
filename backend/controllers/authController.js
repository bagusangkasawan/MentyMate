const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, phone } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username sudah terdaftar.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      phone
    });

    await user.save();
    res.status(201).json({ message: 'User berhasil didaftarkan.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Username atau password salah.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error getMe:', err.message);
    res.status(500).json({ message: 'Gagal mengambil data user.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, password, phone } = req.body;
    const updates = {};

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    if (username) updates.username = username;

    if (password) {
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: 'Password baru harus berbeda dari password saat ini.' });
      }
      const hashed = await bcrypt.hash(password, 10);
      updates.password = hashed;
    }
    
    if (phone) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Tidak ada data untuk diperbarui.' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json({ message: 'Profil berhasil diperbarui', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui profil.' });
  }
};
