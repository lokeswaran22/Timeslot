const { query } = require('../config/db');

async function logActivityHistory(userId, actionType, actionBy, dateKey, timeSlot, oldData, newData, req) {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const actionByUserId = actionBy || userId; // Default to self if not specified

        // Ensure IDs are integers
        const finalUserId = parseInt(userId);
        const finalActionBy = parseInt(actionByUserId);

        if (isNaN(finalUserId)) {
            console.warn('Audit Log: Invalid User ID, skipping log');
            return;
        }

        await query(`
            INSERT INTO activity_history 
            (user_id, action_type, action_by, old_data, new_data, date_key, time_slot, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            finalUserId,
            actionType,
            isNaN(finalActionBy) ? finalUserId : finalActionBy,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            dateKey,
            timeSlot,
            ip || 'unknown',
            userAgent || 'unknown'
        ]);
        console.log(`Audit Logged: ${actionType} | User: ${userId} | Slot: ${timeSlot}`);
    } catch (e) {
        console.error('Audit Log Error:', e);
    }
}

module.exports = { logActivityHistory };
