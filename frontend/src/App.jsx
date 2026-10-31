import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  QrCode, 
  UserCheck, 
  LayoutDashboard, 
  Ticket, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RefreshCw,
  Users,
  ShieldCheck,
  Download
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/tickets';

export default function App() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <QrCode size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                GatePass<span style={{ color: '#3b82f6' }}>Pro</span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Enterprise QR Verification Engine</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav style={{
            display: 'flex',
            background: '#0f172a',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid #334155'
          }}>
            <NavTab 
              icon={<Ticket size={16} />} 
              label="Issue Pass" 
              active={activeTab === 'register'} 
              onClick={() => setActiveTab('register')} 
            />
            <NavTab 
              icon={<UserCheck size={16} />} 
              label="Gate Scanner" 
              active={activeTab === 'scan'} 
              onClick={() => setActiveTab('scan')} 
            />
            <NavTab 
              icon={<LayoutDashboard size={16} />} 
              label="Live Metrics" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'register' && <RegisterTab />}
        {activeTab === 'scan' && <ScannerTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
      </main>
    </div>
  );
}

function NavTab({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        background: active ? '#3b82f6' : 'transparent',
        color: active ? '#ffffff' : '#94a3b8',
        fontWeight: active ? 600 : 400,
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// -------------------------------------------------------------
// TAB 1: REGISTRATION & TICKET GENERATION (MODERN CARD)
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
    <div style={{ maxWidth: '540px', margin: '0 auto' }}>
      {!ticketData ? (
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>Attendee Registration</h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Enter guest details to issue an instant encrypted QR event pass.</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
                Full Name
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Alex Morgan"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
                Email Address
              </label>
              <input 
                type="email" 
                required 
                placeholder="alex@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{
                marginTop: '10px',
                padding: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Generating Ticket...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Issue QR Pass
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* PRINTABLE DIGITAL TICKET PASS CARD */
        <div style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid #334155',
          borderRadius: '20px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#4ade80',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <CheckCircle2 size={16} /> Official Entry Pass Issued
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            {ticketData.ticket.attendeeName}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '24px' }}>
            {ticketData.ticket.attendeeEmail}
          </p>

          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '16px',
            display: 'inline-block',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            marginBottom: '20px'
          }}>
            <img 
              src={ticketData.qrCodeUrl} 
              alt="Event QR Ticket" 
              style={{ width: '200px', height: '200px', display: 'block' }} 
            />
          </div>

          <div style={{
            background: '#1e293b',
            border: '1px dashed #475569',
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'inline-block',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ticket Identifier
            </span>
            <code style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em' }}>
              {ticketData.ticket.ticketCode}
            </code>
          </div>

          <div>
            <button 
              onClick={() => setTicketData(null)} 
              style={{
                padding: '10px 20px',
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Issue Another Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// TAB 2: LIVE GATE CAMERA SCANNER (PRO SCANNER BADGES)
// -------------------------------------------------------------
function ScannerTab() {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 220, height: 220 }
    }, false);

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch(err => console.error("Scanner shutdown issue", err));
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    try {
      const res = await axios.post(`${API_BASE}/verify`, { ticketCode: decodedText });
      setScanResult({ success: true, message: res.data.message, ticket: res.data.ticket });
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Invalid ticket pass scanned',
        ticket: err.response?.data?.ticket
      });
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>Gate Entry Scanner</h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Position QR code within the viewfinder frame</p>
        </div>

        {/* Camera Container */}
        <div style={{
          background: '#0f172a',
          padding: '12px',
          borderRadius: '16px',
          border: '1px solid #334155',
          marginBottom: '24px'
        }}>
          <div id="reader"></div>
        </div>

        {/* Verification Result Modal Banner */}
        {scanResult && (
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: scanResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${scanResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            textAlign: 'left'
          }}>
            {scanResult.success ? (
              <CheckCircle2 size={32} color="#22c55e" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={32} color="#ef4444" style={{ flexShrink: 0 }} />
            )}
            <div>
              <h4 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                color: scanResult.success ? '#4ade80' : '#f87171',
                marginBottom: '4px' 
              }}>
                {scanResult.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px' }}>{scanResult.message}</p>
              {scanResult.ticket && (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Guest: <strong>{scanResult.ticket.attendeeName}</strong> ({scanResult.ticket.ticketCode})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TAB 3: ADMIN METRICS DASHBOARD
// -------------------------------------------------------------
function DashboardTab() {
  const [stats, setStats] = useState({ totalIssued: 0, checkedInCount: 0, recentScans: [] });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to update stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <StatCard 
          icon={<Users color="#3b82f6" size={24} />} 
          title="Total Passes Issued" 
          value={stats.totalIssued} 
          subtitle="All registered event guests"
        />
        <StatCard 
          icon={<ShieldCheck color="#22c55e" size={24} />} 
          title="Checked-In Attendees" 
          value={stats.checkedInCount} 
          subtitle={`${stats.totalIssued ? Math.round((stats.checkedInCount / stats.totalIssued) * 100) : 0}% verification rate`}
        />
      </div>

      {/* Activity Log Table */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Recent Gate Activity</h3>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
            Live Polling (3s)
          </span>
        </div>

        {stats.recentScans.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center', padding: '32px 0' }}>
            No gate check-ins logged yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Attendee</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Ticket Code</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Time</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentScans.map((ticket) => (
                  <tr key={ticket._id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '14px 16px', fontSize: '0.9rem', fontWeight: 500, color: '#f8fafc' }}>
                      {ticket.attendeeName}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <code style={{ background: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#38bdf8', border: '1px solid #334155' }}>
                        {ticket.ticketCode}
                      </code>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#94a3b8' }}>
                      {new Date(ticket.checkedInAt).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: '#4ade80',
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>{title}</span>
        <div style={{ background: '#0f172a', padding: '8px', borderRadius: '8px', border: '1px solid #334155' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
        {value}
      </div>
      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</p>
    </div>
  );
}