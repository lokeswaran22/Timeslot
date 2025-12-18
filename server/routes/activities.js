const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { logActivityHistory } = require('../utils/auditLogger');

// ==========================================
// ACTIVITIES ROUTES
// ==========================================
router.get('/activities', async (req, res) => {
    const { dateKey, userId } = req.query;
    let text = 'SELECT * FROM activities WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (dateKey) {
        text += ` AND dateKey = $${paramCount}`;
        params.push(dateKey);
        paramCount++;
    }

    if (userId) {
        text += ` AND userId = $${paramCount}`;
        params.push(userId);
    }

    text += ' ORDER BY id';

    try {
        const result = await query(text, params);

        // Group activities by dateKey, userId, and timeSlot
        const activities = {};
        result.rows.forEach(row => {
            if (!activities[row.datekey]) activities[row.datekey] = {};
            if (!activities[row.datekey][row.userid]) activities[row.datekey][row.userid] = {};
            if (!activities[row.datekey][row.userid][row.timeslot]) {
                activities[row.datekey][row.userid][row.timeslot] = [];
            }
            activities[row.datekey][row.userid][row.timeslot].push({
                id: row.id,
                type: row.type,
                description: row.description,
                totalPages: row.totalpages,
                pagesDone: row.pagesdone,
                timestamp: row.timestamp
            });
        });

        res.json(activities);
    } catch (err) {
        console.error('Get activities error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/activities', async (req, res) => {
    const { dateKey, userId, employeeId, timeSlot, type, description, totalPages, pagesDone, timestamp, editedBy } = req.body;
    const finalUserId = userId || employeeId;

    try {
        // Insert new activity
        const result = await query(`
            INSERT INTO activities (dateKey, userId, timeSlot, type, description, totalPages, pagesDone, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [dateKey, finalUserId, timeSlot, type, description || '', totalPages || '0', pagesDone || '0', timestamp || new Date().toISOString()]);

        const newId = result.rows[0].id;

        // Audit Log
        const newData = { id: newId, userId: finalUserId, dateKey, timeSlot, type, description, pagesDone };
        await logActivityHistory(finalUserId, 'CREATE', editedBy, dateKey, timeSlot, null, newData, req);

        res.json({ status: 'saved', id: newId });
    } catch (err) {
        console.error('Save activity error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/activities', async (req, res) => {
    const { dateKey, userId, employeeId, timeSlot, editedBy } = req.body;
    const finalUserId = userId || employeeId;

    try {
        // Fetch old data for audit log before deletion
        const oldRowsResult = await query('SELECT * FROM activities WHERE dateKey = $1 AND userId = $2 AND timeSlot = $3', [dateKey, finalUserId, timeSlot]);
        const oldRows = oldRowsResult.rows;

        await query(`
            DELETE FROM activities 
            WHERE dateKey = $1 AND userId = $2 AND timeSlot = $3
        `, [dateKey, finalUserId, timeSlot]);

        // Audit Log
        if (oldRows.length > 0) {
            for (const row of oldRows) {
                await logActivityHistory(finalUserId, 'DELETE', editedBy, dateKey, timeSlot, row, null, req);
            }
        }

        res.json({ message: 'Activity cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// LEGACY ACTIVITY LOG ROUTES
// ==========================================
router.get('/activity-log', async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const date = req.query.date;

    try {
        let text = 'SELECT * FROM activity_log';
        const params = [];

        if (date) {
            text += ' WHERE dateKey = $1';
            params.push(date);
        }

        text += ' ORDER BY id DESC LIMIT $' + (params.length + 1);
        params.push(limit);

        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/activity-log', async (req, res) => {
    const { employeeName, activityType, description, timeSlot, action, editedBy, timestamp, dateKey } = req.body;

    try {
        await query(`
            INSERT INTO activity_log (dateKey, employeeName, activityType, description, timeSlot, action, editedBy, timestamp, createdAt)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        `, [dateKey, employeeName, activityType, description, timeSlot, action, editedBy || 'System', timestamp || new Date().toISOString()]);
        res.json({ status: 'logged' });
    } catch (err) {
        console.error('Activity log error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/activity-log', async (req, res) => {
    try {
        const result = await query('DELETE FROM activity_log');
        res.json({ message: 'Activity log cleared', changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
