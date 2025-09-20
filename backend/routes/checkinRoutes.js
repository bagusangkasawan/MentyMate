const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { checkin, getCheckins, getRecommendation } = require('../controllers/checkinController');

/**
 * @swagger
 * tags:
 *   name: Checkin
 *   description: Daily mood check-ins and recommendations
 */

/**
 * @swagger
 * /checkin:
 *   post:
 *     summary: Submit daily mood check-in
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood
 *               - description
 *             properties:
 *               mood:
 *                 type: string
 *                 enum: [baik, sedang, buruk]
 *               description:
 *                 type: string
 *                 example: "Hari ini aku merasa cukup lelah karena banyak tugas."
 *     responses:
 *       201:
 *         description: Check-in berhasil disimpan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Check-in berhasil disimpan"
 *       400:
 *         description: Check-in sudah dilakukan hari ini
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Check-in sudah dilakukan hari ini"
 *       401:
 *         description: Unauthorized, token tidak valid atau tidak ada
 *       500:
 *         description: Terjadi kesalahan server
 */

/**
 * @swagger
 * /checkin:
 *   get:
 *     summary: Get all check-ins of the user
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of check-ins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64f1d2b8c1a9d34f7a123456"
 *                   userId:
 *                     type: string
 *                     example: "64f1d2b8c1a9d34f7a789012"
 *                   mood:
 *                     type: string
 *                     example: "sedang"
 *                   description:
 *                     type: string
 *                     example: "Hari ini lebih baik dari kemarin"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-09-09T10:30:00.000Z"
 *       500:
 *         description: Terjadi kesalahan server
 */

/**
 * @swagger
 * /checkin/recommendation:
 *   get:
 *     summary: Analisis mood & rekomendasi aktivitas (BytePlus LLM)
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hasil analisis mood & rekomendasi aktivitas dari BytePlus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendation:
 *                   type: string
 *                   example: |
 *                     Berdasarkan catatan mood 3 hari terakhir, emosimu cenderung fluktuatif.
 *                     Rekomendasi aktivitas:
 *                     - Luangkan waktu 10-15 menit untuk meditasi atau pernapasan dalam.
 *                     - Coba aktivitas fisik ringan seperti jalan santai.
 *                     - Ceritakan perasaanmu pada orang terdekat agar tidak menumpuk.
 *       400:
 *         description: Belum ada check-in, sistem tidak bisa memberi rekomendasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Belum ada check-in"
 *       500:
 *         description: Terjadi kesalahan internal atau gagal komunikasi dengan BytePlus
 */

router.post('/', authMiddleware, checkin);
router.get('/', authMiddleware, getCheckins);
router.get('/recommendation', authMiddleware, getRecommendation);

module.exports = router;
