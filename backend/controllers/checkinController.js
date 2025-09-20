require('dotenv').config();
const Checkin = require('../models/Checkin');
const { createChatCompletion } = require('../config/bytePlusClient');

exports.checkin = async (req, res) => {
  const { mood, description } = req.body;
  const userId = req.userId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existingCheckin = await Checkin.findOne({
      userId,
      date: { $gte: today },
    });

    if (existingCheckin) {
      return res.status(400).json({ message: 'Check-in sudah dilakukan hari ini.' });
    }

    const checkin = new Checkin({ userId, mood, description });
    await checkin.save();

    res.status(201).json({ message: 'Check-in berhasil disimpan.' });
  } catch (err) {
    console.error('Error saat check-in:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

exports.getCheckins = async (req, res) => {
  try {
    const checkins = await Checkin.find({ userId: req.userId }).sort({ date: -1 });
    res.json(checkins);
  } catch (err) {
    console.error('Error getCheckins:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Fungsi ini diperbarui untuk menggunakan BytePlus
exports.getRecommendation = async (req, res) => {
  try {
    const recentCheckins = await Checkin.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(3);

    if (recentCheckins.length === 0) {
      return res.status(400).json({ message: 'Belum ada check-in.' });
    }

    const descriptions = recentCheckins
      .map(c => `Tanggal: ${c.date.toDateString()}, Mood: ${c.mood}, Deskripsi: ${c.description}`)
      .join('\n');

    const prompt = `Berikut catatan mood harianmu 3 hari terakhir:\n\n${descriptions}\n\nBerdasarkan data tersebut, berikan analisis singkat tentang kondisi emosionalmu dan rekomendasi aktivitas yang sesuai. Jawab dengan singkat dalam bentuk paragraf dan poin-poin jika perlu.`;

    // Menyiapkan payload untuk fungsi createChatCompletion
    const payload = {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 1,
      top_p: 1,
    };

    // Memanggil fungsi dari bytePlusClient
    const response = await createChatCompletion(payload);

    // Struktur respons sama, jadi bagian ini tidak berubah
    const output = response.choices[0].message.content;
    res.json({ recommendation: output });
  } catch (err) {
    console.error('Terjadi kesalahan pada getRecommendation:', err.message );
    res.status(500).json({ message: 'Maaf, terjadi kesalahan saat memproses rekomendasi.' });
  }
};
