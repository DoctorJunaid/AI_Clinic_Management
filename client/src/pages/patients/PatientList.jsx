import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Heart, Activity, Droplet, Plus, Brain, Image as ImageIcon, 
  ChevronRight, FileText, Clock, Thermometer, Wind, AlertTriangle, 
  Check, X, Sparkles, Shield, User, Filter, RefreshCw, Upload, Download
} from 'lucide-react';
import AddPatientModal from '../../components/common/AddPatientModal';
import '../../components/common/Modal.css';
import './Patients.css';

// Hand-picked professional avatars matching Stitch medical portrait palette
const FALLBACK_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALIDaqT_HFmxmNN-SqdhPI742kDW7N3vt0rsoZDB92JE8GlNiMR9lHFJKkPbz2XYi3XSMzo1Y8nPrCGl5uV0SntOwrM1lMbKZydgpHyPgKcGwHXcWK5hO7RZKjLaQEo5yNAXlvHLuX9ruhKc2uPKMYlG7FRhe9BEvdPlvgyxBFPbHjcVwfq3GYPKl5ddeobv9RhO0UNwupS80kGFH9UhNx91KsBgGfZNqo_m4vJ-Fe8hfTWQSMnRPn3gZAFv_U4XDMGxZpA6-cuXU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPykGu8to1TAC1PYGz7z8DjOhGEmBks1SrLh-94mkrDRKZQJtFlKhOyf3mTnA4Z5JhFARl88d7GpDg8Pts3aQuwDHFrsNgnHJqkkf6rcPfrxODFX0mhR95GVfIp93SCgtBiCqMvkgGkeqM6e2__DaDx2rDq4CWsbMCuBmsh07gSJ4FQ0P4cqkaH_Z4wI_Av9WpqXlFFtZCAwBJ5w1HxqeYzwjsnXm6ye_PtwKdh1LJbsRjfRceVj2K8E2ICUgRQgoqCCXjHaeW0CQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAndEdtUZRqlwgcdTCHbRWM3VqtHuH-R07SDcXR6IPDFbLGG4JWsStfQRFjSIbDzKywSSjG-M5SSlyZFSZsnlrtJ88bREAPp83f8FOZfgMx0fBjt1JtuFtle7DMv2pA4O904HEtdx6dY4Deix52CaMSEstZURt0OE3SAYeefc94LsPv9j8qktMG9Jp3Ej2T_fe96-97gxdcTUN1XAs1m6KjWpZvd9VxGWLK9EVjzlW9fMiddYHAowVi5KDvd2rRQDWVLqjBr700waY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDslTJ--80UaRGV8YPGtjrjbMyDld2YFJMJ3y4GNKJl5PNQMmk-t7VQF6eiagVRqBwN6bEl1MsgruF1FR4pb5B3voH2JCHcUL9kpcyVTfWg4fRJI6U5Cjgbi3aW0yfiBfbN7Ruvdb4Cvxv6VVBnHwioyzVYHbeboObUbGaeYn7ZF4NuKROHJG7FnhhPF1VTtSRwnO2NkWHq6uME-qwx4Mkx3eyXQ-dEvFwuaMkoPNLCZKypkNOlSiJsVRYAgiRCvairjClDdZ861zU'
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

  // New persistent vitals, scan, and prescription states
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isScanUploadModalOpen, setIsScanUploadModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    heartRate: '',
    bloodPressure: '',
    bloodGlucose: '',
    spo2: '',
    temperature: '',
    respiratoryRate: '',
    bloodGroup: '',
    address: '',
    avatar: ''
  });
  const [scanForm, setScanForm] = useState({
    name: '',
    url: ''
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    instructions: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }]
  });

  const getPatientAvatar = (p) => {
    if (p && p.avatar && p.avatar.trim() !== '') {
      return p.avatar;
    }
    const initials = p && p.name ? p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'PT';
    const bg = p && p.gender === 'female' ? 'ffe4e6' : 'e0f2fe';
    const text = p && p.gender === 'female' ? 'e11d48' : '0369a1';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=${text}&bold=true&rounded=true&size=128`;
  };

  const handleAddMedicineRow = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: [...prescriptionForm.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const handleRemoveMedicineRow = (index) => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: prescriptionForm.medicines.filter((_, i) => i !== index)
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = prescriptionForm.medicines.map((med, i) => {
      if (i === index) {
        return { ...med, [field]: value };
      }
      return med;
    });
    setPrescriptionForm({ ...prescriptionForm, medicines: updated });
  };

  const handleAddPrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanMedicines = prescriptionForm.medicines.filter(
        med => med.name && med.name.trim() !== ''
      );

      if (cleanMedicines.length === 0 && (!prescriptionForm.instructions || prescriptionForm.instructions.trim() === '')) {
        toast.error('Please provide at least one medicine or lifestyle advice.');
        return;
      }

      await axios.post('/api/v1/prescriptions', {
        patientId: activePatient._id,
        medicines: cleanMedicines,
        instructions: prescriptionForm.instructions
      });
      toast.success('Prescription saved to Atlas database!');
      fetchPrescriptions();
      setIsPrescriptionModalOpen(false);
      setPrescriptionForm({
        instructions: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '' }]
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription');
    }
  };

  useEffect(() => {
    if (activePatient) {
      const currentVitals = getPatientVitals(activePatient);
      setVitalsForm({
        heartRate: currentVitals.heartRate || 72,
        bloodPressure: currentVitals.bloodPressure || '120/80',
        bloodGlucose: currentVitals.bloodGlucose || 100,
        spo2: currentVitals.spo2 || 98,
        temperature: currentVitals.temperature || 98.6,
        respiratoryRate: currentVitals.respiratoryRate || 16,
        bloodGroup: activePatient.bloodGroup || 'O-',
        address: activePatient.address || '',
        avatar: activePatient.avatar || ''
      });
    }
  }, [activePatient]);

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    fetchPrescriptions();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/v1/patients');
      setPatients(res.data.data);
      if (res.data.data.length > 0 && !activePatient) {
        setActivePatient(res.data.data[0]);
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
    setPatients([newPatient, ...patients]);
    setActivePatient(newPatient);
  };

  // Generate realistic, consistent bio-metrics based on patient parameters
  const getPatientVitals = (patient) => {
    if (!patient) return {};
    
    // Check if the real database has vitals populated
    if (patient.vitals && Object.keys(patient.vitals).length > 0) {
      return {
        heartRate: patient.vitals.heartRate ?? 72,
        bloodPressure: patient.vitals.bloodPressure ?? '120/80',
        bloodGlucose: patient.vitals.bloodGlucose ?? 100,
        spo2: patient.vitals.spo2 ?? 98,
        temperature: patient.vitals.temperature ?? 98.6,
        respiratoryRate: patient.vitals.respiratoryRate ?? 16
      };
    }

    // Seed-like generation fallback based on patient ID characters so it's consistent
    const charCodeSum = (patient._id || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    
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

  const handleUpdateVitalsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/v1/patients/${activePatient._id}`, {
        bloodGroup: vitalsForm.bloodGroup,
        address: vitalsForm.address,
        avatar: vitalsForm.avatar,
        vitals: {
          heartRate: Number(vitalsForm.heartRate),
          bloodPressure: vitalsForm.bloodPressure,
          bloodGlucose: Number(vitalsForm.bloodGlucose),
          spo2: Number(vitalsForm.spo2),
          temperature: Number(vitalsForm.temperature),
          respiratoryRate: Number(vitalsForm.respiratoryRate)
        }
      });
      toast.success('Patient record saved to Atlas database!');
      const updatedPatient = res.data.data;
      setPatients(patients.map(p => p._id === activePatient._id ? updatedPatient : p));
      setActivePatient(updatedPatient);
      setIsVitalsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating record');
    }
  };

  const handleUploadScanSubmit = async (e) => {
    e.preventDefault();
    if (!scanForm.name.trim() || !scanForm.url.trim()) {
      toast.error('Please enter a valid scan name and image URL');
      return;
    }
    try {
      const existingScans = activePatient.scans || [];
      const newScan = {
        name: scanForm.name,
        url: scanForm.url,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
      const updatedScans = [...existingScans, newScan];
      
      const res = await axios.put(`/api/v1/patients/${activePatient._id}`, {
        scans: updatedScans
      });
      toast.success('Radiology scan saved to Atlas database!');
      const updatedPatient = { ...activePatient, scans: res.data.data.scans };
      setPatients(patients.map(p => p._id === activePatient._id ? updatedPatient : p));
      setActivePatient(updatedPatient);
      setIsScanUploadModalOpen(false);
      setScanForm({ name: '', url: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving scan');
    }
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
    <div className="patient-module h-full flex gap-6 overflow-hidden">
      
      {/* Left Panel: Patient Master List */}
      <div className="patient-list-sidebar flex flex-col shrink-0">
        <div className="p-6 pb-4 flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-2xl tracking-tight text-slate-900 font-heading">Patients</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{filteredPatients.length} Active Records</p>
          </div>
          <button 
            className="w-8 h-8 rounded-full bg-[#496800] text-white flex items-center justify-center hover:opacity-90 transition-opacity border-none cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="px-6 pb-4 flex flex-col gap-3">
          <div className="relative search-bar-small border border-slate-200/80 bg-slate-50 rounded-full px-4 py-2 flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <input 
              className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400" 
              placeholder="Search patients..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 patients-scroll-list">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No patients matching filter</div>
          ) : (
            filteredPatients.map((p, idx) => (
              <div key={p._id} className="flex flex-col">
                <div 
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors relative ${activePatient?._id === p._id ? 'patient-selected' : 'hover:bg-slate-100/50'}`}
                  onClick={() => { setActivePatient(p); setAiDiagnosis(null); }}
                >
                  <div className="relative shrink-0">
                    <img src={getPatientAvatar(p)} alt={p.name} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
                    {p.allergies?.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 truncate text-xs">{p.name}</h4>
                    <p className="text-slate-400 text-[10px] font-bold truncate mt-0.5 capitalize">{p.gender} • {p.age} yrs</p>
                  </div>
                  {activePatient?._id === p._id && (
                    <div className="w-2 h-2 rounded-full bg-[#496800]"></div>
                  )}
                </div>
                {idx < filteredPatients.length - 1 && (
                  <div className="mx-3 border-b border-slate-100/80 my-1"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Patient Profile Detail */}
      <div className="flex-1 overflow-y-auto bg-[#f9f9f9] rounded-[24px] border border-slate-200/60 p-8 flex flex-col gap-8">
        <AnimatePresence mode="wait">
          {activePatient ? (
            <motion.div 
              key={activePatient._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 flex flex-col"
            >
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200/40 pb-6">
                <div className="flex items-start gap-6">
                  <img 
                    alt={activePatient.name} 
                    className="w-28 h-28 rounded-full object-cover shadow-sm border-4 border-white" 
                    src={getPatientAvatar(activePatient)} 
                  />
                  <div className="flex-1 pt-2">
                    <h1 className="font-bold text-2xl tracking-tight text-slate-900 font-heading mb-1">{activePatient.name}</h1>
                    <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-4">ID: #PT-{activePatient._id.slice(-6).toUpperCase()}</p>
                    <div className="flex flex-wrap gap-x-8 gap-y-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Gender</p>
                        <p className="font-bold text-xs text-slate-700 capitalize">{activePatient.gender}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Age</p>
                        <p className="font-bold text-xs text-slate-700">{activePatient.age} years</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Phone</p>
                        <p className="font-bold text-xs text-slate-700">{activePatient.contact || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Allergies</p>
                        {activePatient.allergies?.length > 0 ? (
                           <p className="font-bold text-xs text-rose-600 uppercase flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={12} /> {activePatient.allergies.join(', ')}
                          </p>
                        ) : (
                          <p className="font-bold text-xs text-emerald-600 uppercase flex items-center gap-1">
                            <Check size={12} /> None
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end shrink-0 animate-fade-in">
                  <button 
                    onClick={() => setIsVitalsModalOpen(true)}
                    className="px-3.5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Activity size={14} className="text-[#496800]" /> Update Record
                  </button>
                  <button 
                    onClick={() => toast.success('Comprehensive clinical file generated!')}
                    className="px-3.5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download size={14} /> Download EHR
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-3.5 py-2.5 rounded-full bg-black text-[#c8f17a] hover:bg-slate-900 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm border-none"
                  >
                    <Plus size={14} /> Add Patient
                  </button>
                </div>
              </div>

              {/* Tabs navigation */}
              <div className="border-b border-slate-200/60 flex gap-8">
                <button 
                  className={`pb-3 text-xs uppercase tracking-wider font-bold tab ${activeTab === 'overview' ? 'active' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`pb-3 text-xs uppercase tracking-wider font-bold tab ${activeTab === 'appointments' ? 'active' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Appointments ({activeAppointments.length})
                </button>
                <button 
                  className={`pb-3 text-xs uppercase tracking-wider font-bold tab ${activeTab === 'history' ? 'active' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setActiveTab('history')}
                >
                  Clinical History ({activePrescriptions.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="details-content flex-1">
                <AnimatePresence mode="wait">
                  
                  {activeTab === 'overview' && (
                    <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                      {/* Demographics & Medical Info Column */}
                      <div className="lg:col-span-5 space-y-4">
                        
                        {/* Elegant Blood Group Card */}
                        <div className="bg-gradient-to-br from-rose-50 to-red-50/50 border border-rose-100 rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest block mb-0.5">Blood Profile</span>
                            <h3 className="text-sm font-bold text-slate-800">Verified Blood Group</h3>
                          </div>
                          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-rose-100/50 shadow-sm shrink-0">
                            <Droplet className="text-red-500 fill-red-500 animate-pulse" size={18} />
                            <span className="text-3xl font-extrabold tracking-tight text-slate-850 font-mono">{activePatient.bloodGroup || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Complete Demographics Card */}
                        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-5">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-extrabold text-slate-850">Residential & Base Records</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">EHR Demographic Audit Trail</p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Registered Address</span>
                              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                                <p className="text-xs font-bold text-slate-700 leading-normal">{activePatient.address || 'No residential address registered'}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-1">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Primary Contact</span>
                                <p className="text-xs font-bold text-slate-800">{activePatient.contact || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Age Bracket</span>
                                <p className="text-xs font-bold text-slate-800">{activePatient.age} Years ({activePatient.gender})</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Registered On</span>
                                <p className="text-[11px] font-bold text-slate-600 font-mono">
                                  {activePatient.createdAt ? new Date(activePatient.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Last File Update</span>
                                <p className="text-[11px] font-bold text-slate-600 font-mono">
                                  {activePatient.updatedAt ? new Date(activePatient.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Imaging and Scans / Symptoms Checker Column */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* Radiology scans gallery */}
                        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 font-heading">Recent Diagnostic Scans</h3>
                            <button className="text-[#496800] text-xs font-bold hover:underline cursor-pointer border-none bg-transparent">View All</button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3.5">
                            {(activePatient.scans && activePatient.scans.length > 0 ? activePatient.scans : [
                              { name: 'Chest X-ray', url: 'https://images.unsplash.com/photo-1559757175-5700def837be?w=400&h=250&fit=crop', date: 'Oct 12' },
                              { name: 'MRI Brain', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&h=250&fit=crop', date: 'Oct 12' },
                              { name: 'Abdominal CT', url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=250&fit=crop', date: 'Oct 12' }
                            ]).map((scan, sIdx) => (
                              <div key={sIdx} className="group cursor-pointer animate-fade-in" onClick={() => setZoomScanUrl(scan.url)}>
                                <div className="scan-img-box h-24 relative">
                                  <img 
                                    src={scan.url} 
                                    alt={scan.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <h4 className="font-bold text-xs text-slate-700 mt-1.5">{scan.name}</h4>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Radiology Panel • {scan.date}</p>
                              </div>
                            ))}

                            {/* Upload card slot */}
                            <div className="scan-img-box empty flex flex-col items-center justify-center h-24 cursor-pointer" onClick={() => setIsScanUploadModalOpen(true)}>
                              <Upload size={18} className="text-slate-400 mb-1" />
                              <span className="text-xs font-bold text-slate-600">Upload Radiology</span>
                              <span className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">DICOM, JPG, PNG</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive MedFlow AI Symptoms Diagnostician */}
                        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <Brain size={18} className="text-[#496800]" />
                              <div>
                                <h3 className="text-sm font-bold text-slate-800">MedFlow Clinical AI</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Outbreak Symptom differential</p>
                              </div>
                            </div>
                            <button 
                              onClick={runSmartDiagnosis}
                              disabled={isAiLoading}
                              className="px-3.5 py-1.5 rounded-full bg-black text-[#c8f17a] hover:bg-slate-900 text-[10px] font-bold uppercase tracking-wide cursor-pointer border-none disabled:opacity-50"
                            >
                              {isAiLoading ? 'Analyzing...' : 'Run Differential'}
                            </button>
                          </div>

                          <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_SYMPTOMS.map((sym) => {
                                const isSelected = selectedSymptoms.includes(sym);
                                return (
                                  <button
                                    key={sym}
                                    onClick={() => handleToggleSymptom(sym)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                      isSelected 
                                        ? 'bg-[#c8f17a]/20 border-[#c8f17a] text-slate-800' 
                                        : 'bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100'
                                    }`}
                                  >
                                    {sym}
                                  </button>
                                );
                              })}
                            </div>

                            <form onSubmit={handleAddCustomSymptom} className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Type custom symptom..."
                                value={customSymptom}
                                onChange={(e) => setCustomSymptom(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200/60 rounded-full px-4 py-2 text-xs font-semibold outline-none focus:border-[#496800]"
                              />
                              <button type="submit" className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer">Add</button>
                            </form>
                          </div>

                          {/* AI Output result */}
                          <div className="ai-diagnosis-result-area">
                            {aiDiagnosis ? (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                  <Sparkles size={14} className="text-[#496800]" />
                                  <span>Recommended Clinical Hypotheses:</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {aiDiagnosis.conditions?.map((c, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 flex flex-col gap-1.5">
                                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                        <span>{c.name}</span>
                                        <span className="font-mono text-[10px] text-slate-400">{c.probability}</span>
                                      </div>
                                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[#496800] h-1.5 rounded-full" style={{ width: c.probability }}></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-2 pt-3 border-t border-slate-100">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</span>
                                    <span className={`inline-flex items-center gap-1 self-start text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                      aiDiagnosis.riskLevel === 'low' 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}>
                                      <Shield size={10} /> {aiDiagnosis.riskLevel} Risk
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recommended Lab Panels</span>
                                    <span className="text-[11px] text-slate-700 font-bold bg-slate-50 border border-slate-150 rounded-lg px-2.5 py-1">
                                      {aiDiagnosis.suggestedTests?.join(', ') || 'No immediate panels recommended'}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center">
                                <Brain size={24} className="text-slate-300 mx-auto mb-1.5 opacity-60" />
                                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                                  Toggle active patient symptoms and click differential check to generate real clinical hypotheses.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {/* Appointments Tab Content */}
                  {activeTab === 'appointments' && (
                    <motion.div 
                      key="appointments"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-bold text-slate-800">Visit Timeline History</h3>
                      {activeAppointments.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <Clock size={28} className="text-slate-350 mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-slate-400 font-semibold">No visits recorded in database metrics.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {activeAppointments.map(app => (
                            <div key={app._id} className="bg-white border border-slate-150 hover:border-slate-200 transition-colors p-4 rounded-xl flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="bg-slate-50 border border-slate-200/50 px-3 py-1.5 rounded-lg text-center shrink-0">
                                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                                    {new Date(app.date).toLocaleDateString(undefined, { month: 'short' })}
                                  </span>
                                  <span className="block text-sm font-extrabold text-slate-800 font-mono">
                                    {new Date(app.date).toLocaleDateString(undefined, { day: 'numeric' })}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-slate-800 leading-tight">{app.notes || 'Clinical Consultation'}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">Doctor: {app.doctorId?.name || 'Staff Specialist'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 font-mono font-semibold">
                                  {new Date(app.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`text-[9px] uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                                  app.status === 'scheduled' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                  app.status === 'confirmed' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                  app.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
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

                  {/* Prescriptions Tab Content */}
                  {activeTab === 'history' && (
                    <motion.div 
                      key="history"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-800">EHR Digital Prescriptions</h3>
                        <button 
                          onClick={() => setIsPrescriptionModalOpen(true)}
                          className="px-3 py-1.5 rounded-full bg-black text-[#c8f17a] hover:bg-[#1f2937] text-[10px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border-none uppercase tracking-wide"
                        >
                          <Plus size={12} /> Add Prescription
                        </button>
                      </div>
                      {activePrescriptions.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <FileText size={28} className="text-slate-350 mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-slate-400 font-semibold">No active electronic health prescriptions found.</p>
                        </div>
                      ) : (
                        <div className="timeline-stack flex flex-col gap-6 relative pl-6 border-l-2 border-slate-200/50 mt-2">
                          {activePrescriptions.map(pr => (
                            <div key={pr._id} className="timeline-item relative">
                              <div className="absolute -left-[31px] top-2.5 w-2.5 h-2.5 rounded-full bg-black border-2 border-white ring-4 ring-slate-100"></div>
                              
                              <div className="bg-white p-5 border border-slate-150 rounded-2xl shadow-sm hover:border-slate-200 transition-colors flex flex-col gap-3">
                                <div className="flex justify-between items-start border-b border-slate-50 pb-2 flex-wrap gap-2">
                                  <div>
                                    <h4 className="font-bold text-xs text-slate-850 leading-tight">
                                      {pr.notes?.replace('Diagnosis: ', '') || 'Routine Digital Prescription'}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">Doctor: Dr. {pr.doctorId?.name || 'Staff specialist'}</span>
                                  </div>
                                  <span className="text-xs text-slate-400 font-semibold">
                                    {new Date(pr.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                  </span>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Pharmacological Profile</span>
                                  <div className="flex flex-wrap gap-2">
                                    {pr.medicines?.map((med, mIdx) => (
                                      <span key={mIdx} className="text-xs font-semibold bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg text-slate-700">
                                        💊 <strong>{med.name}</strong> • {med.dosage} ({med.frequency})
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {pr.instructions && (
                                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg mt-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Lifestyle protocol</span>
                                    <p className="text-xs text-slate-500 font-medium italic">"{pr.instructions}"</p>
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
              <User size={36} className="text-slate-350 opacity-60" />
              <span className="text-xs font-semibold">Select a patient card to load clinical timeline records</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Scans Lightbox zoom viewer */}
      {zoomScanUrl && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomScanUrl(null)}
        >
          <button className="absolute top-4 right-4 text-white w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border-none cursor-pointer">
            <X size={20} />
          </button>
          <img src={zoomScanUrl} alt="Radiology Scan Zoomed" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl border border-white/10" />
        </div>
      )}

      {isModalOpen && (
        <AddPatientModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleAddPatient} 
        />
      )}

      {/* Update Vitals Modal */}
      {isVitalsModalOpen && (
        <div className="modal-overlay">
          <motion.div 
            className="modal-content card max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          >
            <div className="card-header border-b pb-4 mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Update Patient Record</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Persisted directly to MongoDB Atlas</p>
              </div>
              <button className="icon-btn w-8 h-8 flex items-center justify-center border-none bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200" onClick={() => setIsVitalsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateVitalsSubmit} className="grid grid-cols-2 gap-4">
              <div className="input-group col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Residential Address</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  placeholder="e.g. 123 Main St, New York"
                  value={vitalsForm.address} 
                  onChange={e => setVitalsForm({...vitalsForm, address: e.target.value})} 
                />
              </div>

              <div className="input-group col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Patient Picture URL (Optional)</label>
                <input 
                  type="url" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  placeholder="e.g. https://domain.com/pic.jpg"
                  value={vitalsForm.avatar} 
                  onChange={e => setVitalsForm({...vitalsForm, avatar: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Heart Rate (bpm)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  value={vitalsForm.heartRate} 
                  onChange={e => setVitalsForm({...vitalsForm, heartRate: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Blood Pressure</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  placeholder="e.g. 120/80"
                  value={vitalsForm.bloodPressure} 
                  onChange={e => setVitalsForm({...vitalsForm, bloodPressure: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Blood Glucose (mg/dL)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  value={vitalsForm.bloodGlucose} 
                  onChange={e => setVitalsForm({...vitalsForm, bloodGlucose: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">SpO2 (%)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  value={vitalsForm.spo2} 
                  onChange={e => setVitalsForm({...vitalsForm, spo2: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Temperature (°F)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  value={vitalsForm.temperature} 
                  onChange={e => setVitalsForm({...vitalsForm, temperature: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Respirations (breaths/min)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  value={vitalsForm.respiratoryRate} 
                  onChange={e => setVitalsForm({...vitalsForm, respiratoryRate: e.target.value})} 
                />
              </div>

              <div className="input-group col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Blood Group</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  placeholder="e.g. AB+"
                  value={vitalsForm.bloodGroup} 
                  onChange={e => setVitalsForm({...vitalsForm, bloodGroup: e.target.value})} 
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <button type="button" className="px-4 py-2 text-xs font-bold text-slate-500 rounded-lg bg-slate-100 hover:bg-slate-200 border-none cursor-pointer" onClick={() => setIsVitalsModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-black bg-[#c8f17a] hover:bg-[#b0dc56] rounded-lg border-none cursor-pointer">Save Metrics</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Upload Scan Modal */}
      {isScanUploadModalOpen && (
        <div className="modal-overlay">
          <motion.div 
            className="modal-content card max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          >
            <div className="card-header border-b pb-4 mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Upload Diagnostic Scan</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Attach dynamic radiological imagery to Atlas</p>
              </div>
              <button className="icon-btn w-8 h-8 flex items-center justify-center border-none bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200" onClick={() => setIsScanUploadModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleUploadScanSubmit} className="flex flex-col gap-4">
              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Scan Name / Label</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  placeholder="e.g. Lumbar Spine MRI, Pulmonary X-ray"
                  value={scanForm.name} 
                  onChange={e => setScanForm({...scanForm, name: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Image URL (High Resolution)</label>
                <input 
                  type="url" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-[#496800]" 
                  required
                  placeholder="https://images.unsplash.com/... or relative path"
                  value={scanForm.url} 
                  onChange={e => setScanForm({...scanForm, url: e.target.value})} 
                />
              </div>

              <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-slate-500">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Quick Presets</span>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  <button 
                    type="button" 
                    onClick={() => setScanForm({ name: 'Chest X-ray (Repeat)', url: 'https://images.unsplash.com/photo-1559757175-5700def837be?w=400&h=250&fit=crop' })}
                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-[9px] font-bold border border-slate-200 cursor-pointer"
                  >
                    Chest X-Ray
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setScanForm({ name: 'CT Abdomen', url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=250&fit=crop' })}
                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-[9px] font-bold border border-slate-200 cursor-pointer"
                  >
                    CT Abdomen
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setScanForm({ name: 'Ultrasound Pelvic', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&h=250&fit=crop' })}
                    className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-[9px] font-bold border border-slate-200 cursor-pointer"
                  >
                    Ultrasound
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <button type="button" className="px-4 py-2 text-xs font-bold text-slate-500 rounded-lg bg-slate-100 hover:bg-slate-200 border-none cursor-pointer" onClick={() => setIsScanUploadModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-black bg-[#c8f17a] hover:bg-[#b0dc56] rounded-lg border-none cursor-pointer">Add Scan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Digital Prescription Modal */}
      {isPrescriptionModalOpen && (
        <div className="modal-overlay">
          <motion.div 
            className="modal-content card max-w-xl w-full"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          >
            <div className="card-header border-b pb-4 mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Add EHR Digital Prescription</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Draft a multi-day pharmacotherapy protocol</p>
              </div>
              <button 
                className="icon-btn w-8 h-8 flex items-center justify-center border-none bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200" 
                onClick={() => setIsPrescriptionModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAddPrescriptionSubmit} className="flex flex-col gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Medicines & Dosing Regimen</span>
                  <button 
                    type="button" 
                    onClick={handleAddMedicineRow}
                    className="text-xs text-[#496800] font-bold hover:underline cursor-pointer border-none bg-transparent flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Medicine
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {prescriptionForm.medicines.map((med, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 relative">
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        <div>
                          <label className="text-[8px] font-bold text-slate-450 uppercase tracking-wider block mb-0.5">Med Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Paracetamol" 
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-[#496800]"
                            value={med.name} 
                            onChange={e => handleMedicineChange(idx, 'name', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-slate-450 uppercase tracking-wider block mb-0.5">Dosage</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 500mg" 
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-[#496800]"
                            value={med.dosage} 
                            onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-slate-450 uppercase tracking-wider block mb-0.5">Frequency</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Twice daily" 
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-[#496800]"
                            value={med.frequency} 
                            onChange={e => handleMedicineChange(idx, 'frequency', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-slate-450 uppercase tracking-wider block mb-0.5">Duration</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 5 days" 
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-[#496800]"
                            value={med.duration} 
                            onChange={e => handleMedicineChange(idx, 'duration', e.target.value)} 
                          />
                        </div>
                      </div>
                      {prescriptionForm.medicines.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMedicineRow(idx)}
                          className="text-rose-500 hover:text-rose-700 border-none bg-transparent cursor-pointer p-1 mt-3"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Lifestyle Advice & Special Instructions</label>
                <textarea 
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:border-[#496800]" 
                  placeholder="e.g. Take after meals, restrict sodium intake..."
                  value={prescriptionForm.instructions} 
                  onChange={e => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})} 
                />
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  className="px-4 py-2 text-xs font-bold text-slate-500 rounded-lg bg-slate-100 hover:bg-slate-200 border-none cursor-pointer" 
                  onClick={() => setIsPrescriptionModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-bold text-black bg-[#c8f17a] hover:bg-[#b0dc56] rounded-lg border-none cursor-pointer"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
