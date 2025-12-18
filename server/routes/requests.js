const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// ==========================================
// LEAVE ROUTES
// ==========================================
router.post('/leave', async (req, res) => {
    const { userId, startDate, endDate, reason, isFullDay } = req.body;

    try {
        const result = await query(`
            INSERT INTO leave_requests (userId, startDate, endDate, reason, createdAt)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING *
        `, [userId, startDate, endDate, reason]);

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/leave', async (req, res) => {
    const { userId } = req.query;
    try {
        let text = `SELECT l.*, u.name as userName FROM leave_requests l JOIN users u ON l.userId = u.id`;
        const params = [];
        if (userId) {
            text += ' WHERE l.userId = $1';
            params.push(userId);
        }
        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// PERMISSION ROUTES
// ==========================================
router.post('/permission', async (req, res) => {
    const { userId, date, dateKey, startTime, endTime, reason } = req.body;
    const finalDate = date || dateKey;

    try {
        const result = await query(`
            INSERT INTO permissions (userId, date, startTime, endTime, reason, createdAt)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            RETURNING *
        `, [userId, finalDate, startTime, endTime, reason]);

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/permission', async (req, res) => {
    const { userId } = req.query;
    try {
        let text = `SELECT p.*, u.name as userName FROM permissions p JOIN users u ON p.userId = u.id`;
        const params = [];
        if (userId) {
            text += ' WHERE p.userId = $1';
            params.push(userId);
        }
        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
