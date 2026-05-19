import React, { useContext, useState } from 'react';
import { X, Check, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

const PricingModal = ({ isOpen, onClose }) => {
  const { user, updateSubscription } = useContext(AuthContext);
  const [billingPeriod, setBillingPeriod] = useState('yearly'); // 'monthly' or 'yearly'
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan) => {
    setIsUpdating(true);
    const success = await updateSubscription(plan);
    setIsUpdating(false);
    if (success) {
      if (plan === 'pro') {
        toast.success('Payment gateway coming soon! Free Beta Auto-Upgrade applied.');
      } else {
        toast.success('Subscription plan updated successfully.');
      }
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === 'pricing-backdrop') {
      onClose();
    }
  };

  return (
    <div className="pricing-backdrop" onClick={handleBackdropClick} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div className="pricing-modal-wrapper" style={{
        background: '#ffffff', // Clean pure white background to match the website theme!
        color: '#1e293b',      // Slate-800 text
        border: '1px solid #e2e8f0', // Light slate-200 border
        borderRadius: '20px',
        width: '100%',
        maxWidth: '850px',
        overflow: 'hidden',
        position: 'relative',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
        animation: 'pricingScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        
        {/* Style block for animations */}
        <style>{`
          @keyframes pricingScaleUp {
            from { opacity: 0; transform: scale(0.97) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .pricing-backdrop {
            animation: fadeIn 0.2s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        {/* Close trigger */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#64748b',
            borderRadius: '50%',
            padding: '0.45rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f8fafc'; }}
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#0f172a' }}>
            Plans and Pricing
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Choose the diagnostic computing workspace size that fits your clinic.
          </p>

          {/* Toggle Monthly/Yearly */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '0.25rem',
            borderRadius: '30px',
            border: '1px solid #e2e8f0'
          }}>
            <button 
              onClick={() => setBillingPeriod('monthly')}
              style={{
                background: billingPeriod === 'monthly' ? '#ffffff' : 'transparent',
                color: billingPeriod === 'monthly' ? '#0f172a' : '#64748b',
                border: 'none',
                boxShadow: billingPeriod === 'monthly' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                padding: '0.45rem 1.25rem',
                borderRadius: '30px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingPeriod('yearly')}
              style={{
                background: billingPeriod === 'yearly' ? 'linear-gradient(135deg, #496800 0%, #364e00 100%)' : 'transparent',
                color: billingPeriod === 'yearly' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '0.45rem 1.25rem',
                borderRadius: '30px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              Yearly
            </button>
          </div>
          
          <div style={{ 
            marginTop: '0.85rem', 
            fontSize: '0.75rem', 
            color: '#496800', 
            fontWeight: '600',
            background: '#f3f8e6',
            display: 'inline-block',
            padding: '0.35rem 1rem',
            borderRadius: '8px',
            border: '1px dashed #c8f17a'
          }}>
            Exclusive Beta Offer: Unlock the Pro Plan instantly to test all clinical intelligence components.
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'stretch'
        }}>
          
          {/* FREE PLAN CARD */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Free Plan</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.75rem 0' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>$0</span>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>/month</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 1.25rem 0' }}>Standard clinical operations toolkit</p>
              
              <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '1.25rem' }}></div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#334155' }}>
                  <Check size={13} style={{ color: '#496800', shrink: 0 }} />
                  <span>Limit: Up to 5 Active Patients</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#334155' }}>
                  <Check size={13} style={{ color: '#496800', shrink: 0 }} />
                  <span>Standard Appointment Booking</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <Lock size={12} style={{ color: '#94a3b8', shrink: 0 }} />
                  <span style={{ textDecoration: 'line-through' }}>AI Symptom Diagnosers</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <Lock size={12} style={{ color: '#94a3b8', shrink: 0 }} />
                  <span style={{ textDecoration: 'line-through' }}>AI Prescription Explainer</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <Lock size={12} style={{ color: '#94a3b8', shrink: 0 }} />
                  <span style={{ textDecoration: 'line-through' }}>Predictive Disease Forecasts</span>
                </li>
              </ul>
            </div>

            <button 
              disabled={isUpdating || user?.subscriptionPlan !== 'pro'}
              onClick={() => handleSelectPlan('free')}
              style={{
                marginTop: '2rem',
                background: user?.subscriptionPlan === 'pro' ? '#f1f5f9' : '#e2e8f0',
                color: user?.subscriptionPlan === 'pro' ? '#0f172a' : '#64748b',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: user?.subscriptionPlan === 'pro' ? 'pointer' : 'default',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { if (user?.subscriptionPlan === 'pro') e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseOut={(e) => { if (user?.subscriptionPlan === 'pro') e.currentTarget.style.background = '#f1f5f9'; }}
            >
              {user?.subscriptionPlan === 'pro' ? 'Downgrade to Free' : 'Free Version Active'}
            </button>
          </div>

          {/* PRO PLAN CARD */}
          <div style={{
            background: '#ffffff',
            border: '2px solid #496800',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            transition: 'all 0.2s ease',
            boxShadow: '0 10px 25px rgba(73, 104, 0, 0.05)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              background: '#496800',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.2rem 0.75rem',
              borderRadius: '20px'
            }}>
              Most Popular
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Pro Plan</h3>
                <span style={{ fontSize: '0.65rem', color: '#496800', fontWeight: '700', background: '#e5f1cc', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  Save 20%
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.75rem 0' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a' }}>
                  {billingPeriod === 'yearly' ? '$39' : '$49'}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>/month</span>
              </div>
              <p style={{ color: '#334155', fontSize: '0.75rem', margin: '0 0 1.25rem 0' }}>Complete intelligent clinician suite</p>
              
              <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '1.25rem' }}></div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#1e293b' }}>
                  <ShieldCheck size={13} style={{ color: '#496800', shrink: 0 }} />
                  <strong>Unlimited Patient Registers</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#1e293b' }}>
                  <ShieldCheck size={13} style={{ color: '#496800', shrink: 0 }} />
                  <strong>AI Smart Symptom Diagnosis</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#1e293b' }}>
                  <ShieldCheck size={13} style={{ color: '#496800', shrink: 0 }} />
                  <strong>AI Prescription Explainer (Urdu)</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#1e293b' }}>
                  <ShieldCheck size={13} style={{ color: '#496800', shrink: 0 }} />
                  <strong>Predictive Disease Load Forecasting</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#1e293b' }}>
                  <ShieldCheck size={13} style={{ color: '#496800', shrink: 0 }} />
                  <span>Advanced Patient & Revenue Analytics</span>
                </li>
              </ul>
            </div>

            <button 
              disabled={isUpdating || user?.subscriptionPlan === 'pro'}
              onClick={() => handleSelectPlan('pro')}
              style={{
                marginTop: '2rem',
                background: user?.subscriptionPlan === 'pro' ? '#f1f5f9' : '#000000', // Solid black matching logo/buttons
                color: user?.subscriptionPlan === 'pro' ? '#64748b' : '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: user?.subscriptionPlan === 'pro' ? 'default' : 'pointer',
                width: '100%',
                transition: 'all 0.2s ease',
                boxShadow: user?.subscriptionPlan === 'pro' ? 'none' : '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => { if (user?.subscriptionPlan !== 'pro') e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { if (user?.subscriptionPlan !== 'pro') e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {user?.subscriptionPlan === 'pro' ? 'Pro Plan Active' : 'Upgrade to Pro'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PricingModal;
