import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Activity,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
  Stethoscope,
  Brain,
  ChevronRight
} from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import PricingModal from '../common/PricingModal';
import logoImg from '../../assets/logo.png';
import './Layout.css';

const navGroups = [
  {
    label: 'Core',
    items: [
      { title: 'Dashboard',    icon: LayoutDashboard, path: '/', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
      { title: 'Appointments', icon: CalendarCheck,   path: '/appointments', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
      { title: 'Patients',     icon: Users,           path: '/patients', roles: ['admin', 'doctor', 'receptionist'] },
      { title: 'My History',   icon: Activity,        path: '/my-history', roles: ['patient'] },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { title: 'Treatments',   icon: Stethoscope, path: '/treatments', roles: ['admin', 'doctor'] },
      { title: 'AI Diagnosis', icon: Brain,       path: '/ai-diagnosis', roles: ['admin', 'doctor'] },
      { title: 'Reports',      icon: FileText,    path: '/reports', roles: ['admin', 'doctor'] },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Settings', icon: Settings, path: '/settings', roles: ['admin'] },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
        <img src={logoImg} alt="Saylani Clinic" style={{ width: '42px', height: '42px', objectFit: 'contain', flexShrink: 0 }} />
        <div className="brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
          <span className="brand-name" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.0625rem', fontWeight: '800', color: '#000000', letterSpacing: '-0.04em' }}>
            SAYLANI CLINIC<span className="text-[#c8f17a]">.</span>
          </span>
          <span className="brand-sub" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            AI CLINIC
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(item => !item.roles || item.roles.includes(user?.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="nav-group">
              <span className="nav-group-label">{group.label}</span>
              <ul>
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`nav-link ${isActive ? 'active' : ''}`}
                      >
                        <span className="nav-icon-wrap">
                          <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                        </span>
                        <span className="nav-link-text">{item.title}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="nav-active-dot"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Subscription SaaS Plan Control */}
      <div className="sidebar-subscription" style={{
        margin: '0.75rem 1rem',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b' }}>Your Plan:</span>
          <span className={`plan-badge ${user?.subscriptionPlan === 'pro' ? 'pro' : 'free'}`} style={{
            fontSize: '0.675rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.15rem 0.5rem',
            borderRadius: '20px',
            background: user?.subscriptionPlan === 'pro' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e2e8f0',
            color: user?.subscriptionPlan === 'pro' ? '#ffffff' : '#475569',
            boxShadow: user?.subscriptionPlan === 'pro' ? '0 2px 10px rgba(16, 185, 129, 0.2)' : 'none'
          }}>
            {user?.subscriptionPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
          </span>
        </div>
        {user?.subscriptionPlan !== 'pro' ? (
          <button 
            onClick={() => setIsPricingOpen(true)}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.5rem',
              fontSize: '0.725rem',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#1e293b'}
            onMouseOut={(e) => e.target.style.background = '#000000'}
          >
            Upgrade to Pro
          </button>
        ) : (
          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '600', textAlign: 'center', display: 'block' }}>
            All Pro Features Unlocked!
          </span>
        )}
      </div>

      {/* User section */}
      <div className="sidebar-user">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Dr. Smith')}&background=ecfdf5&color=059669&bold=true&size=80`}
          alt="Profile"
          className="user-avatar"
        />
        <div className="user-meta">
          <span className="user-name">{user?.name || 'Dr. John Smith'}</span>
          <span className="user-role">{user?.role || 'Administrator'}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Sign out">
          <LogOut size={15} />
        </button>
      </div>

      {/* Pricing Modal Overlay */}
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </aside>
  );
};

export default Sidebar;
