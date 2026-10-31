const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const Ticket = require('./models/Ticket');
const User = require('./models/User');
const { verifyToken, requireRole } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qr_events')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// Register Account (USER or ADMIN)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER'
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account', details: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login error', details: err.message });
  }
});

// -------------------------------------------------------------
// TICKET ENDPOINTS
// -------------------------------------------------------------

// Issue Pass (Accessible by logged-in users or admins)
app.post('/api/tickets/register', verifyToken, async (req, res) => {
  try {
    const ticketCode = `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;
    const newTicket = new Ticket({
      attendeeName: req.user.name,
      attendeeEmail: req.body.email || req.user.email,
      ticketCode
    });

    await newTicket.save();
    const qrDataUrl = await QRCode.toDataURL(ticketCode);

    res.status(201).json({
      message: 'Ticket registered successfully',
      ticket: newTicket,
      qrCodeUrl: qrDataUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue ticket', details: error.message });
  }
});

// Verify Ticket API (ADMIN ONLY)
app.post('/api/tickets/verify', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { ticketCode } = req.body;
    const ticket = await Ticket.findOne({ ticketCode });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Invalid Ticket! Code not recognized.' });
    }

    if (ticket.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: `ALREADY USED! Checked in at ${new Date(ticket.checkedInAt).toLocaleTimeString()}`,
        ticket
      });
    }

    ticket.isCheckedIn = true;
    ticket.checkedInAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: 'Access Granted! Ticket verified.',
      ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error verifying ticket' });
  }
});

// Admin Dashboard Metrics (ADMIN ONLY)
app.get('/api/tickets/stats', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const totalIssued = await Ticket.countDocuments();
    const checkedInCount = await Ticket.countDocuments({ isCheckedIn: true });
    const recentScans = await Ticket.find({ isCheckedIn: true }).sort({ checkedInAt: -1 }).limit(10);

    res.json({ totalIssued, checkedInCount, recentScans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));