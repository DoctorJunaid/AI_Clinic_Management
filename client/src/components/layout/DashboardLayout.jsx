import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import StartupModal from '../common/StartupModal';

const DashboardLayout = () => {
  const location = useLocation();
  const [isStartupOpen, setIsStartupOpen] = useState(false);

  useEffect(() => {
    // Show startup onboarding modal once per user session
    const hasSeenStartup = sessionStorage.getItem('saylani_seen_startup');
    if (!hasSeenStartup) {
      setIsStartupOpen(true);
      sessionStorage.setItem('saylani_seen_startup', 'true');
    }
  }, []);
  
  // Basic logic to get title from path
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header title={getPageTitle()} />
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Flagship Startup Modal */}
      <StartupModal 
        isOpen={isStartupOpen} 
        onClose={() => setIsStartupOpen(false)} 
      />
    </div>
  );
};

export default DashboardLayout;
