import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit3, Heart, Activity, Droplet, Plus, Brain, Image as ImageIcon, ChevronRight, FileText, Clock } from 'lucide-react';
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

  // Spacious interactive tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [allAppointments, setAllAppointments] = useState([]);
  const [allPrescriptions, setAllPrescriptions] = useState([]);

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    fetchPrescriptions();
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

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/v1/appointments');
      setAllAppointments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get('/api/v1/prescriptions');
      setAllPrescriptions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
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

  const activeAppointments = allAppointments.filter(app => {
    const pId = app.patientId?._id || app.patientId;
    return pId === activePatient?._id;
  });

  const activePrescriptions = allPrescriptions.filter(pr => {
    const pId = pr.patientId?._id || pr.patientId;
    return pId === activePatient?._id;
  });

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
        <AnimatePresence mode="wait">
          {activePatient ? (
            <motion.div 
              key={activePatient._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full gap-6"
            >
              {/* Profile Header Banner (Replaces Cluttered Profile Sidebar) */}
              <div className="patient-hero-banner bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="avatar-ring-large shrink-0">
                    <img src={activePatient.avatar} alt={activePatient.name} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">{activePatient.name}</h2>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                        ID: #PT-{activePatient._id.substring(0, 6).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold flex-wrap">
                      <span><strong>Gender:</strong> <span className="capitalize">{activePatient.gender}</span></span>
                      <span className="text-slate-300">•</span>
                      <span><strong>Age:</strong> {activePatient.age} years</span>
                      <span className="text-slate-300">•</span>
                      <span><strong>Phone:</strong> {activePatient.contact || 'N/A'}</span>
                      <span className="text-slate-300">•</span>
                      <span><strong>Allergies:</strong> <span className="text-red-500 font-bold">{activePatient.allergies?.join(', ') || 'None'}</span></span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-end">
                  <button className="btn btn-outline py-2.5 px-4 text-xs font-bold flex items-center gap-2" onClick={() => toast.success('Report generated successfully!')}>
                    <FileText size={14} /> Report
                  </button>
                  <button className="btn btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
                    <Plus size={14} /> New Record
                  </button>
                </div>
              </div>

              {/* Responsive Clinical Tab switcher */}
              <div className="patient-tabs-row border-b border-slate-200">
                <div className="tabs flex gap-6">
                  <button 
                    className={`tab pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'overview' ? 'active text-black border-black font-extrabold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button 
                    className={`tab pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'appointments' ? 'active text-black border-black font-extrabold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('appointments')}
                  >
                    Appointments ({activeAppointments.length})
                  </button>
                  <button 
                    className={`tab pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'history' ? 'active text-black border-black font-extrabold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    onClick={() => setActiveTab('history')}
                  >
                    Clinical History ({activePrescriptions.length})
                  </button>
                </div>
              </div>

              {/* Scrollable Details Content Workspace */}
              <div className="details-content flex-1 overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="grid grid-cols-12 gap-6"
                    >
                      {/* Left: General Stats & Smart Diagnostics */}
                      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                        {/* Mini Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="card stat-mini shadow-sm border border-slate-100 flex items-center gap-4 p-5 rounded-2xl bg-white">
                            <div className="stat-icon-wrap bg-danger-subtle w-10 h-10 rounded-full flex items-center justify-center shrink-0"><Heart className="text-danger" size={18} /></div>
                            <div className="stat-info flex flex-col">
                              <span className="label text-[10px] font-bold uppercase text-slate-400 tracking-wider">Heart Rate</span>
                              <span className="val text-lg font-bold text-slate-800 mt-0.5">72 <span className="unit text-xs text-slate-400 font-semibold">bpm</span></span>
                            </div>
                          </div>
                          <div className="card stat-mini shadow-sm border border-slate-100 flex items-center gap-4 p-5 rounded-2xl bg-white">
                            <div className="stat-icon-wrap bg-primary-subtle w-10 h-10 rounded-full flex items-center justify-center shrink-0"><Activity className="text-primary" size={18} /></div>
                            <div className="stat-info flex flex-col">
                              <span className="label text-[10px] font-bold uppercase text-slate-400 tracking-wider">Blood Pressure</span>
                              <span className="val text-lg font-bold text-slate-800 mt-0.5">120/80 <span className="unit text-xs text-slate-400 font-semibold">mmHg</span></span>
                            </div>
                          </div>
                          <div className="card stat-mini shadow-sm border border-slate-100 flex items-center gap-4 p-5 rounded-2xl bg-white">
                            <div className="stat-icon-wrap bg-warning-subtle w-10 h-10 rounded-full flex items-center justify-center shrink-0"><Droplet className="text-warning" size={18} /></div>
                            <div className="stat-info flex flex-col">
                              <span className="label text-[10px] font-bold uppercase text-slate-400 tracking-wider">Blood Group</span>
                              <span className="val text-lg font-bold text-slate-800 mt-0.5">{activePatient.bloodGroup || 'A+'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Smart AI Diagnosis */}
                        <div className="card ai-diagnosis-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="ai-icon-bg w-9 h-9 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                                <Brain size={18} className="text-black" />
                              </div>
                              <div>
                                <h3 className="card-title text-sm font-bold text-slate-800 mb-0.5">MedFlow AI Clinical Assistant</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Smart Diagnostics Differential Logs</p>
                              </div>
                            </div>
                            <button onClick={runSmartDiagnosis} disabled={isAiLoading} className="btn btn-primary text-xs font-bold py-2 px-4 shadow-sm">
                              {isAiLoading ? 'Analyzing...' : 'Run Analysis'}
                            </button>
                          </div>
                          
                          <div className="ai-content">
                            {aiDiagnosis ? (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="diagnosis-result flex flex-col gap-4">
                                <p className="text-xs text-slate-500 font-semibold">Based on active patient profile, medical conditions list, and baseline markers:</p>
                                <div className="conditions-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {aiDiagnosis.conditions?.map((c, i) => (
                                    <div key={i} className="condition-card bg-slate-50 border border-slate-100 rounded-xl p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-xs text-slate-700">{c.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{c.probability}</span>
                                      </div>
                                      <div className="prob-bar bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className="prob-fill bg-black h-1.5 rounded-full" style={{ width: c.probability }}></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-6 mt-2 pt-4 border-t border-slate-100">
                                  <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Risk Assessment</span>
                                    <span className={`status-badge text-[10px] uppercase font-bold px-2.5 py-1 rounded ${aiDiagnosis.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                      {aiDiagnosis.riskLevel.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Suggested Clinical Panels</span>
                                    <span className="text-xs text-slate-700 font-bold">{aiDiagnosis.suggestedTests?.join(', ')}</span>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="empty-ai-state border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                <Brain size={28} className="text-slate-300 mb-2 opacity-50" />
                                <p className="text-xs text-slate-500 font-semibold max-w-sm leading-relaxed">
                                  Select patient conditions and invoke the MedFlow AI engine to review automated differential recommendations.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Scans / Reports */}
                      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <div className="card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="card-title text-sm font-bold text-slate-800">Recent Diagnostic Scans</h3>
                            <button className="text-xs font-bold text-brand hover:underline">View All</button>
                          </div>
                          
                          <div className="flex flex-col gap-4">
                            <div className="scan-img-box h-32 rounded-xl relative overflow-hidden border border-slate-100">
                              <img src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=250&fit=crop" alt="X-Ray" className="w-full h-full object-cover" />
                              <div className="scan-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                                <span className="text-xs font-bold">Chest X-Ray • Oct 12</span>
                              </div>
                            </div>
                            
                            <div className="scan-img-box empty border border-dashed border-slate-200 hover:border-slate-300 transition-colors h-32 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50 cursor-pointer">
                              <ImageIcon size={20} className="text-slate-400 mb-1.5" />
                              <span className="text-xs font-bold text-slate-500">Upload New Scan</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'appointments' && (
                    <motion.div 
                      key="appointments"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="appointments-list-view flex flex-col gap-4"
                    >
                      <h3 className="text-sm font-bold text-slate-800 mb-1">Scheduled Visits & Clinical Appointments</h3>
                      {activeAppointments.length === 0 ? (
                        <div className="empty-tab-state text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                          <Clock size={32} className="text-slate-300 mb-2 opacity-50" />
                          <p className="text-xs text-slate-500 font-semibold">No scheduled appointments found for this patient.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {activeAppointments.map(app => (
                            <div key={app._id} className="appointment-strip bg-white border border-slate-100 hover:border-slate-200 transition-colors p-4 rounded-xl flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="strip-date bg-slate-50 px-3 py-2 rounded-xl text-center shrink-0 border border-slate-100">
                                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                                    {new Date(app.date).toLocaleDateString(undefined, { month: 'short' })}
                                  </span>
                                  <span className="block text-base font-extrabold text-slate-800">
                                    {new Date(app.date).toLocaleDateString(undefined, { day: 'numeric' })}
                                  </span>
                                </div>
                                <div>
                                  <strong className="text-sm text-slate-800 block">{app.reason}</strong>
                                  <span className="text-xs text-slate-400 font-semibold">Assigned Specialist: Dr. {app.doctorId?.name || 'Staff'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-slate-500 font-semibold">
                                  {new Date(app.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`status-badge text-[9px] uppercase px-2.5 py-1 rounded font-bold ${
                                  app.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                                  app.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-rose-100 text-rose-700'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div 
                      key="history"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="clinical-history-timeline flex flex-col gap-4"
                    >
                      <h3 className="text-sm font-bold text-slate-800 mb-1">Prescription Records & Longitudinal Diagnostics</h3>
                      {activePrescriptions.length === 0 ? (
                        <div className="empty-tab-state text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                          <FileText size={32} className="text-slate-300 mb-2 opacity-50" />
                          <p className="text-xs text-slate-500 font-semibold">No prescription history found for this patient.</p>
                        </div>
                      ) : (
                        <div className="timeline-stack flex flex-col gap-6 relative pl-6 border-l-2 border-slate-100 mt-2">
                          {activePrescriptions.map((pr, index) => (
                            <div key={pr._id} className="timeline-item relative">
                              {/* Marker */}
                              <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-black border-2 border-white ring-4 ring-slate-50"></div>
                              
                              <div className="timeline-card bg-white p-5 border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-colors flex flex-col gap-3">
                                <div className="flex justify-between items-start mb-1 border-b border-slate-100 pb-2">
                                  <div>
                                    <h4 className="font-bold text-sm text-slate-800">
                                      {pr.notes?.replace('Diagnosis: ', '') || 'Clinical Prescription'}
                                    </h4>
                                    <span className="text-[10px] font-bold text-brand uppercase">Attending Doctor: Dr. {pr.doctorId?.name || 'Staff'}</span>
                                  </div>
                                  <span className="text-xs text-slate-400 font-semibold">
                                    {new Date(pr.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                  </span>
                                </div>
                                
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Prescribed Medicines</span>
                                  <div className="flex flex-wrap gap-2">
                                    {pr.medicines?.map((med, mIdx) => (
                                      <span key={mIdx} className="text-xs font-semibold bg-slate-50 border border-slate-200/40 px-2.5 py-1 rounded-lg text-slate-700">
                                        {med.name} • {med.dosage} ({med.frequency})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                
                                {pr.instructions && (
                                  <div className="flex flex-col gap-1 mt-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Lifestyle Instructions</span>
                                    <p className="text-xs text-slate-500 font-semibold leading-relaxed italic">"{pr.instructions}"</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted">Select a patient to view details</div>
          )}
        </AnimatePresence>
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
