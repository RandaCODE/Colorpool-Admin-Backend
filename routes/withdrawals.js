const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @route   GET /admin/withdrawals
router.get('/', auth, async (req, res) => {
    try {
        const { status } = req.query;
        let query = { type: 'withdrawal' };
        if (status) query.status = status;

        const withdrawals = await Transaction.find(query).populate('userId', 'username email').sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /admin/withdrawals/:id/approve
router.put('/:id/approve', auth, async (req, res) => {
    try {
        const withdrawal = await Transaction.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ msg: 'Withdrawal not found' });

        withdrawal.status = 'approved';
        await withdrawal.save();
        res.json(withdrawal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /admin/withdrawals/:id/paid
router.put('/:id/paid', auth, async (req, res) => {
    try {
        const withdrawal = await Transaction.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ msg: 'Withdrawal not found' });

        withdrawal.status = 'paid';
        await withdrawal.save();

        // Update user total withdrawals
        await User.findByIdAndUpdate(withdrawal.userId, { $inc: { totalWithdrawals: withdrawal.amount } });

        res.json(withdrawal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /admin/withdrawals/:id/reject
router.put('/:id/reject', auth, async (req, res) => {
    try {
        const withdrawal = await Transaction.findById(req.params.id);
        if (!withdrawal) return res.status(404).json({ msg: 'Withdrawal not found' });

        withdrawal.status = 'rejected';
        await withdrawal.save();

        // Refund user wallet
        await User.findByIdAndUpdate(withdrawal.userId, { $inc: { walletBalance: withdrawal.amount } });

        res.json(withdrawal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
