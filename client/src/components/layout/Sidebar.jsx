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
  Stethoscope,
  Brain,
  Zap
} from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
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

  const [clinicName, setClinicName] = useState(localStorage.getItem('clinic_name') || 'Saylani Clinic');
  const [clinicLogo, setClinicLogo] = useState(localStorage.getItem('clinic_logo') || logoImg);

  useEffect(() => {
    const handleStorageChange = () => {
      setClinicName(localStorage.getItem('clinic_name') || 'Saylani Clinic');
      setClinicLogo(localStorage.getItem('clinic_logo') || logoImg);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <img
          src={clinicLogo}
          alt={clinicName}
          style={{ width: '26px', height: '26px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
        />
        <div className="brand-text">
          <span className="brand-name" style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px', display: 'block' }}>
            {clinicName.toUpperCase()}
          </span>
          <span className="brand-sub" style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>AI Clinic</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(
            item => !item.roles || item.roles.includes(user?.role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <motion.div
              key={group.label}
              className="nav-group"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: groupIdx * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="nav-group-label">{group.label}</span>
              <ul>
                {visibleItems.map((item, itemIdx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`nav-link ${isActive ? 'active' : ''}`}
                      >
                        <span className="nav-icon-wrap">
                          <item.icon size={15} strokeWidth={isActive ? 2.5 : 1.75} />
                        </span>
                        <span className="nav-link-text">{item.title}</span>
                        <AnimatePresence>
                          {isActive && (
                            <motion.span
                              layoutId="activeNavDot"
                              className="nav-active-dot"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            />
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </nav>

      {/* Plan widget */}
      <div className="sidebar-subscription">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--text-muted)' }}>
            Your plan
          </span>
          <span style={{
            fontSize: '0.625rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.1875rem 0.625rem',
            borderRadius: 'var(--r-md)',
            background: user?.subscriptionPlan === 'pro' ? 'var(--success)' : 'var(--surface-3)',
            color: user?.subscriptionPlan === 'pro' ? '#ffffff' : 'var(--text-secondary)',
          }}>
            {user?.subscriptionPlan === 'pro' ? 'PRO PLAN' : 'Free'}
          </span>
        </div>
        {user?.subscriptionPlan !== 'pro' ? (
          <button
            onClick={() => setIsPricingOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--r-md)',
              padding: '0.375rem 0.625rem',
              fontSize: '0.6875rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              transition: 'background var(--t-fast) var(--ease-out)',
              letterSpacing: '-0.01em',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
          >
            <Zap size={11} />
            Upgrade to Pro
          </button>
        ) : (
          <span style={{
            fontSize: '0.6875rem',
            color: 'var(--success)',
            fontWeight: '500',
            display: 'block',
          }}>
            All features unlocked
          </span>
        )}
      </div>

      {/* User row */}
      <div className="sidebar-user">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'MJ')}&background=e4e4e7&color=3f3f46&bold=true&size=60`}
          alt="Profile"
          className="user-avatar"
          style={{ objectFit: 'cover' }}
        />
        <div className="user-meta">
          <span className="user-name">{user?.name || 'Muhammad Junaid'}</span>
          <span className="user-role">{user?.role || 'Admin'}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Sign out">
          <LogOut size={13} />
        </button>
      </div>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </aside>
  );
};

export default Sidebar;
