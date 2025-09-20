const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { chatWithBot } = require('../controllers/chatController');

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Interact with the AI chatbot using BytePlus
 */

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Send a message to the chatbot (BytePlus)
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message from the user to the chatbot
 *                 example: "I am feeling stressed, what should I do?"
 *     responses:
 *       200:
 *         description: Response from the BytePlus chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "I understand that you are feeling stressed. Please tell me more."
 *       400:
 *         description: Bad request, message must not be empty
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       500:
 *         description: Internal server error or failed communication with BytePlus
 */

router.post('/', authMiddleware, chatWithBot);

module.exports = router;
