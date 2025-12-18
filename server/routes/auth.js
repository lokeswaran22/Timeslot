const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

router.post('/login', async (req, res) => {
    let { username, password } = req.body;
    if (username) username = username.trim();
    if (password) password = password.trim();

    try {
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Try bcrypt comparison
        let isValidPassword = await bcrypt.compare(password, user.password);

        // Fallback: Check plain text and migrate
        if (!isValidPassword && password === user.password) {
            console.log(`Migrating user ${username} to hashed password...`);
            const newHash = await bcrypt.hash(password, 10);
            await query('UPDATE users SET password = $1 WHERE id = $2', [newHash, user.id]);
            isValidPassword = true;
        }

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                email: user.email,
                employeeId: user.id
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
