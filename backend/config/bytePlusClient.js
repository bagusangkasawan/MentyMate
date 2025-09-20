require('dotenv').config();
const axios = require('axios');

// Konfigurasi terpusat untuk BytePlus dari environment variables
const endpoint = process.env.BYTEPLUS_ENDPOINT || 'https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions';
const apiKey = process.env.BYTEPLUS_API_KEY;
const model = process.env.BYTEPLUS_MODEL;

// Validasi untuk memastikan variabel environment telah diatur
if (!apiKey || !model) {
  throw new Error('Variabel environment BYTEPLUS_API_KEY dan BYTEPLUS_MODEL harus diatur.');
}

/**
 * Memanggil API chat completion dari BytePlus.
 * @param {Object} payload - Payload yang akan dikirim ke API, berisi 'messages' dan parameter lainnya.
 * @returns {Promise<Object>} - Data respons dari API.
 */
const createChatCompletion = async (payload) => {
  const apiPayload = {
    model,
    ...payload,
  };

  try {
    const response = await axios.post(endpoint, apiPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    // Axios meletakkan respons body di dalam properti 'data'
    return response.data;
  } catch (error) {
    // Memberikan log error yang lebih detail jika respons error diterima dari API
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Error with BytePlus API:', errorMessage);
    throw new Error(`Gagal berkomunikasi dengan BytePlus API: ${errorMessage}`);
  }
};

module.exports = { createChatCompletion };
