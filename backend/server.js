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

// -------------------------------------------------------------
// DATABASE CONNECTION & AUTOMATIC ADMIN SEEDING
// -------------------------------------------------------------
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qr_events')
  .then(async () => {
    console.log('MongoDB Connected');
    await seedDefaultAdmin();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Function to automatically create a default admin if none exists
// Function to seed or reset the default admin account
async function seedDefaultAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Delete existing admin with this email to clear stale credentials
    await User.deleteOne({ email: 'admin@gatepass.com' });

    const defaultAdmin = new User({
      name: 'System Administrator',
      email: 'admin@gatepass.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    await defaultAdmin.save();
    console.log('----------------------------------------------------');
    console.log('DEFAULT ADMIN READY FOR LOGIN:');
    console.log('Email: admin@gatepass.com');
    console.log('Password: Admin@123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('Failed to seed default admin:', err.message);
  }
}
// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// Public Registration: STRICTLY creates 'USER' accounts
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Forces role to USER regardless of payload
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'USER'
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, name: newUser.name, email: newUser.email }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account', details: err.message });
  }
});

// Login for both Users & Default Admin
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

    // Include name and email in JWT payload so ticket generator gets valid data
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

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

// Issue Pass (Fix: Extract name/email from verified JWT user or body)
app.post('/api/tickets/register', verifyToken, async (req, res) => {
  try {
    const attendeeName = req.user.name || req.body.name;
    const attendeeEmail = req.user.email || req.body.email;

    if (!attendeeName || !attendeeEmail) {
      return res.status(400).json({ error: 'Attendee name and email are missing.' });
    }

    const ticketCode = `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;
    const newTicket = new Ticket({
      attendeeName,
      attendeeEmail,
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