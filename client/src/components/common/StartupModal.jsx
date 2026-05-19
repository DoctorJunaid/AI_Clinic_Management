import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import startupGraphic from '../../assets/Gemini_Generated_Image_b3gts4b3gts4b3gt (1).webp'; // Flagship uncropped centered logo graphic

const StartupModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle backdrop outer click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div className="startup-backdrop" onClick={handleBackdropClick}>
      <div className="startup-modal-wrapper" ref={modalRef}>
        
        {/* Top-Right Dismiss Trigger */}
        <button className="startup-modal-close-trigger" onClick={onClose} aria-label="Close modal">
          <X size={16} />
        </button>

        {/* Center-Aligned Flagship Branding Container */}
        <div className="startup-brand-container">
          <img src={startupGraphic} alt="Saylani Clinic" className="startup-flagship-img" />
          <button className="startup-dismiss-btn" onClick={onClose}>
            Enter Workspace
          </button>
        </div>

      </div>
    </div>
  );
};

export default StartupModal;
