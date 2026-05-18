import { Bell, Search, Settings, Calendar } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Layout.css';

const Header = ({ title = 'Dashboard', subtitle }) => {
  const { user } = useContext(AuthContext);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <span className="header-subtitle">{subtitle || `Welcome back, ${user?.name || 'Doctor'}`}</span>
      </div>
      
      <div className="header-right">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search patients, appointments..." className="search-input" />
        </div>
        
        <div className="date-chip hidden-mobile">
          <Calendar size={14} className="text-muted" />
          {today}
        </div>

        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notif-dot"></span>
        </button>

        <button className="icon-btn hidden-mobile" aria-label="Settings">
          <Settings size={18} />
        </button>
        
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Dr. Smith')}&background=ecfdf5&color=059669&bold=true`}
          alt="Profile" 
          className="header-avatar hidden-desktop" 
        />
      </div>
    </header>
  );
};

export default Header;
