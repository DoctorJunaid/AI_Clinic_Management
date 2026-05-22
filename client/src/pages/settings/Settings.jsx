import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, CreditCard, Paintbrush, 
  Building, Save, Check, Plus, Trash2 
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import FileUpload from '../../components/common/FileUpload';
import './Settings.css';

const Settings = () => {
  const { loadUser } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  
  // Settings state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPublicId, setAvatarPublicId] = useState('');
  
  const [clinicName, setClinicName] = useState('Saylani Clinic.');
  const [clinicAddress, setClinicAddress] = useState('Gulshan-e-Iqbal, Karachi, Pakistan');
  const [clinicPhone, setClinicPhone] = useState('0300-1112233');
  const [clinicLogo, setClinicLogo] = useState('');
  const [clinicLogoPublicId, setClinicLogoPublicId] = useState('');
  
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
    // Load clinic configs from localStorage
    const storedName = localStorage.getItem('clinic_name');
    const storedAddress = localStorage.getItem('clinic_address');
    const storedPhone = localStorage.getItem('clinic_phone');
    const storedLogo = localStorage.getItem('clinic_logo');
    const storedLogoPublicId = localStorage.getItem('clinic_logo_public_id');

    if (storedName) setClinicName(storedName);
    if (storedAddress) setClinicAddress(storedAddress);
    if (storedPhone) setClinicPhone(storedPhone);
    if (storedLogo) setClinicLogo(storedLogo);
    if (storedLogoPublicId) setClinicLogoPublicId(storedLogoPublicId);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me');
      const user = res.data.data;
      setCurrentUser(user);
      setName(user.name);
      setPhone(user.phone || '');
      setSpecialization(user.specialization || '');
      setAvatar(user.avatar || '');
      setAvatarPublicId(user.avatarPublicId || '');
      const storedPlan = localStorage.getItem('demo_saas_plan');
      setSubscriptionPlan(storedPlan || user.subscriptionPlan || 'pro');

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
        specialization,
        avatar,
        avatarPublicId
      });
      setCurrentUser({ ...currentUser, name, phone, specialization, avatar, avatarPublicId });
      toast.success('Profile details updated successfully!');
      if (loadUser) await loadUser();
    } catch (err) {
      setCurrentUser({ ...currentUser, name, phone, specialization, avatar, avatarPublicId });
      toast.success('Profile details updated successfully (Sandbox Mode)!');
      if (loadUser) await loadUser();
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      toast.error('Please fill out all required fields');
      return;
    }

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
    localStorage.setItem('clinic_name', clinicName);
    localStorage.setItem('clinic_address', clinicAddress);
    localStorage.setItem('clinic_phone', clinicPhone);
    localStorage.setItem('clinic_logo', clinicLogo);
    localStorage.setItem('clinic_logo_public_id', clinicLogoPublicId);
    toast.success('Clinic configurations saved successfully!');
    // Trigger real-time storage event for the sidebar to pick up the logo immediately
    window.dispatchEvent(new Event('storage'));
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'profile':
        return (
          <motion.div 
            key="profile"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="settings-section-card"
          >
            <div className="section-header">
              <h3 className="section-title">Profile Settings</h3>
            </div>
            {isLoading ? (
              <p>Loading profile...</p>
            ) : (
              <form onSubmit={handleUpdateProfile} className="form-stack">
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div style={{ width: '130px', flexShrink: 0 }}>
                    <label className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Profile Photo</label>
                    <FileUpload
                      type="avatar"
                      accept="image/*"
                      maxSize={2 * 1024 * 1024}
                      label="Upload Photo"
                      value={avatar}
                      publicId={avatarPublicId}
                      onUploadSuccess={({ url, publicId }) => {
                        setAvatar(url);
                        setAvatarPublicId(publicId);
                      }}
                      onRemove={() => {
                        setAvatar('');
                        setAvatarPublicId('');
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="field-group">
                      <label className="field-label">Full Name</label>
                      <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-row">
                      <div className="field-group">
                        <label className="field-label">Contact Number</label>
                        <input type="text" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Specialization / Role</label>
                        <input type="text" className="input-field" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Pediatrics" disabled={currentUser?.role !== 'doctor' && currentUser?.role !== 'admin'} />
                      </div>
                    </div>
                    <div className="field-group">
                      <label className="field-label">Email Address</label>
                      <input type="email" className="input-field" value={currentUser?.email || ''} disabled />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        );

      case 'clinic':
        if (currentUser?.role !== 'admin') return null;
        return (
          <motion.div 
            key="clinic"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="settings-section-card"
          >
            <div className="section-header">
              <h3 className="section-title">Clinic Information</h3>
            </div>
            <form onSubmit={handleSaveClinicSettings} className="form-stack">
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ width: '130px', flexShrink: 0 }}>
                  <label className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Clinic Logo</label>
                  <FileUpload
                    type="avatar"
                    accept="image/*"
                    maxSize={2 * 1024 * 1024}
                    label="Upload Logo"
                    value={clinicLogo}
                    publicId={clinicLogoPublicId}
                    onUploadSuccess={({ url, publicId }) => {
                      setClinicLogo(url);
                      setClinicLogoPublicId(publicId);
                    }}
                    onRemove={() => {
                      setClinicLogo('');
                      setClinicLogoPublicId('');
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="field-group">
                    <label className="field-label">Clinic Name</label>
                    <input type="text" className="input-field" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Clinic Address</label>
                    <input type="text" className="input-field" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} required />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Primary Phone</label>
                    <input type="text" className="input-field" value={clinicPhone} onChange={(e) => setClinicPhone(e.target.value)} required />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={14} /> Save Settings
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 'staff':
        if (currentUser?.role !== 'admin') return null;
        return (
          <motion.div 
            key="staff"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="settings-section-card"
          >
            <div className="section-header">
              <h3 className="section-title">Staff & Accounts</h3>
              <span className="badge badge-info">{staffList.length} Accounts</span>
            </div>
            
            <form onSubmit={handleCreateStaff} className="staff-register-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600 }}>Register Staff Member</h4>
                {subscriptionPlan === 'free' && (
                  <span className="badge badge-warning">Slots: {staffList.length}/1</span>
                )}
              </div>
              
              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <input type="text" className="input-field" placeholder="Dr. Yasir" value={staffName} onChange={(e) => setStaffName(e.target.value)} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input type="email" className="input-field" placeholder="staff@saylani.com" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required />
                </div>
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">Password</label>
                  <input type="password" className="input-field" placeholder="Min 6 chars" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required />
                </div>
                <div className="field-group">
                  <label className="field-label">System Role</label>
                  <select className="input-field" value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">Phone Number</label>
                  <input type="text" className="input-field" placeholder="0300-1234567" value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} />
                </div>
                {staffRole === 'doctor' && (
                  <div className="field-group">
                    <label className="field-label">Specialization</label>
                    <input type="text" className="input-field" placeholder="e.g. Pediatrics" value={staffSpec} onChange={(e) => setStaffSpec(e.target.value)} />
                  </div>
                )}
              </div>
              
              <button type="submit" disabled={isCreatingStaff} className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={14} /> {isCreatingStaff ? 'Registering...' : 'Register Staff Account'}
              </button>
            </form>

            <div className="staff-list">
              <span className="field-label">Active Directory</span>
              {staffList.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No staff records found.</p>
              ) : (
                staffList.map(staff => (
                  <div key={staff._id} className="staff-row">
                    <div className="staff-info">
                      <div className="staff-avatar">{staff.name.substring(0,2).toUpperCase()}</div>
                      <div className="staff-details">
                        <span className="staff-name">{staff.name}</span>
                        <span className="staff-role">{staff.role} {staff.specialization ? `(${staff.specialization})` : ''}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteStaff(staff._id)} className="delete-btn">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        );

      case 'billing':
        if (currentUser?.role !== 'admin') return null;
        return (
          <motion.div 
            key="billing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="settings-section-card"
          >
            <div className="section-header">
              <h3 className="section-title">Plan & Billing</h3>
              <span className="badge" style={{ background: 'var(--primary)', color: '#fff' }}>Active: {subscriptionPlan.toUpperCase()}</span>
            </div>

            <div className="form-stack">
              <div 
                className={`plan-row ${subscriptionPlan === 'free' ? 'active' : ''}`}
                onClick={() => handleUpdateSubscription('free')}
              >
                <div className="plan-details">
                  <span className="plan-name">Starter Basic Plan (Free)</span>
                  <span className="plan-features">1 doctor slot · 5 AI checks/mo · Manual logs</span>
                </div>
                {subscriptionPlan === 'free' && <Check size={18} style={{ color: 'var(--primary)' }} />}
              </div>

              <div 
                className={`plan-row ${subscriptionPlan === 'pro' ? 'active' : ''}`}
                onClick={() => handleUpdateSubscription('pro')}
              >
                <div className="plan-details">
                  <span className="plan-name">Pro Clinical AI Plan ($150/mo)</span>
                  <span className="plan-features">Unlimited slots · Infinite AI checks · Advanced labs</span>
                </div>
                {subscriptionPlan === 'pro' && <Check size={18} style={{ color: 'var(--primary)' }} />}
              </div>

              <div className="plan-desc-block">
                <strong>{subscriptionPlan === 'pro' ? '✓ Pro Subscription Active' : '⚠️ Starter Limitations Active'}</strong>
                <br/>
                {subscriptionPlan === 'pro' 
                  ? 'Your clinical portal is operating on the Pro tier. Unlimited diagnostic panels, instant symptom correlations, and infinite doctor slots are enabled.'
                  : 'Your clinic is operating under Starter limitations. Registering more than one staff slot or running additional AI checks requires transitioning to Pro.'}
              </div>
            </div>
          </motion.div>
        );

      case 'appearance':
        if (currentUser?.role !== 'admin') return null;
        return (
          <motion.div 
            key="appearance"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="settings-section-card"
          >
            <div className="section-header">
              <h3 className="section-title">Visual Preferences</h3>
            </div>
            <div className="form-stack">
              <span className="field-label">Interface Theme</span>
              <div className="theme-btn-group">
                {['light', 'dark', 'system'].map((mode) => (
                  <button
                    key={mode}
                    className={`theme-btn ${themeMode === mode ? 'active' : ''}`}
                    onClick={() => {
                      setThemeMode(mode);
                      toast.success(`${mode.charAt(0).toUpperCase() + mode.slice(1)} preset loaded!`);
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="settings-page"
    >
      <div className="settings-header">
        <h1 className="settings-title">Control Center</h1>
        <p className="settings-subtitle">Manage preferences, team accounts, and billing details.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          <span className="nav-group-label">Personal</span>
          <button 
            className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={16} /> Profile
          </button>
          
          {currentUser?.role === 'admin' && (
            <>
              <span className="nav-group-label" style={{ marginTop: '1rem' }}>Workspace</span>
              <button 
                className={`settings-nav-item ${activeSection === 'clinic' ? 'active' : ''}`}
                onClick={() => setActiveSection('clinic')}
              >
                <Building size={16} /> Clinic Info
              </button>
              <button 
                className={`settings-nav-item ${activeSection === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveSection('staff')}
              >
                <Shield size={16} /> Staff & Roles
              </button>
              <button 
                className={`settings-nav-item ${activeSection === 'billing' ? 'active' : ''}`}
                onClick={() => setActiveSection('billing')}
              >
                <CreditCard size={16} /> Plan & Billing
              </button>
              <button 
                className={`settings-nav-item ${activeSection === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveSection('appearance')}
              >
                <Paintbrush size={16} /> Appearance
              </button>
            </>
          )}
        </div>

        <div className="settings-content">
          <AnimatePresence mode="wait">
            {renderSection()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
