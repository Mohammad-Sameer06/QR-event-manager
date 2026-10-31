import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, UserCheck, LayoutDashboard, Ticket, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/tickets';

export default function App() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>QR Event Pass & Check-In Manager</h1>
        <p style={{ color: '#666' }}>Real-time Ticket Issuance & Gate Scanning System</p>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={() => setActiveTab('register')}
            style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: activeTab === 'register' ? 'bold' : 'normal' }}
          >
            Register / Get Pass
          </button>
          <button 
            onClick={() => setActiveTab('scan')}
            style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: activeTab === 'scan' ? 'bold' : 'normal' }}
          >
            Gate Scanner
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal' }}
          >
            Live Dashboard
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'register' && <RegisterTab />}
        {activeTab === 'scan' && <ScannerTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// TAB 1: REGISTRATION & TICKET GENERATION
// -------------------------------------------------------------
function RegisterTab() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/register`, { name, email });
      setTicketData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to register ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2>Event Registration</h2>
      {!ticketData ? (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Full Name:</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email Address:</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Generating Pass...' : 'Register & Get Ticket'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3 style={{ color: '#2e7d32' }}>🎉 Registration Successful!</h3>
          <p><strong>Name:</strong> {ticketData.ticket.attendeeName}</p>
          <p><strong>Ticket Code:</strong> <code>{ticketData.ticket.ticketCode}</code></p>
          <div style={{ margin: '20px 0' }}>
            <img src={ticketData.qrCodeUrl} alt="Event QR Ticket" style={{ width: '200px', height: '200px' }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Show this QR code at the entrance gate for check-in.</p>
          <button onClick={() => setTicketData(null)} style={{ padding: '8px 16px', marginTop: '10px' }}>Register Another</button>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// TAB 2: LIVE GATE CAMERA SCANNER
// -------------------------------------------------------------
function ScannerTab() {
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    }, false);

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    try {
      const res = await axios.post(`${API_BASE}/verify`, { ticketCode: decodedText });
      setScanResult({ success: true, message: res.data.message, ticket: res.data.ticket });
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Invalid QR Code or Check-in Error',
        ticket: err.response?.data?.ticket
      });
    }
  };

  const onScanError = (err) => {
    // Ignore frequent framing errors in standard scanning loop
  };

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
      <h2>Gate Entry Scanner</h2>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>Point camera at attendee's QR ticket pass</p>
      
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>

      {scanResult && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '6px',
          background: scanResult.success ? '#e8f5e9' : '#ffebee',
          border: `1px solid ${scanResult.success ? '#81c784' : '#e57373'}`,
          color: scanResult.success ? '#1b5e20' : '#b71c1c'
        }}>
          <h3>{scanResult.success ? '✅ ACCESS GRANTED' : '❌ ACCESS DENIED'}</h3>
          <p>{scanResult.message}</p>
          {scanResult.ticket && (
            <p><strong>Attendee:</strong> {scanResult.ticket.attendeeName} ({scanResult.ticket.ticketCode})</p>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// TAB 3: ADMIN LIVE DASHBOARD
// -------------------------------------------------------------
function DashboardTab() {
  const [stats, setStats] = useState({ totalIssued: 0, checkedInCount: 0, recentScans: [] });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000); // Auto-refresh metrics every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2>Live Event Metrics</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: '#fff', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #ccc' }}>
          <h3>Total Tickets Issued</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '5px 0' }}>{stats.totalIssued}</p>
        </div>
        <div style={{ flex: 1, background: '#fff', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #ccc' }}>
          <h3>Checked In Count</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32', margin: '5px 0' }}>{stats.checkedInCount}</p>
        </div>
      </div>

      <h3>Recent Gate Check-ins</h3>
      {stats.recentScans.length === 0 ? (
        <p style={{ color: '#777' }}>No check-ins recorded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ticket Code</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>Checked In Time</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentScans.map(t => (
              <tr key={t._id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.attendeeName}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>{t.ticketCode}</code></td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Date(t.checkedInAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}