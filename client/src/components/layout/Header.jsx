import { Bell, Search, Settings, Calendar } from 'lucide-react';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import './Layout.css';

// Derive a clean page title from the route path
const pageTitles = {
  '/':             { title: 'Dashboard',    sub: 'Clinical overview & analytics' },
  '/patients':     { title: 'Patients',     sub: 'EHR records & patient directory' },
  '/appointments': { title: 'Appointments', sub: 'Schedule & visit management' },
  '/treatments':   { title: 'Treatments',   sub: 'Active treatment protocols' },
  '/ai-diagnosis': { title: 'AI Diagnosis', sub: 'Differential analysis engine' },
  '/reports':      { title: 'Reports',      sub: 'Clinical performance & audit' },
  '/settings':     { title: 'Settings',     sub: 'Account & system preferences' },
  '/my-history':   { title: 'My Records',   sub: 'Your health history' },
};

const Header = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const page = pageTitles[location.pathname] || { title: 'Dashboard', sub: '' };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="header">
      <motion.div
        className="header-left"
        key={location.pathname}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="header-title">{page.title}</h1>
        <span className="header-subtitle">{page.sub}</span>
      </motion.div>

      <div className="header-right">
        <div className="header-search-container">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search patients, appointments..."
            className="header-search-input"
          />
        </div>

        <div className="date-chip hidden-mobile">
          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
          {today}
        </div>

        <button className="icon-btn" aria-label="Notifications">
          <Bell size={15} />
          <span className="notif-dot" />
        </button>

        <button className="icon-btn hidden-mobile" aria-label="Settings">
          <Settings size={15} />
        </button>

        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'MJ')}&background=e4e4e7&color=3f3f46&bold=true&size=60`}
          alt="Profile"
          className="header-avatar"
          style={{ display: 'block', objectFit: 'cover' }}
        />
      </div>
    </header>
  );
};

export default Header;
