import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import StartupModal from '../common/StartupModal';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  in:      { opacity: 1, y: 0 },
  out:     { opacity: 0, y: -4 },
};

const pageTransition = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1],
};

const DashboardLayout = () => {
  const location = useLocation();
  const [isStartupOpen, setIsStartupOpen] = useState(false);

  useEffect(() => {
    const hasSeenStartup = sessionStorage.getItem('saylani_seen_startup');
    if (!hasSeenStartup) {
      setIsStartupOpen(true);
      sessionStorage.setItem('saylani_seen_startup', 'true');
    }
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="page-wrapper"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <StartupModal
        isOpen={isStartupOpen}
        onClose={() => setIsStartupOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
