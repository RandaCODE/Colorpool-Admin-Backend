const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @route   GET /admin/auth/debug-admin
// @desc    Debug admin document structure
router.get('/debug-admin', async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: 'admin' }).lean();
        if (!admin) {
            return res.json({ found: false });
        }
        res.json({
            found: true,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            hasPasswordHash: !!admin.passwordHash,
            hashLength: admin.passwordHash ? admin.passwordHash.length : 0,
            hasPassword: !!admin.password,
            passwordLength: admin.password ? admin.password.length : 0,
            keysFound: Object.keys(admin)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /admin/auth/login
// @desc    Auth admin & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).json({ msg: 'Invalid Credentials' });

        console.log("passwordHash:", admin.passwordHash);
        console.log("password:", admin.password);

        const isMatch = await bcrypt.compare(
            password,
            admin.passwordHash || admin.password
        );

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
