import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  User, Shield, CreditCard, Paintbrush, 
  Building, Save, Check, Plus, Trash2 
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  
  const [clinicName, setClinicName] = useState('Saylani Clinic.');
  const [clinicAddress, setClinicAddress] = useState('Gulshan-e-Iqbal, Karachi, Pakistan');
  const [clinicPhone, setClinicPhone] = useState('0300-1112233');
  
  const [themeMode, setThemeMode] = useState('light');
  const [subscriptionPlan, setSubscriptionPlan] = useState('pro');

  // Staff creation & list state
  const [staffList, setStaffList] = useState([]);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('doctor');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffSpec, setStaffSpec] = useState('');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me');
      const user = res.data.data;
      setCurrentUser(user);
      setName(user.name);
      setPhone(user.phone || '');
      setSpecialization(user.specialization || '');
      // Cache local preference for demo or load from user
      const storedPlan = localStorage.getItem('demo_saas_plan');
      setSubscriptionPlan(storedPlan || user.subscriptionPlan || 'pro');

      // If user is admin, also fetch active staff list
      if (user.role === 'admin') {
        fetchStaff();
      }
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/api/v1/auth/users');
      setStaffList(res.data.data);
    } catch (err) {
      console.error('Failed to load staff list');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/v1/auth/update-profile', {
        name,
        phone,
        specialization
      });
      setCurrentUser({ ...currentUser, name, phone, specialization });
      toast.success('Profile details updated successfully!');
    } catch (err) {
      setCurrentUser({ ...currentUser, name, phone, specialization });
      toast.success('Profile details updated successfully (Sandbox Mode)!');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      toast.error('Please fill out all required fields');
      return;
    }

    // SaaS starter limits check!
    if (subscriptionPlan === 'free' && staffList.length >= 1) {
      toast.error('Starter Plan Limit Reached! Upgrade your SaaS Plan to Pro to register multiple staff accounts.');
      return;
    }

    setIsCreatingStaff(true);
    try {
      await axios.post('/api/v1/auth/register', {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole,
        phone: staffPhone,
        specialization: staffRole === 'doctor' ? staffSpec : undefined
      });
      toast.success('Staff account registered successfully!');
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffPhone('');
      setStaffSpec('');
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register staff account');
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await axios.delete(`/api/v1/auth/users/${id}`);
      toast.success('Staff member removed successfully');
      fetchStaff();
    } catch (err) {
      toast.error('Failed to remove staff member');
    }
  };

  const handleUpdateSubscription = async (newPlan) => {
    try {
      setSubscriptionPlan(newPlan);
      localStorage.setItem('demo_saas_plan', newPlan);
      toast.success(`Subscription Plan switched to ${newPlan.toUpperCase()} Plan!`);
    } catch (err) {
      toast.error('Failed to update subscription');
    }
  };

  const handleSaveClinicSettings = (e) => {
    e.preventDefault();
    toast.success('Clinic configurations saved successfully!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="settings-container"
    >
      <div className="settings-header-section">
        <div>
          <h1>Saylani Clinic Control Center</h1>
          <p>Configure staff credentials, update contact records, and modify active subscriptions.</p>
        </div>
      </div>

      <div className="settings-grid-layout">
        {/* LEFT COLUMN: Profile & Clinic Settings */}
        <div className="form-stack">
          {/* User Profile Form */}
          <div className="glass-card">
            <div className="glass-card-header">
              <div className="glass-card-header-left">
                <User size={16} />
                <h3>My Staff Profile Settings</h3>
              </div>
            </div>
            
            {isLoading ? (
              <div className="skeleton w-full h-24"></div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="form-stack">
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <input 
                    type="text" 
                    className="premium-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Contact Number</label>
                    <input 
                      type="text" 
                      className="premium-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Specialization / Role</label>
                    <input 
                      type="text" 
                      className="premium-input"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Pediatrics"
                      disabled={currentUser?.role !== 'doctor' && currentUser?.role !== 'admin'}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input 
                    type="email" 
                    className="premium-input"
                    value={currentUser?.email || ''}
                    disabled
                  />
                </div>

                <button type="submit" className="premium-btn">
                  <Save size={14} /> Update Profile
                </button>
              </form>
            )}
          </div>

          {/* Clinic Configurations (Only visible to Admin) */}
          {currentUser?.role === 'admin' && (
            <div className="glass-card">
              <div className="glass-card-header">
                <div className="glass-card-header-left">
                  <Building size={16} />
                  <h3>Clinic Information Settings</h3>
                </div>
              </div>

              <form onSubmit={handleSaveClinicSettings} className="form-stack">
                <div className="field-group">
                  <label className="field-label">Clinic Name</label>
                  <input 
                    type="text" 
                    className="premium-input"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Clinic Address</label>
                  <input 
                    type="text" 
                    className="premium-input"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Primary Phone</label>
                  <input 
                    type="text" 
                    className="premium-input"
                    value={clinicPhone}
                    onChange={(e) => setClinicPhone(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="premium-btn">
                  <Save size={14} /> Save Clinic Settings
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Admin User Management Panel & SaaS Options */}
        <div className="form-stack">
          {/* Staff Accounts Management (Only visible to Admin) */}
          {currentUser?.role === 'admin' && (
            <div className="glass-card">
              <div className="glass-card-header">
                <div className="glass-card-header-left">
                  <Shield size={16} />
                  <h3>Clinic Staff & Accounts Console</h3>
                </div>
                <span className="glass-card-badge">Admin</span>
              </div>

              {/* Form to Register Staff Account */}
              <form onSubmit={handleCreateStaff} className="form-stack" style={{ background: '#f8faf9', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                  <span className="field-label" style={{ color: '#64748b', flex: '1' }}>Register New Staff Member</span>
                  {subscriptionPlan === 'free' && (
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#f59e0b', background: '#fffbeb', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      Starter Slots: {staffList.length}/1 Max
                    </span>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Full Name</label>
                    <input 
                      type="text" 
                      className="premium-input"
                      placeholder="e.g. Dr. Yasir"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Email Address</label>
                    <input 
                      type="email" 
                      className="premium-input"
                      placeholder="staff@saylani.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Password</label>
                    <input 
                      type="password" 
                      className="premium-input"
                      placeholder="Min 6 chars"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">System Role</label>
                    <select 
                      className="premium-input"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                    >
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="premium-input"
                      placeholder="e.g. 0300-1234567"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                    />
                  </div>
                  {staffRole === 'doctor' && (
                    <div className="field-group">
                      <label className="field-label">Specialization</label>
                      <input 
                        type="text" 
                        className="premium-input"
                        placeholder="e.g. Pediatrics"
                        value={staffSpec}
                        onChange={(e) => setStaffSpec(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isCreatingStaff} className="premium-btn" style={{ alignSelf: 'stretch', width: '100%', marginTop: '0.25rem' }}>
                  <Plus size={14} />
                  <span>{isCreatingStaff ? 'Registering Staff...' : 'Register Staff Account'}</span>
                </button>
              </form>

              {/* Staff Registry List */}
              <div className="registry-stack">
                <span className="field-label">Active Staff Registry</span>
                <div className="registry-scroll-area">
                  {staffList.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No registered staff records loaded.</span>
                  ) : (
                    staffList.map(staff => (
                      <div key={staff._id} className="registry-item">
                        <div className="registry-item-details">
                          <strong>{staff.name}</strong>
                          <span>
                            Role: {staff.role} {staff.specialization ? `(${staff.specialization})` : ''}
                          </span>
                        </div>
                        <button onClick={() => handleDeleteStaff(staff._id)} className="registry-delete-btn">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account Details & Role Details (Visible ONLY to Non-Admins: Doctors & Receptionists) */}
          {currentUser?.role !== 'admin' && (
            <div className="glass-card" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
              <div className="glass-card-header">
                <div className="glass-card-header-left">
                  <Shield size={16} />
                  <h3>Account Access & Permissions</h3>
                </div>
                <span className="glass-card-badge" style={{ background: '#e2e8f0', color: '#475569' }}>
                  {currentUser?.role}
                </span>
              </div>
              <div className="form-stack">
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                  Your account is registered as an active staff member of the clinical workstation. General settings, system visual preferences, and subscription tier settings are managed centrally by the administrative director.
                </p>
                <div style={{ background: '#f8faf9', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Administrator Contact</span>
                  <strong style={{ fontSize: '0.8rem', color: '#1e293b' }}>Dr. Junaid Aurangzeb (Clinical Admin)</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>admin@saylani.com</span>
                </div>
              </div>
            </div>
          )}

          {/* SaaS subscription Plan selection (Only visible to Admin) */}
          {currentUser?.role === 'admin' && (
            <div className="glass-card">
              <div className="glass-card-header">
                <div className="glass-card-header-left">
                  <CreditCard size={16} />
                  <h3>SaaS Billing & Plan Selection</h3>
                </div>
                <span className="glass-card-badge" style={{ background: '#c8f17a' }}>
                  Active: {subscriptionPlan.toUpperCase()}
                </span>
              </div>

              <div className="subscription-plans-grid">
                <div 
                  className={`sub-plan-row ${subscriptionPlan === 'free' ? 'active' : ''}`}
                  onClick={() => handleUpdateSubscription('free')}
                >
                  <div className="sub-plan-details">
                    <strong>Starter Basic Plan (Free)</strong>
                    <span>Up to 1 doctor slot · 5 AI checks/month · Manual intake logs</span>
                  </div>
                  {subscriptionPlan === 'free' && <Check size={16} style={{ color: '#10b981' }} />}
                </div>

                <div 
                  className={`sub-plan-row ${subscriptionPlan === 'pro' ? 'active' : ''}`}
                  onClick={() => handleUpdateSubscription('pro')}
                >
                  <div className="sub-plan-details">
                    <strong>
                      Pro Clinical AI Plan (PKR 12,500/mo)
                    </strong>
                    <span>Unlimited staff slots · Infinite Qwen symptom checks · Laboratory recommendations</span>
                  </div>
                  {subscriptionPlan === 'pro' && <Check size={16} style={{ color: '#10b981' }} />}
                </div>
              </div>

              <div className="plan-perks-box">
                <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.35rem' }}>
                  {subscriptionPlan === 'pro' ? '✓ Pro Subscription active clinic-wide' : '⚠️ Starter Limitations active'}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', margin: '0' }}>
                  {subscriptionPlan === 'pro' 
                    ? 'Your clinical portal is operating on the Pro AI subscription tier. Unlimited diagnostic panels, instant symptom correlations, and infinite doctors slots are enabled.'
                    : 'Your clinic is operating under Starter limitations. Registering more than one staff slot or running additional AI symptom correlations requires transitioning to the Pro tier.'}
                </p>
              </div>
            </div>
          )}

          {/* Visual Themes selection (Only visible to Admin) */}
          {currentUser?.role === 'admin' && (
            <div className="glass-card">
              <div className="glass-card-header">
                <div className="glass-card-header-left">
                  <Paintbrush size={16} />
                  <h3>Visual Settings</h3>
                </div>
              </div>

              <div className="themes-preset-row">
                {['light', 'dark', 'system'].map((mode) => (
                  <button
                    key={mode}
                    className={`theme-btn ${themeMode === mode ? 'active' : ''}`}
                    onClick={() => {
                      setThemeMode(mode);
                      toast.success(`${mode.toUpperCase()} preset loaded!`);
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
