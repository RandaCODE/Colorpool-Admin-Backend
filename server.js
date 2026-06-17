const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Config
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/colorpool';

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Use Routes
app.use('/admin/auth', require('./routes/adminAuth'));
app.use('/admin/dashboard', require('./routes/dashboard'));
app.use('/admin/risk', require('./routes/risk'));
app.use('/admin/withdrawals', require('./routes/withdrawals'));
app.use('/admin/users', require('./routes/users'));
app.use('/admin/rounds', require('./routes/rounds'));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
