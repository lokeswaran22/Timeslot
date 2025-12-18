const { query } = require('./db');
const bcrypt = require('bcryptjs');

async function initDb() {
    try {
        console.log('🔄 Initializing Database Schema...');

        // Users table
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'employee',
                email VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Activities table
        await query(`
            CREATE TABLE IF NOT EXISTS activities (
                id SERIAL PRIMARY KEY,
                dateKey VARCHAR(255) NOT NULL,
                userId INTEGER NOT NULL,
                timeSlot VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                description TEXT,
                totalPages VARCHAR(50),
                pagesDone VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_user FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create index for faster queries
        await query(`
            CREATE INDEX IF NOT EXISTS idx_activities_date_user 
            ON activities(dateKey, userId);
        `);

        // Leave requests table
        await query(`
            CREATE TABLE IF NOT EXISTS leave_requests (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                startDate VARCHAR(255),
                endDate VARCHAR(255),
                reason TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_leave_user FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Permissions table
        await query(`
            CREATE TABLE IF NOT EXISTS permissions (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                date VARCHAR(255),
                startTime VARCHAR(255),
                endTime VARCHAR(255),
                reason TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_permission_user FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Activity log table (Legacy but kept for compatibility)
        await query(`
            CREATE TABLE IF NOT EXISTS activity_log (
                id SERIAL PRIMARY KEY,
                dateKey VARCHAR(255),
                employeeName VARCHAR(255) NOT NULL,
                activityType VARCHAR(255),
                description TEXT,
                timeSlot VARCHAR(255),
                action VARCHAR(50),
                editedBy VARCHAR(255),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Audit History table (New System)
        await query(`
            CREATE TABLE IF NOT EXISTS activity_history (
                id SERIAL PRIMARY KEY,
                activity_id INTEGER,
                user_id INTEGER,
                action_type VARCHAR(50),
                action_by INTEGER,
                old_data TEXT,
                new_data TEXT,
                date_key VARCHAR(50),
                time_slot VARCHAR(50),
                ip_address VARCHAR(255),
                user_agent TEXT,
                action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Reminders table for notification system
        await query(`
            CREATE TABLE IF NOT EXISTS reminders (
                id SERIAL PRIMARY KEY,
                userId INTEGER NOT NULL,
                dateKey VARCHAR(255) NOT NULL,
                message TEXT,
                sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sentBy VARCHAR(255),
                status VARCHAR(50) DEFAULT 'sent',
                CONSTRAINT fk_reminder_user FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create default admin user
        const adminUsername = 'admin@pristonix';
        const adminPassword = '!pristonixadmin@2025';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await query(`
            INSERT INTO users (name, username, password, role, email)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO NOTHING
        `, ['Master Admin', adminUsername, hashedPassword, 'admin', 'admin@pristonix.com']);

        console.log('✅ Database schema synchronized');
    } catch (err) {
        console.error('❌ Error initializing database:', err);
    }
}

module.exports = { initDb };
