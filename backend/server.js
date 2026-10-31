const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const Ticket = require('./models/Ticket');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qr_events')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// 1. Issue Ticket API
app.post('/api/tickets/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const ticketCode = `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;
    const newTicket = new Ticket({
      attendeeName: name,
      attendeeEmail: email,
      ticketCode
    });

    await newTicket.save();

    // Generate Data URL for QR Code
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

// 2. Verify Ticket API (Scan Gate)
app.post('/api/tickets/verify', async (req, res) => {
  try {
    const { ticketCode } = req.body;
    if (!ticketCode) {
      return res.status(400).json({ success: false, message: 'No ticket code provided.' });
    }

    const ticket = await Ticket.findOne({ ticketCode });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Invalid Ticket! Not found in database.' });
    }

    if (ticket.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: `ALREADY USED! Checked in at ${new Date(ticket.checkedInAt).toLocaleTimeString()}`,
        ticket
      });
    }

    // Mark as checked in
    ticket.isCheckedIn = true;
    ticket.checkedInAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: 'Access Granted! Welcome to the event.',
      ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error verifying ticket' });
  }
});

// 3. Admin Dashboard Metrics API
app.get('/api/tickets/stats', async (req, res) => {
  try {
    const totalIssued = await Ticket.countDocuments();
    const checkedInCount = await Ticket.countDocuments({ isCheckedIn: true });
    const recentScans = await Ticket.find({ isCheckedIn: true })
      .sort({ checkedInAt: -1 })
      .limit(10);

    res.json({ totalIssued, checkedInCount, recentScans });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));