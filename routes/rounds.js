const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Round = require('../models/Round');
const Bet = require('../models/Bet');
const User = require('../models/User');

// Middleware to check if user has admin permissions
const canViewRounds = (req, res, next) => {
    if (req.admin.role === 'super_admin' || req.admin.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Admin permissions required' });
    }
};

const canManageRounds = (req, res, next) => {
    if (req.admin.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Super Admin permissions required' });
    }
};

// @route   POST /admin/rounds/start
router.post('/start', auth, canManageRounds, async (req, res) => {
    try {
        const roundNumber = `RN-${Date.now()}`;
        const newRound = new Round({ roundNumber });
        await newRound.save();
        res.json(newRound);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /admin/rounds/:id/end
// Manual Override / End Round
router.put('/:id/end', auth, canManageRounds, async (req, res) => {
    const { winningColor } = req.body;
    try {
        const round = await Round.findById(req.params.id);
        if (!round) return res.status(404).json({ msg: 'Round not found' });

        round.status = 'ended';
        round.winningColor = winningColor;
        round.endTime = Date.now();
        await round.save();

        // Process Bets
        const bets = await Bet.find({ roundId: round._id });
        let totalPayout = 0;

        for (let bet of bets) {
            if (bet.color === winningColor) {
                const multiplier = winningColor === 'purple' ? 3 : 2;
                bet.payout = bet.amount * multiplier;
                bet.status = 'won';

                await User.findByIdAndUpdate(bet.userId, { $inc: { walletBalance: bet.payout } });
                totalPayout += bet.payout;
            } else {
                bet.status = 'lost';
            }
            await bet.save();
        }

        round.totalPayout = totalPayout;
        await round.save();

        res.json(round);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /admin/rounds/:id/pause
router.put('/:id/pause', auth, canManageRounds, async (req, res) => {
    try {
        const round = await Round.findById(req.params.id);
        round.status = 'paused';
        await round.save();
        res.json(round);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
