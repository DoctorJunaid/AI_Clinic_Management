import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Heart } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import logoImg from '../../assets/logo.png';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('admin@medflow.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  // Instantly logs in the user when a quick access button is clicked
  const handleFastLogin = async (fastEmail, fastPassword) => {
    setIsLoading(true);
    const success = await login(fastEmail, fastPassword);
    if (success) {
      navigate('/');
    }
    setIsLoading(false);
  };

  // Mock heart rate data for the floating chart matching Stitch's visual exact graph
  const heartRateData = [
    { value: 72 }, { value: 75 }, { value: 73 }, { value: 78 }, 
    { value: 85 }, { value: 82 }, { value: 88 }, { value: 97 }
  ];

  return (
    <div className="auth-viewport">
      
      {/* Centered Canvas Container with exact grid bounds matching the 4:3 mockup */}
      <div className="auth-canvas" style={{ border: 'none' }}>
        
        {/* LEFT COLUMN: Logo, Header, Embedded Login Form */}
        <div className="auth-left-pane">
          
          {/* SAYLANI CLINIC Logo */}
          <div className="auth-brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <img src={logoImg} alt="Saylani Clinic Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: '800', color: '#000000', letterSpacing: '-0.04em' }}>
                SAYLANI CLINIC<span style={{ color: 'var(--brand-600)' }}>.</span>
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                AI CLINIC
              </span>
            </div>
          </div>

          {/* Main content Area */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="auth-hero-heading">
              Expert care for your health and wellness<span>.</span>
            </h1>
            <p className="auth-hero-sub">
              Our medical experts provide compassionate, professional support to keep you and your loved ones safe and well.
            </p>

            {/* Premium, pixel-perfect integrated login form */}
            <form onSubmit={handleSubmit} className="auth-compact-form">
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={15} />
                <input 
                  type="email" 
                  className="auth-input-field" 
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={15} />
                <input 
                  type="password" 
                  className="auth-input-field" 
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <button 
                  type="submit" 
                  className="auth-capsule-btn"
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'Connecting...' : 'Sign In to Portal'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </form>

            {/* Quick-test access shortcuts inside the white canvas */}
            <div className="mt-4 pt-3 border-t border-slate-100/60">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
                  One-Click Quick Login Portals
                </span>
                <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Pass: 123456
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'Clinical Admin', email: 'admin@medflow.com', icon: '🔑', color: 'rgba(73, 104, 0, 0.05)', border: 'rgba(73, 104, 0, 0.12)' },
                  { role: 'Assigned Specialist', email: 'doctor@medflow.com', icon: '🩺', color: 'rgba(73, 104, 0, 0.05)', border: 'rgba(73, 104, 0, 0.12)' },
                  { role: 'Reception Desk', email: 'reception@medflow.com', icon: '📝', color: 'rgba(0, 0, 0, 0.02)', border: 'rgba(0, 0, 0, 0.04)' },
                  { role: 'Registered Patient', email: 'patient@medflow.com', icon: '👤', color: 'rgba(0, 0, 0, 0.02)', border: 'rgba(0, 0, 0, 0.04)' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleFastLogin(item.email, '123456')}
                    className="flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
                    style={{
                      background: '#ffffff',
                      borderColor: item.border,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '0.675rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{item.role}</span>
                      <span style={{ fontSize: '0.575rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{item.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Curved Social Notch, DNA spiral image container, Floating tags & Heart Rate Card */}
        <div className="auth-right-pane">
          
          {/* Social media vertical stack overlay inside the curved notch */}
          <div className="auth-social-notch">
            <div className="auth-notch-circle">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </div>
            <div className="auth-notch-circle">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </div>
            <div className="auth-notch-circle font-bold text-sm select-none">
              X
            </div>
          </div>

          <div className="auth-media-frame">
            <img 
              alt="Premium DNA moss spiral representing synthetic organic biology and clinical healthcare"
              className="auth-media-img"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYnnJ4rMhnER3dFNz3INGaEg4klciq1cYU7XwtqBSx60g4Z177m3-h4nwzBAy61QxIkue_DWSMQ3wOrVdwvCdTINgk7KHGPWOxXf8jVpF7Q_gju52RspO3w8IARSX6P9AYpYqJh3UxhAb44Hq7w2IuXt6OBfh_8I8exi5fZ83dxcdTSnn1oBzod2Rofx3cDdrMVhJ9wN-3oolBwvwUeWXsH_9K0Jn9_Z5LspktE3T2gCw52jtUSMKoElK6NtK1EzdPAg5mmT3vjOY"
            />

            {/* Floating tag 1: Expertise + */}
            <div className="auth-floating-badge auth-badge-expertise">
              <span>Expertise</span>
              <div className="auth-badge-dot">+</div>
            </div>

            {/* Floating tag 2: Wellness + */}
            <div className="auth-floating-badge auth-badge-wellness">
              <span>Wellness</span>
              <div className="auth-badge-dot">+</div>
            </div>

            {/* Floating tag 3: Care + */}
            <div className="auth-floating-badge auth-badge-care">
              <div className="auth-badge-dot mr-1">+</div>
              <span>Care</span>
            </div>

            {/* Floating heart rate gradient trend card */}
            <div className="auth-heartrate-card">
              <div className="auth-heartrate-title">
                <Heart size={13} className="text-red-500 fill-red-500 shrink-0" />
                <span>Heart rate measurement</span>
              </div>
              
              {/* Recharts Area Chart replicating yellow graph */}
              <div className="auth-heartrate-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heartRateData}>
                    <defs>
                      <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c8f17a" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#c8f17a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#c8f17a" strokeWidth={2} fillOpacity={1} fill="url(#colorYellow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="auth-heartrate-footer">
                <span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8f17a]"></span> Goal 83bpm
                </span>
                <span className="text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-black"></span> Current 97bpm
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
