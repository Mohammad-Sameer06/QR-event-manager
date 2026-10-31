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
  LogOut,
  Lock
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [activeTab, setActiveTab] = useState('register');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken('');
  };

  if (!token || !user) {
    return <AuthScreen onLogin={(userData, tokenData) => {
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', tokenData);
    }} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                GatePass<span style={{ color: '#3b82f6' }}>Pro</span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Logged in as <strong>{user.name}</strong> ({user.role})
              </p>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <NavTab 
              icon={<Ticket size={16} />} 
              label="My Pass" 
              active={activeTab === 'register'} 
              onClick={() => setActiveTab('register')} 
            />
            {user.role === 'ADMIN' && (
              <>
                <NavTab 
                  icon={<UserCheck size={16} />} 
                  label="Scanner" 
                  active={activeTab === 'scan'} 
                  onClick={() => setActiveTab('scan')} 
                />
                <NavTab 
                  icon={<LayoutDashboard size={16} />} 
                  label="Metrics" 
                  active={activeTab === 'dashboard'} 
                  onClick={() => setActiveTab('dashboard')} 
                />
              </>
            )}
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'register' && <RegisterTab token={token} user={user} />}
        {activeTab === 'scan' && user.role === 'ADMIN' && <ScannerTab token={token} />}
        {activeTab === 'dashboard' && user.role === 'ADMIN' && <DashboardTab token={token} />}
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
        cursor: 'pointer'
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// -------------------------------------------------------------
// AUTHENTICATION SCREEN (LOGIN / REGISTER)
// -------------------------------------------------------------
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '8px', textAlign: 'center' }}>
          {isLogin ? 'Sign In' : 'Create Attendee Account'}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '24px', textAlign: 'center' }}>
          {isLogin ? 'Sign in as Guest or Gate Staff' : 'Register to get your event QR pass'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Account')}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}>
            {isLogin ? 'Register' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TAB 1: ISSUE TICKET PASS
// -------------------------------------------------------------
function RegisterTab({ token, user }) {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/tickets/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicketData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to issue ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
      {!ticketData ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '8px' }}>Your Event Pass</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '24px' }}>
            Click below to generate your encrypted QR ticket for <strong>{user.name}</strong>.
          </p>
          <button onClick={handleGenerate} disabled={loading} style={{ padding: '14px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Generating Pass...' : 'Generate My QR Pass'}
          </button>
        </div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '32px' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '4px' }}>{ticketData.ticket.attendeeName}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '20px' }}>{ticketData.ticket.attendeeEmail}</p>
          <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '20px' }}>
            <img src={ticketData.qrCodeUrl} alt="QR Ticket" style={{ width: '200px', height: '200px' }} />
          </div>
          <div>
            <code style={{ fontSize: '1.1rem', color: '#38bdf8', fontWeight: 700 }}>{ticketData.ticket.ticketCode}</code>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// TAB 2: GATE SCANNER (ADMIN ONLY)
// -------------------------------------------------------------
function ScannerTab({ token }) {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 220, height: 220 } }, false);
    scanner.render(async (decodedText) => {
      try {
        const res = await axios.post(`${API_BASE}/tickets/verify`, { ticketCode: decodedText }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setScanResult({ success: true, message: res.data.message, ticket: res.data.ticket });
      } catch (err) {
        setScanResult({
          success: false,
          message: err.response?.data?.message || 'Invalid ticket code',
          ticket: err.response?.data?.ticket
        });
      }
    }, () => {});

    return () => scanner.clear().catch(e => {});
  }, [token]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '28px' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#f8fafc', marginBottom: '16px' }}>Gate Entry Scanner</h2>
        <div id="reader" style={{ background: '#0f172a', padding: '12px', borderRadius: '16px', marginBottom: '20px' }}></div>
        {scanResult && (
          <div style={{ padding: '16px', borderRadius: '8px', background: scanResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${scanResult.success ? '#22c55e' : '#ef4444'}`, color: scanResult.success ? '#4ade80' : '#f87171' }}>
            <h4>{scanResult.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</h4>
            <p>{scanResult.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TAB 3: ADMIN DASHBOARD (ADMIN ONLY)
// -------------------------------------------------------------
function DashboardTab({ token }) {
  const [stats, setStats] = useState({ totalIssued: 0, checkedInCount: 0, recentScans: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tickets/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <p style={{ color: '#94a3b8' }}>Total Issued</p>
          <h3 style={{ fontSize: '2rem', color: '#fff' }}>{stats.totalIssued}</h3>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <p style={{ color: '#94a3b8' }}>Checked In</p>
          <h3 style={{ fontSize: '2rem', color: '#22c55e' }}>{stats.checkedInCount}</h3>
        </div>
      </div>
    </div>
  );
}