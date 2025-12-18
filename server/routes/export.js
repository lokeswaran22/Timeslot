const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const { query } = require('../config/db');
const { TIME_SLOTS } = require('../utils/constants');

// ==========================================
// EXPORT TO EXCEL
// ==========================================
router.get('/export', async (req, res) => {
    const { dateKey } = req.query;
    if (!dateKey) return res.status(400).send('Missing dateKey');

    try {
        const usersResult = await query('SELECT * FROM users WHERE role = $1 ORDER BY name', ['employee']);
        const activitiesResult = await query('SELECT * FROM activities WHERE dateKey = $1', [dateKey]);

        const users = usersResult.rows;
        const activities = activitiesResult.rows;

        // Build activity map
        const activityMap = {};
        activities.forEach(a => {
            if (!activityMap[a.userid]) activityMap[a.userid] = {};
            if (!activityMap[a.userid][a.timeslot]) activityMap[a.userid][a.timeslot] = [];
            activityMap[a.userid][a.timeslot].push(a);
        });

        const data = [];
        const header = ['Employee Name', 'Proof Pages', 'Epub Pages', 'Calibr Pages', ...TIME_SLOTS];
        data.push(header);

        users.forEach(user => {
            const row = [user.name];
            let proofTotal = 0, epubTotal = 0, calibrTotal = 0;

            // Calculate totals
            TIME_SLOTS.forEach(slot => {
                const acts = activityMap[user.id]?.[slot] || [];
                acts.forEach(act => {
                    const pages = parseInt(act.pagesdone) || 0;
                    if (act.type === 'proof') proofTotal += pages;
                    else if (act.type === 'epub') epubTotal += pages;
                    else if (act.type === 'calibr') calibrTotal += pages;
                });
            });

            row.push(proofTotal, epubTotal, calibrTotal);

            // Fill slots
            TIME_SLOTS.forEach(slot => {
                const acts = activityMap[user.id]?.[slot];
                if (acts && acts.length > 0) {
                    const descriptions = acts.map(a => `${a.type.toUpperCase()}: ${a.description} (${a.pagesdone}pgs)`).join('; ');
                    row.push(descriptions);
                } else {
                    row.push('');
                }
            });

            data.push(row);
        });

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.aoa_to_sheet(data);

        // Adjust column width
        const wscols = [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
        for (let i = 0; i < TIME_SLOTS.length; i++) wscols.push({ wch: 30 });
        ws['!cols'] = wscols;

        xlsx.utils.book_append_sheet(wb, ws, "Daily Report");

        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Diposition', `attachment; filename="Daily_Report_${dateKey}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);

    } catch (err) {
        console.error('Export error:', err);
        res.status(500).send(err.message);
    }
});

module.exports = router;
