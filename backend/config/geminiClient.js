require('dotenv').config();
const { GoogleGenAI, ThinkingLevel } = require('@google/genai');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

let cachedClient = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required.');
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1beta' },
    });
  }
  return cachedClient;
}

/**
 * Calls Google Gemini (@google/genai) generateContentStream with ThinkingLevel.MINIMAL
 * and Google Search grounding, returning an OpenAI-compatible response shape.
 * @param {object} params
 * @param {Array<{role: string, content: string}>} [params.messages=[]]
 * @param {number} [params.max_tokens=1024]
 * @param {number} [params.temperature=0.7]
 * @param {number} [params.top_p=1]
 * @returns {Promise<{choices: Array<{message: {content: string}}>}>}
 */
async function createChatCompletion({
  messages = [],
  max_tokens = 1024,
  temperature = 0.7,
  top_p = 1,
}) {
  const ai = getClient();

  const systemMessages = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const config = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.MINIMAL,
    },
    tools: [{ googleSearch: {} }],
    maxOutputTokens: max_tokens,
    temperature,
    topP: top_p,
    ...(systemMessages ? { systemInstruction: systemMessages } : {}),
  };

  const response = await ai.models.generateContentStream({
    model: DEFAULT_MODEL,
    config,
    contents,
  });

  let fullText = '';
  for await (const chunk of response) {
    if (chunk.text) {
      fullText += chunk.text;
    }
  }

  return {
    choices: [
      {
        message: {
          content: fullText.trim(),
        },
      },
    ],
  };
}

module.exports = { createChatCompletion, DEFAULT_MODEL };
