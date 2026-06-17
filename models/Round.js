const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
    roundNumber: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['active', 'ended', 'paused'],
        default: 'active'
    },
    winningColor: { type: String, enum: ['green', 'blue', 'purple', null], default: null },
    totalStaked: { type: Number, default: 0 },
    totalPayout: { type: Number, default: 0 },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date }
});

module.exports = mongoose.model('Round', RoundSchema);
