const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  attendeeName: { type: String, required: true },
  attendeeEmail: { type: String, required: true },
  ticketCode: { type: String, required: true, unique: true },
  isCheckedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);