const { createChatCompletion } = require('../config/bytePlusClient');

exports.chatWithBot = async (req, res) => {
  const { message } = req.body;

  // Validasi input
  if (!message) {
    return res.status(400).json({ error: 'Message wajib diisi.' });
  }

  try {
    const systemPrompt = "Kamu adalah asisten kesehatan mental yang bernama 'MentyMate'. Berikan jawaban yang membantu, penuh empati, dan ringkas dalam bahasa Indonesia.";

    // Menyiapkan payload sesuai format yang dibutuhkan oleh createChatCompletion
    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1024,
      temperature: 1,
      top_p: 1,
    };
    
    // Memanggil fungsi dari bytePlusClient
    const response = await createChatCompletion(payload);

    // Struktur respons dari BytePlus sama dengan OpenAI, jadi bagian ini tidak berubah
    const botReply = response.choices[0]?.message?.content?.trim();

    if (!botReply) {
        return res.status(500).json({ error: 'Gagal mendapatkan respons dari bot.' });
    }

    res.json({ reply: botReply });

  } catch (error) {
    console.error('Terjadi kesalahan di controller chatWithBot: ', error.message);
    res.status(500).json({ error: 'Gagal berkomunikasi dengan chatbot.' });
  }
};
