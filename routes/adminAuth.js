const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @route   POST /admin/login
// @desc    Auth admin & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { admin: { id: admin.id, role: admin.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 36000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, admin: { id: admin.id, username: admin.username, role: admin.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
