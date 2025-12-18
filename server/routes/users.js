const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT id, name, username, role, email, createdAt FROM users ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { name, username, password, role, email } = req.body;

    try {
        if (!username || !password || !name) {
            return res.status(400).json({ error: 'Name, Username and Password are required.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await query(`
            INSERT INTO users (name, username, password, role, email, createdAt)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            RETURNING id, name, username, role
        `, [name, username, hashedPassword, role || 'employee', email || '']);

        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, username, password, role, email } = req.body;

    try {
        let updateQuery = `UPDATE users SET name = $1, username = $2, role = $3, email = $4`;
        let params = [name, username, role || 'employee', email || ''];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password.trim(), 10);
            updateQuery += `, password = $5 WHERE id = $6 RETURNING id, name, username, role`;
            params.push(hashedPassword, id);
        } else {
            updateQuery += ` WHERE id = $5 RETURNING id, name, username, role`;
            params.push(id);
        }

        const result = await query(updateQuery, params);
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username already taken' });
        }
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
