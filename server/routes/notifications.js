const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { TIME_SLOTS } = require('../utils/constants');

// ==========================================
// NOTIFICATION & REMINDER SYSTEM
// ==========================================

// Get employees who haven't filled timesheet for a date
router.get('/missing-timesheet', async (req, res) => {
    const { dateKey } = req.query;
    if (!dateKey) return res.status(400).json({ error: 'dateKey required' });

    try {
        // Get all employees (not admins)
        const employeesResult = await query('SELECT id, name, email FROM users WHERE role != $1', ['admin']);
        const employees = employeesResult.rows;

        // Get activities for the date
        const activitiesResult = await query('SELECT userId, timeSlot FROM activities WHERE dateKey = $1', [dateKey]);
        const activities = activitiesResult.rows;

        // Build a map of what's filled
        const filledMap = {};
        activities.forEach(a => {
            if (!filledMap[a.userid]) filledMap[a.userid] = new Set();
            filledMap[a.userid].add(a.timeslot);
        });

        // Find employees with missing slots
        const missingData = employees.map(emp => {
            const filled = filledMap[emp.id] || new Set();
            const missing = TIME_SLOTS.filter(slot => !filled.has(slot));
            return {
                id: emp.id,
                name: emp.name,
                email: emp.email,
                missingSlots: missing,
                missingCount: missing.length,
                filledCount: TIME_SLOTS.length - missing.length,
                isComplete: missing.length === 0
            };
        }).filter(emp => emp.missingCount > 0);

        res.json({
            dateKey,
            totalEmployees: employees.length,
            employeesWithMissing: missingData.length,
            employees: missingData
        });
    } catch (err) {
        console.error('Missing timesheet check error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Send reminder to specific employee(s)
router.post('/send-reminder', async (req, res) => {
    const { userIds, dateKey, message } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'userIds array required' });
    }

    const currentUser = req.body.sentBy || 'Admin';
    const finalMessage = message || `Please fill your timesheet for ${dateKey}. Some time slots are missing.`;

    try {
        const results = [];
        for (const userId of userIds) {
            // Get user details
            const userResult = await query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
            const user = userResult.rows[0];
            if (!user) continue;

            // Store reminder in database
            await query(`
                INSERT INTO reminders (userId, dateKey, message, sentAt, sentBy, status)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, 'sent')
            `, [userId, dateKey, finalMessage, currentUser]);

            results.push({
                userId: user.id,
                name: user.name,
                email: user.email,
                notified: true,
                message: finalMessage
            });

            console.log(`Reminder sent to ${user.name} (${user.email || 'no email'}) for ${dateKey}`);
        }

        res.json({
            success: true,
            remindersCount: results.length,
            reminders: results
        });
    } catch (err) {
        console.error('Send reminder error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get pending reminders for a user
router.get('/reminders', async (req, res) => {
    const { userId, status } = req.query;
    try {
        let text = 'SELECT r.*, u.name as userName FROM reminders r JOIN users u ON r.userId = u.id';
        const params = [];
        const conditions = [];

        if (userId) {
            conditions.push(`r.userId = $${conditions.length + 1}`);
            params.push(userId);
        }
        if (status) {
            conditions.push(`r.status = $${conditions.length + 1}`);
            params.push(status);
        }

        if (conditions.length > 0) {
            text += ' WHERE ' + conditions.join(' AND ');
        }
        text += ' ORDER BY r.sentAt DESC LIMIT 100';

        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark reminder as read/acknowledged
router.put('/reminders/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await query('UPDATE reminders SET status = $1 WHERE id = $2', [status || 'read', id]);
        res.json({ message: 'Reminder updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Auto-check and notify endpoint (for scheduled jobs)
router.post('/auto-notify-missing', async (req, res) => {
    const { dateKey } = req.body;
    const checkDate = dateKey || new Date().toISOString().split('T')[0];

    try {
        const employeesResult = await query('SELECT id, name, email FROM users WHERE role != $1', ['admin']);
        const employees = employeesResult.rows;

        const activitiesResult = await query('SELECT userId, timeSlot FROM activities WHERE dateKey = $1', [checkDate]);
        const activities = activitiesResult.rows;

        const filledMap = {};
        activities.forEach(a => {
            if (!filledMap[a.userid]) filledMap[a.userid] = new Set();
            filledMap[a.userid].add(a.timeslot);
        });

        const notificationsSent = [];
        for (const emp of employees) {
            const filled = filledMap[emp.id] || new Set();
            const missing = TIME_SLOTS.filter(slot => !filled.has(slot));

            if (missing.length > 0) {
                // Check if we already sent a reminder today
                const existing = await query(
                    `SELECT id FROM reminders WHERE userId = $1 AND dateKey = $2 AND DATE(sentAt) = CURRENT_DATE`,
                    [emp.id, checkDate]
                );

                if (existing.rows.length === 0) {
                    const message = `You have ${missing.length} unfilled time slot(s) for ${checkDate}: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '...' : ''}`;

                    await query(`
                        INSERT INTO reminders (userId, dateKey, message, sentAt, sentBy, status)
                        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'System', 'sent')
                    `, [emp.id, checkDate, message]);

                    notificationsSent.push({
                        name: emp.name,
                        missingCount: missing.length
                    });

                    console.log(`Auto-notification sent to ${emp.name} for ${checkDate}`);
                }
            }
        }

        res.json({
            success: true,
            dateChecked: checkDate,
            notificationsSent: notificationsSent.length,
            employees: notificationsSent
        });
    } catch (err) {
        console.error('Auto-notify error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
