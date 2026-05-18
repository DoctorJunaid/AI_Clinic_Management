import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit3, Heart, Activity, Droplet, Plus, Brain, Image as ImageIcon, ChevronRight, FileText } from 'lucide-react';
import AddPatientModal from '../../components/common/AddPatientModal';
import '../../components/common/Modal.css';
import './Patients.css';

// Fallback images for a realistic feel instead of AI slop
const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces'
];

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/v1/patients');
      // Mix in real images for demo
      const dataWithImgs = res.data.data.map((p, i) => ({
        ...p,
        avatar: p.avatar || FALLBACK_AVATARS[i % FALLBACK_AVATARS.length]
      }));
      setPatients(dataWithImgs);
      if (dataWithImgs.length > 0 && !activePatient) {
        setActivePatient(dataWithImgs[0]);
      }
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = (newPatient) => {
    const pWithImg = { ...newPatient, avatar: FALLBACK_AVATARS[patients.length % FALLBACK_AVATARS.length] };
    setPatients([pWithImg, ...patients]);
    setActivePatient(pWithImg);
  };

  const runSmartDiagnosis = async () => {
    if (!activePatient) return;
    setIsAiLoading(true);
    try {
      const res = await axios.post('/api/v1/ai/symptom-check', {
        symptoms: ['chest discomfort', 'mild fatigue'],
        age: activePatient.age,
        gender: activePatient.gender,
        history: activePatient.medicalHistory || 'None'
      });
      setAiDiagnosis(res.data.data);
      toast.success('Clinical Analysis Complete');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI Diagnosis failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-full">
      <div className="skeleton w-32 h-8"></div>
    </div>
  );

  return (
    <div className="patient-module h-full">
      
      {/* Left Sidebar: Patient List */}
      <div className="patient-list-sidebar card border-0 rounded-none rounded-l-2xl">
        <div className="list-header">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Patients</h3>
            <button className="icon-btn w-8 h-8" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
            </button>
          </div>
          <div className="search-bar-small">
            <Search size={14} className="text-muted" />
            <input type="text" placeholder="Search patients..." />
          </div>
        </div>

        <div className="patients-scroll-list">
          {patients.length === 0 ? (
            <div className="p-4 text-center text-secondary text-sm">No patients found</div>
          ) : (
            patients.map(p => (
              <div 
                key={p._id} 
                className={`patient-list-item ${activePatient?._id === p._id ? 'active' : ''}`}
                onClick={() => { setActivePatient(p); setAiDiagnosis(null); }}
              >
                <img src={p.avatar} alt={p.name} className="avatar" />
                <div className="p-info">
                  <h4>{p.name}</h4>
                  <p>{p.gender === 'male' ? 'M' : 'F'} • {p.age} yrs</p>
                </div>
                {activePatient?._id === p._id && <ChevronRight size={16} className="text-primary ml-auto" />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Area: Patient Details */}
      <div className="patient-details-area">
        <div className="details-header">
          <div className="tabs">
            <button className="tab active">Overview</button>
            <button className="tab">Appointments</button>
            <button className="tab">History</button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline">
              <FileText size={14} /> Report
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={14} /> New Record
            </button>
          </div>
        </div>

        <div className="details-content">
          <AnimatePresence mode="wait">
            {activePatient ? (
              <motion.div 
                key={activePatient._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 gap-6"
              >
                
                {/* Main Medical Info */}
                <div className="col-span-2 flex flex-col gap-6">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="card stat-mini">
                      <div className="stat-icon-wrap bg-danger-subtle"><Heart className="text-danger" size={18} /></div>
                      <div className="stat-info">
                        <span className="label">Heart Rate</span>
                        <span className="val">72 <span className="unit">bpm</span></span>
                      </div>
                    </div>
                    <div className="card stat-mini">
                      <div className="stat-icon-wrap bg-primary-subtle"><Activity className="text-primary" size={18} /></div>
                      <div className="stat-info">
                        <span className="label">Blood Pressure</span>
                        <span className="val">120/80 <span className="unit">mmHg</span></span>
                      </div>
                    </div>
                    <div className="card stat-mini">
                      <div className="stat-icon-wrap bg-warning-subtle"><Droplet className="text-warning" size={18} /></div>
                      <div className="stat-info">
                        <span className="label">Blood Group</span>
                        <span className="val">{activePatient.bloodGroup || 'A+'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Diagnosis AI Box */}
                  <div className="card ai-diagnosis-card overflow-hidden">
                    <div className="card-header border-b pb-4 mb-4 flex justify-between items-center bg-surface-2 -mx-6 -mt-6 px-6 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="ai-icon-bg">
                          <Brain size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="card-title mb-0 font-bold">Clinical Analysis</h3>
                          <p className="text-xs text-muted">Powered by MedFlow AI</p>
                        </div>
                      </div>
                      <button onClick={runSmartDiagnosis} disabled={isAiLoading} className="btn btn-primary text-sm shadow-sm">
                        {isAiLoading ? 'Analyzing...' : 'Run Analysis'}
                      </button>
                    </div>
                    <div className="ai-content">
                        {aiDiagnosis ? (
                          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="diagnosis-result">
                            <p className="text-sm font-medium mb-3">Based on symptoms and history:</p>
                            <div className="conditions-grid">
                               {aiDiagnosis.conditions?.map((c, i) => (
                                 <div key={i} className="condition-card">
                                   <div className="flex justify-between items-center mb-1">
                                      <span className="font-semibold text-sm">{c.name}</span>
                                      <span className="text-xs font-mono text-muted">{c.probability}</span>
                                   </div>
                                   <div className="prob-bar"><div className="prob-fill" style={{width: c.probability}}></div></div>
                                 </div>
                               ))}
                            </div>
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                              <div>
                                <span className="text-xs text-muted block mb-1">Risk Level</span>
                                <span className={`badge ${aiDiagnosis.riskLevel === 'low' ? 'badge-success' : 'badge-danger'}`}>{aiDiagnosis.riskLevel.toUpperCase()}</span>
                              </div>
                              <div className="flex-1">
                                <span className="text-xs text-muted block mb-1">Suggested Tests</span>
                                <span className="text-sm font-medium">{aiDiagnosis.suggestedTests?.join(', ')}</span>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="empty-ai-state">
                            <Brain size={32} className="text-muted mb-3 opacity-20" />
                            <p className="text-sm text-secondary text-center max-w-sm">
                              Run clinical analysis to assess potential conditions based on current symptoms and patient history.
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="card-title">Recent Scans</h3>
                      <button className="btn btn-ghost text-xs">View All</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="scan-img-box">
                        <img src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=250&fit=crop" alt="X-Ray" />
                        <div className="scan-overlay">
                          <span>Chest X-Ray • Oct 12</span>
                        </div>
                      </div>
                      <div className="scan-img-box empty">
                        <ImageIcon size={24} className="text-muted mb-2" />
                        <span>Upload Scan</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Sidebar: Profile */}
                <div className="card profile-card border-0 bg-surface-2">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Profile</h3>
                    <button className="icon-btn w-8 h-8 bg-surface"><Edit3 size={14}/></button>
                  </div>
                  
                  <div className="profile-img-center mb-6">
                    <div className="avatar-ring">
                      <img src={activePatient.avatar} alt={activePatient.name} />
                    </div>
                    <h4 className="text-lg font-bold mt-3">{activePatient.name}</h4>
                    <p className="text-sm text-muted">Patient ID: #PT-{activePatient._id.substring(0,6).toUpperCase()}</p>
                  </div>

                  <div className="profile-details-list">
                    <div className="detail-row">
                      <span className="label">Gender</span>
                      <span className="val capitalize">{activePatient.gender}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Age</span>
                      <span className="val">{activePatient.age} years</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone</span>
                      <span className="val">{activePatient.contact}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Allergies</span>
                      <span className="val text-danger font-medium">{activePatient.allergies?.join(', ') || 'None'}</span>
                    </div>
                  </div>
                  
                  <button className="btn btn-outline w-full mt-6 bg-surface">View Full Record</button>
                </div>

              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted">Select a patient to view details</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isModalOpen && (
        <AddPatientModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleAddPatient} 
        />
      )}
    </div>
  );
};

export default PatientList;
