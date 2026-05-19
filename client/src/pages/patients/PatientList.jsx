import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Heart, Activity, Droplet, Plus, Brain, Image as ImageIcon, 
  ChevronRight, FileText, Clock, Thermometer, Wind, AlertTriangle, 
  Check, X, Sparkles, Shield, User, Filter, RefreshCw
} from 'lucide-react';
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

const PRESET_SYMPTOMS = [
  'Chest Pain', 'Shortness of Breath', 'Dry Cough', 'High Fever', 
  'Severe Headache', 'Fatigue', 'Nausea', 'Sore Throat', 
  'Dizziness', 'Joint Pain', 'Loss of Smell'
];

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, highRisk, today
  
  // Interactive Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Chest Pain', 'Fatigue']);
  const [customSymptom, setCustomSymptom] = useState('');

  // AI Assistant States
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview');
  const [allAppointments, setAllAppointments] = useState([]);
  const [allPrescriptions, setAllPrescriptions] = useState([]);

  // Lightbox view state for scans
  const [zoomScanUrl, setZoomScanUrl] = useState(null);

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    fetchPrescriptions();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/v1/patients');
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

  // Generate realistic, consistent bio-metrics based on patient parameters
  const getPatientVitals = (patient) => {
    if (!patient) return {};
    // Seed-like generation based on patient ID characters so it's consistent
    const charCodeSum = patient._id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    
    let hr = 60 + (charCodeSum % 25); // 60 - 85 bpm
    let bpSystolic = 110 + (charCodeSum % 20); // 110 - 130
    let bpDiastolic = 70 + (charCodeSum % 15); // 70 - 85
    let sugar = 80 + (charCodeSum % 40); // 80 - 120 mg/dL
    let spo2 = 96 + (charCodeSum % 4); // 96% - 99%
    let temp = (97.8 + ((charCodeSum % 12) / 10)).toFixed(1); // 97.8 - 99.0 °F
    let resp = 12 + (charCodeSum % 6); // 12 - 18

    // Modify a bit if they have allergies (simulating mild reaction or alert state)
    if (patient.allergies?.length > 0) {
      hr += 5;
      temp = (parseFloat(temp) + 0.3).toFixed(1);
    }

    return {
      heartRate: hr,
      bloodPressure: `${bpSystolic}/${bpDiastolic}`,
      bloodGlucose: sugar,
      spo2: spo2,
      temperature: temp,
      respiratoryRate: resp
    };
  };

  const handleToggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(item => item !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAddCustomSymptom = (e) => {
    e.preventDefault();
    if (!customSymptom.trim()) return;
    const cleanSym = customSymptom.trim();
    if (!selectedSymptoms.includes(cleanSym)) {
      setSelectedSymptoms([...selectedSymptoms, cleanSym]);
    }
    setCustomSymptom('');
  };

  const runSmartDiagnosis = async () => {
    if (!activePatient) return;
    if (selectedSymptoms.length === 0) {
      toast.error('Please select or add at least one symptom');
      return;
    }
    setIsAiLoading(true);
    setAiDiagnosis(null);
    try {
      const res = await axios.post('/api/v1/ai/symptom-check', {
        symptoms: selectedSymptoms,
        age: activePatient.age,
        gender: activePatient.gender,
        history: activePatient.medicalHistory || 'None'
      });
      setAiDiagnosis(res.data.data);
      toast.success('MedFlow Clinical Assessment Complete');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI Clinical Diagnosis failed');
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

  // Sidebar filtration
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.contact?.includes(searchQuery) ||
                          p._id.slice(-6).toUpperCase().includes(searchQuery.toUpperCase());
    
    if (activeFilter === 'highRisk') {
      return matchesSearch && p.allergies?.length > 0;
    }
    if (activeFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return matchesSearch && allAppointments.some(app => {
        const pId = app.patientId?._id || app.patientId;
        return pId === p._id && app.date.startsWith(todayStr);
      });
    }
    return matchesSearch;
  });

  const vitals = activePatient ? getPatientVitals(activePatient) : {};

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-full gap-4">
      <Clock size={36} className="text-slate-400 animate-spin" />
      <span className="text-xs font-semibold text-slate-500">Loading Clinical File...</span>
    </div>
  );

  return (
    <div className="patient-module h-full flex gap-6">
      
      {/* 1. Left Sidebar: Patient List Drawer */}
      <div className="patient-list-sidebar card border border-slate-100/80 shadow-xs flex flex-col shrink-0">
        <div className="list-header p-5 border-b border-slate-50 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">Patients List</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{filteredPatients.length} Active Records</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-black text-[#c8f17a] hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 border-none" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
            </button>
          </div>

          <div className="search-bar-small flex items-center gap-2.5 bg-slate-50/70 border border-slate-100 rounded-xl px-3.5 py-2.5 focus-within:border-black transition-all">
            <Search size={14} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, phone, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 items-center">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer border-none ${activeFilter === 'all' ? 'bg-black text-[#c8f17a]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter('highRisk')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer border-none ${activeFilter === 'highRisk' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              Risk Alert
            </button>
            <button 
              onClick={() => setActiveFilter('today')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer border-none ${activeFilter === 'today' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              Today
            </button>
          </div>
        </div>

        <div className="patients-scroll-list flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No patients matching filter</div>
          ) : (
            filteredPatients.map(p => (
              <div 
                key={p._id} 
                className={`patient-list-item flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${activePatient?._id === p._id ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white hover:bg-slate-50 border-slate-100/80 shadow-xs'}`}
                onClick={() => { setActivePatient(p); setAiDiagnosis(null); }}
              >
                <div className="relative shrink-0">
                  <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  {p.allergies?.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="p-info flex flex-col min-w-0 flex-1">
                  <h4 className={`font-bold text-[13px] truncate ${activePatient?._id === p._id ? 'text-white font-extrabold' : 'text-slate-800'}`}>{p.name}</h4>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className={`text-[10px] font-semibold capitalize ${activePatient?._id === p._id ? 'text-slate-300' : 'text-slate-400'}`}>{p.gender} • {p.age} yrs</span>
                    {p.bloodGroup && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${activePatient?._id === p._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {p.bloodGroup}
                      </span>
                    )}
                  </div>
                </div>
                {activePatient?._id === p._id && <ChevronRight size={14} className="text-[#c8f17a] shrink-0" />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Right Area: Detailed Longitudinal EHR Workspace */}
      <div className="patient-details-area flex-1 flex flex-col gap-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {activePatient ? (
            <motion.div 
              key={activePatient._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full gap-6 overflow-hidden"
            >
              {/* Profile Header Banner */}
              <div className="patient-hero-banner bg-white border border-slate-100/80 rounded-[24px] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="avatar-ring-large shrink-0 border-2 border-[#c8f17a]/60 rounded-full p-1 bg-white">
                    <img src={activePatient.avatar} alt={activePatient.name} className="w-14 h-14 rounded-full object-cover border border-slate-100" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-[18px] font-bold text-slate-800 tracking-tight leading-tight">{activePatient.name}</h2>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100/50 px-2 py-0.5 rounded uppercase tracking-wider">
                        ID: #PT-{activePatient._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-x-3.5 gap-y-1 text-xs text-slate-500 font-semibold flex-wrap">
                      <span><strong>Gender:</strong> <span className="capitalize">{activePatient.gender}</span></span>
                      <span className="text-slate-300">•</span>
                      <span><strong>Age:</strong> {activePatient.age} years</span>
                      <span className="text-slate-300">•</span>
                      <span><strong>Phone:</strong> {activePatient.contact || 'N/A'}</span>
                      {activePatient.email && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span><strong>Email:</strong> {activePatient.email}</span>
                        </>
                      )}
                    </div>
                    {/* Allergies and Risks warning strip */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Clinical Alerts:</span>
                      {activePatient.allergies?.length > 0 ? (
                        activePatient.allergies.map((alg, index) => (
                          <span key={index} className="bg-rose-50 text-rose-600 text-[10px] font-extrabold px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={10} /> {alg.toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                          <Check size={10} /> NO KNOWN ALLERGIES
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-end">
                  <button className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs" onClick={() => toast.success('Comprehensive clinical file generated!')}>
                    <FileText size={14} /> Download File
                  </button>
                  <button className="px-4 py-2.5 rounded-xl bg-black text-[#c8f17a] hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none" onClick={() => setIsModalOpen(true)}>
                    <Plus size={14} /> New Record
                  </button>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="patient-tabs-row border-b border-slate-100 flex gap-6">
                <button 
                  className={`tab pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 bg-transparent border-top-none border-left-none border-right-none cursor-pointer ${activeTab === 'overview' ? 'active text-black border-black font-extrabold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Clinical Summary
                </button>
                <button 
                  className={`tab pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 bg-transparent border-top-none border-left-none border-right-none cursor-pointer ${activeTab === 'appointments' ? 'active text-black border-black font-extrabold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Visits & Appointments ({activeAppointments.length})
                </button>
                <button 
                  className={`tab pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 bg-transparent border-top-none border-left-none border-right-none cursor-pointer ${activeTab === 'history' ? 'active text-black border-black font-extrabold' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                  onClick={() => setActiveTab('history')}
                >
                  EHR prescriptions ({activePrescriptions.length})
                </button>
              </div>

              {/* Workspace contents */}
              <div className="details-content flex-1 overflow-y-auto pr-1 flex flex-col gap-6">
                <AnimatePresence mode="wait">
                  
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="grid grid-cols-12 gap-6"
                    >
                      {/* Vitals & AI Panel */}
                      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                        
                        {/* 1. Clinical Vitals Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-white border border-slate-100 shadow-xs rounded-[20px] p-4 flex items-center gap-3.5 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center shrink-0">
                              <Heart className="text-rose-500" size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Heart Rate</span>
                              <span className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">
                                {vitals.heartRate} <span className="text-[10px] text-slate-400 font-semibold font-sans">bpm</span>
                              </span>
                            </div>
                          </div>

                          <div className="bg-white border border-slate-100 shadow-xs rounded-[20px] p-4 flex items-center gap-3.5 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shrink-0">
                              <Activity className="text-emerald-600" size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Blood Pressure</span>
                              <span className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">
                                {vitals.bloodPressure} <span className="text-[10px] text-slate-400 font-semibold font-sans">mmHg</span>
                              </span>
                            </div>
                          </div>

                          <div className="bg-white border border-slate-100 shadow-xs rounded-[20px] p-4 flex items-center gap-3.5 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center shrink-0">
                              <Droplet className="text-amber-500" size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Blood Glucose</span>
                              <span className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">
                                {vitals.bloodGlucose} <span className="text-[10px] text-slate-400 font-semibold font-sans">mg/dL</span>
                              </span>
                            </div>
                          </div>

                          <div className="bg-white border border-slate-100 shadow-xs rounded-[20px] p-4 flex items-center gap-3.5 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center shrink-0">
                              <Wind className="text-blue-500" size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">SpO2 (Oxygen)</span>
                              <span className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">
                                {vitals.spo2}% <span className="text-[10px] text-slate-400 font-semibold font-sans">Stable</span>
                              </span>
                            </div>
                          </div>

                          <div className="bg-white border border-slate-100 shadow-xs rounded-[20px] p-4 flex items-center gap-3.5 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-full flex items-center justify-center shrink-0">
                              <Thermometer className="text-orange-500" size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Temperature</span>
                              <span className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">
                                {vitals.temperature} <span className="text-[10px] text-slate-400 font-semibold font-sans">°F</span>
                              </span>
                            </div>
                          </div>

                          <div className="bg-white border border-slate-100 shadow-xs rounded-[20px] p-4 flex items-center gap-3.5 hover:border-slate-200 transition-colors">
                            <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-full flex items-center justify-center shrink-0">
                              <Activity className="text-purple-500" size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Respiration Rate</span>
                              <span className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">
                                {vitals.respiratoryRate} <span className="text-[10px] text-slate-400 font-semibold font-sans">/min</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Interactive AI Symptom Checker Differential Diagnosis */}
                        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-xs flex flex-col gap-5">
                          <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                                <Brain size={18} className="text-black" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-800">MedFlow AI Symptoms Assistant</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Clinical Outbreak & Differential Analysis</p>
                              </div>
                            </div>
                            <button 
                              onClick={runSmartDiagnosis} 
                              disabled={isAiLoading} 
                              className="px-4 py-2 rounded-xl bg-black text-[#c8f17a] hover:bg-slate-800 text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer border-none"
                            >
                              {isAiLoading ? 'Analyzing EHR...' : 'Run MedFlow Analysis'}
                            </button>
                          </div>

                          {/* Symptom Selection Area */}
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Patient Symptoms</span>
                              <span className="text-[10px] font-bold text-[#496800] uppercase">{selectedSymptoms.length} Selected</span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_SYMPTOMS.map((sym) => {
                                const isSelected = selectedSymptoms.includes(sym);
                                return (
                                  <button
                                    key={sym}
                                    onClick={() => handleToggleSymptom(sym)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 active:scale-95 ${isSelected ? 'bg-[#c8f17a]/20 border-[#c8f17a] text-slate-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-500'}`}
                                  >
                                    {isSelected && <Check size={12} className="text-emerald-700" />}
                                    {sym}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Add Custom Symptom */}
                            <form onSubmit={handleAddCustomSymptom} className="flex gap-2 items-center mt-1">
                              <div className="flex-1 bg-slate-50/70 border border-slate-100 rounded-xl px-3.5 py-2 flex items-center">
                                <input
                                  type="text"
                                  placeholder="Type in a custom symptom..."
                                  value={customSymptom}
                                  onChange={(e) => setCustomSymptom(e.target.value)}
                                  className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 outline-none"
                                />
                              </div>
                              <button type="submit" className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer">
                                Add
                              </button>
                            </form>
                          </div>

                          {/* AI Output Result Section */}
                          <div className="ai-diagnosis-result-area mt-2">
                            {aiDiagnosis ? (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 border-t border-slate-50 pt-4">
                                <div className="flex items-center gap-2">
                                  <Sparkles size={14} className="text-emerald-600 animate-pulse" />
                                  <span className="text-xs font-bold text-slate-700">Recommended Clinical Hypotheses:</span>
                                </div>
                                <div className="conditions-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {aiDiagnosis.conditions?.map((c, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-xs text-slate-700">{c.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 font-mono">{c.probability}</span>
                                      </div>
                                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-black h-1.5 rounded-full" style={{ width: c.probability }}></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-50">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Risk Stratification</span>
                                    <span className={`inline-flex items-center gap-1.5 self-start text-[10px] uppercase font-bold px-3 py-1 rounded-full ${aiDiagnosis.riskLevel === 'low' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'}`}>
                                      <Shield size={12} /> {aiDiagnosis.riskLevel} Risk
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suggested Diagnostic Lab Panels</span>
                                    <span className="text-xs text-slate-700 font-bold bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-relaxed">
                                      {aiDiagnosis.suggestedTests?.join(', ') || 'No immediate panels recommended'}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="empty-ai-state border border-dashed border-slate-200/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                <Brain size={32} className="text-slate-300 mb-2 opacity-50" />
                                <p className="text-xs text-slate-500 font-semibold max-w-sm leading-relaxed">
                                  Select patient symptoms above and execute the MedFlow engine to generate clinical recommendations.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Diagnostic Scans Sidebar Area */}
                      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white border border-slate-100 shadow-xs rounded-[24px] p-6 flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                            <h3 className="text-sm font-bold text-slate-800">Imaging & Radiological Scans</h3>
                            <button className="text-xs font-bold text-slate-700 hover:underline cursor-pointer border-none bg-transparent">All Files</button>
                          </div>
                          
                          <div className="flex flex-col gap-4">
                            <div 
                              className="scan-img-box h-32 rounded-xl relative overflow-hidden border border-slate-100 cursor-zoom-in"
                              onClick={() => setZoomScanUrl("https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=500&fit=crop")}
                            >
                              <img src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=250&fit=crop" alt="Chest X-Ray scan" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                              <div className="scan-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white flex items-center justify-between">
                                <span className="text-xs font-bold">Chest X-Ray Scan</span>
                                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded uppercase font-bold">View</span>
                              </div>
                            </div>
                            
                            <div className="scan-img-box empty border border-dashed border-slate-200 hover:border-slate-300 transition-colors h-32 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 cursor-pointer" onClick={() => toast.success('Scan dropzone active!')}>
                              <ImageIcon size={20} className="text-slate-400 mb-1.5" />
                              <span className="text-xs font-bold text-slate-500">Upload Radiology File</span>
                              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">DICOM, JPG, PNG supported</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VISITS & APPOINTMENTS TAB */}
                  {activeTab === 'appointments' && (
                    <motion.div 
                      key="appointments"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Visit Timeline</h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Scheduled slots and clinical history records</p>
                        </div>
                      </div>

                      {activeAppointments.length === 0 ? (
                        <div className="text-center p-16 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center">
                          <Clock size={32} className="text-slate-300 mb-2 opacity-50" />
                          <p className="text-xs text-slate-500 font-semibold">No scheduled visits found in clinical parameters.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {activeAppointments.map(app => (
                            <div key={app._id} className="bg-white border border-slate-100 hover:border-slate-200 transition-colors p-4 rounded-2xl flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-4">
                                <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-center shrink-0">
                                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                                    {new Date(app.date).toLocaleDateString(undefined, { month: 'short' })}
                                  </span>
                                  <span className="block text-base font-extrabold text-slate-800 font-mono">
                                    {new Date(app.date).toLocaleDateString(undefined, { day: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <strong className="text-sm text-slate-800 leading-tight">{app.notes || 'Routine Consultation'}</strong>
                                  <span className="text-xs text-slate-400 font-semibold mt-0.5">Attending Specialist: {app.doctorId?.name?.startsWith('Dr.') ? app.doctorId.name : `Dr. ${app.doctorId?.name || 'Staff Specialist'}`}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-slate-500 font-mono font-semibold">
                                  {new Date(app.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`text-[9px] uppercase px-3 py-1 rounded-full font-bold border ${
                                  app.status === 'scheduled' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                  app.status === 'confirmed' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                  app.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                  'bg-rose-50 border-rose-100 text-rose-600'
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

                  {/* EHR PRESCRIPTIONS TIMELINE TAB */}
                  {activeTab === 'history' && (
                    <motion.div 
                      key="history"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Longitudinal Prescription Timeline</h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Historical pharmacological and diagnostic files</p>
                        </div>
                      </div>

                      {activePrescriptions.length === 0 ? (
                        <div className="text-center p-16 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center">
                          <FileText size={32} className="text-slate-300 mb-2 opacity-50" />
                          <p className="text-xs text-slate-500 font-semibold">No active electronic health prescriptions registered.</p>
                        </div>
                      ) : (
                        <div className="timeline-stack flex flex-col gap-6 relative pl-6 border-l-2 border-slate-100/80 mt-2">
                          {activePrescriptions.map((pr, index) => (
                            <div key={pr._id} className="timeline-item relative">
                              <div className="absolute -left-[31px] top-2.5 w-2.5 h-2.5 rounded-full bg-black border-2 border-white ring-4 ring-slate-50"></div>
                              
                              <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-xs hover:border-slate-200 transition-colors flex flex-col gap-4">
                                <div className="flex justify-between items-start border-b border-slate-50 pb-2.5">
                                  <div className="flex flex-col">
                                    <h4 className="font-bold text-sm text-slate-800 leading-tight">
                                      {pr.notes?.replace('Diagnosis: ', '') || 'Clinical Prescription'}
                                    </h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Specialist: {pr.doctorId?.name?.startsWith('Dr.') ? pr.doctorId.name : `Dr. ${pr.doctorId?.name || 'Attending Physician'}`}</span>
                                  </div>
                                  <span className="text-xs text-slate-400 font-semibold">
                                    {new Date(pr.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                  </span>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Pharmacological Profile</span>
                                  <div className="flex flex-wrap gap-2">
                                    {pr.medicines?.map((med, mIdx) => (
                                      <span key={mIdx} className="text-xs font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-slate-700">
                                        💊 <strong>{med.name}</strong> • {med.dosage} ({med.frequency})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                
                                {pr.instructions && (
                                  <div className="flex flex-col gap-1.5 mt-1 bg-slate-50/70 border border-slate-100/50 p-3.5 rounded-xl">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lifestyle Protocols</span>
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
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-10">
              <User size={36} className="text-slate-300 opacity-60" />
              <span className="text-xs font-semibold">Select a patient card to load clinical timeline records</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox scanner popover */}
      {zoomScanUrl && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomScanUrl(null)}
        >
          <button className="absolute top-4 right-4 text-white w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border-none cursor-pointer">
            <X size={20} />
          </button>
          <img src={zoomScanUrl} alt="Radiology Scan Lightbox" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl border border-white/10" />
        </div>
      )}

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
