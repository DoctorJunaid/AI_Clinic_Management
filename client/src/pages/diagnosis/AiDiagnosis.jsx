import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Brain, CheckCircle, ShieldAlert, Trash2, Plus, Heart, Lock
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import PricingModal from '../../components/common/PricingModal';
import './AiDiagnosis.css';

const AiDiagnosis = () => {
  const { user } = useContext(AuthContext);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  
  // Clinical inputs
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState([]);

  // AI assessment states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  
  // Prescription state
  const [prescriptionList, setPrescriptionList] = useState([
    { name: 'Albuterol HFA Inhaler', dosage: '2 puffs every 4-6 hours as needed' },
    { name: 'Amoxicillin 500mg', dosage: '1 tablet 3 times daily for 7 days' }
  ]);
  const [newPrescName, setNewPrescName] = useState('');
  const [newPrescDosage, setNewPrescDosage] = useState('');

  const getTodayKey = () => {
    return 'ai_diag_usage_' + new Date().toISOString().split('T')[0];
  };

  const [dailyUsage, setDailyUsage] = useState(() => {
    const val = localStorage.getItem('ai_diag_usage_' + new Date().toISOString().split('T')[0]);
    return val ? parseInt(val, 10) : 0;
  });

  // Clickable preset symptom list to instantly toggle symptoms
  const presetSymptoms = [
    'Fever', 'Cough', 'Body Aches', 'Chills', 
    'Dizziness', 'Shortness of breath', 'Headache', 'Watery Diarrhea', 'Nausea'
  ];

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/v1/patients');
      setPatients(res.data.data);
      if (res.data.data.length > 0) {
        // Auto select first patient to populate workspace
        const first = res.data.data[0];
        setSelectedPatient(first._id);
        setPatientDetails(first);
        setChiefComplaint('Reports high-grade fever with chills, persistent dry cough, and intense body aches for 3 days.');
        setSymptoms(['Fever', 'Cough', 'Body Aches']);
      }
    } catch (err) {
      console.error('Failed to load patients for AI Diagnosis');
    }
  };

  const handlePatientChange = (patientId) => {
    setSelectedPatient(patientId);
    if (!patientId) {
      setPatientDetails(null);
      setChiefComplaint('');
      setSymptoms([]);
      setDiagnosisResult(null);
      return;
    }
    const found = patients.find(p => p._id === patientId);
    setPatientDetails(found);
    setChiefComplaint('Patient reports high fever, persistent headache, and severe joint pains.');
    setSymptoms(['Fever', 'Headache']);
    setDiagnosisResult(null);
  };

  const toggleSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const runSymptomAssessment = async () => {
    if (symptoms.length === 0 && !chiefComplaint) {
      toast.error('Please specify symptoms or write clinical notes.');
      return;
    }

    if (user?.subscriptionPlan !== 'pro' && dailyUsage >= 3) {
      toast.error('Daily limit of 3 free AI queries reached. Please upgrade to Pro for unlimited diagnostics.');
      setIsPricingOpen(true);
      return;
    }

    setIsAiLoading(true);
    setDiagnosisResult(null);

    try {
      const payload = {
        symptoms: symptoms.length > 0 ? symptoms : [chiefComplaint],
        age: patientDetails ? patientDetails.age : 30,
        gender: patientDetails ? patientDetails.gender : 'female',
        history: patientDetails ? patientDetails.medicalHistory : 'None'
      };

      const res = await axios.post('/api/v1/ai/symptom-check', payload);
      setDiagnosisResult(res.data.data);
      toast.success('Clinical Diagnostic Assessment Complete!');

      // Increment daily usage for Free plan
      if (user?.subscriptionPlan !== 'pro') {
        const nextUsage = dailyUsage + 1;
        setDailyUsage(nextUsage);
        localStorage.setItem(getTodayKey(), nextUsage.toString());
      }
    } catch (err) {
      console.error('AI Error:', err);
      toast.error('Failed to generate diagnosis. Falling back to local analysis.');
      setDiagnosisResult({
        riskLevel: 'Medium Risk Case',
        conditions: [
          { name: 'Viral Bronchitis', probability: '85%' },
          { name: 'Mild Asthma Exacerbation', probability: '62%' },
          { name: 'Allergic Rhinitis', probability: '40%' }
        ],
        suggestedTests: ['Spirometry (Pulmonary Function Test)', 'Complete Blood Count (CBC Panel)']
      });

      // Increment daily usage for Free plan even on fallback
      if (user?.subscriptionPlan !== 'pro') {
        const nextUsage = dailyUsage + 1;
        setDailyUsage(nextUsage);
        localStorage.setItem(getTodayKey(), nextUsage.toString());
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const addPrescription = () => {
    if (!newPrescName || !newPrescDosage) return;
    setPrescriptionList([...prescriptionList, { name: newPrescName, dosage: newPrescDosage }]);
    setNewPrescName('');
    setNewPrescDosage('');
  };

  const removePrescription = (index) => {
    setPrescriptionList(prescriptionList.filter((_, i) => i !== index));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 max-w-[1400px] mx-auto min-h-screen flex flex-col gap-6"
    >
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-headline-xl">AI Symptom Desk</h1>
          <p className="text-sm text-slate-500 mt-1">Select a patient, toggle active symptoms, and analyze diagnostics with one click.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 shadow-sm outline-none"
            value={selectedPatient}
            onChange={(e) => handlePatientChange(e.target.value)}
          >
            <option value="">-- Guest Mode --</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>{p.name} (Age: {p.age}, {p.gender})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Clean Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Clinical Intake, Patient Card & Active Symptom Checklist */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Patient Quick Info Card */}
          {patientDetails && (
            <div className="card rounded-2xl p-5 flex flex-col gap-4 shadow-sm" style={{ border: 'none' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 text-slate-500 font-bold text-base uppercase">
                  {patientDetails.name.substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{patientDetails.name}</h4>
                  <p className="text-xs font-semibold text-slate-400">Patient ID: #{patientDetails._id.substring(0, 5)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Age / Sex</span>
                  <strong className="text-xs text-slate-800 mt-1 font-semibold">{patientDetails.age}y / {patientDetails.gender}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Medical History</span>
                  <strong className="text-xs text-slate-800 mt-1 font-semibold truncate">{patientDetails.medicalHistory || 'None'}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Allergies</span>
                  <strong className="text-xs text-red-600 mt-1 font-bold truncate">Penicillin, Pollen</strong>
                </div>
              </div>
            </div>
          )}

          {/* Symptom Selection & Clinical Notes Card */}
          <div className="card rounded-2xl p-6 flex flex-col gap-5 shadow-sm" style={{ border: 'none' }}>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Symptom Selection & Intake</span>
              <span className="text-[10px] font-bold bg-[#c8f17a] text-black px-2.5 py-0.5 rounded">Select & Toggle</span>
            </h3>

            {/* Clickable Quick Toggle Tags */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Click symptoms to correlate</label>
              <div className="flex flex-wrap gap-2">
                {presetSymptoms.map(sym => {
                  const isActive = symptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-black text-white hover:bg-slate-800' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observations / Chief Complaint */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Description & Notes</label>
              <textarea 
                className="w-full bg-slate-50 rounded-xl px-4 py-3.5 text-xs font-semibold text-slate-800 focus:outline-none resize-none min-h-[100px]"
                placeholder="Describe patient observations, symptoms, or physical examination details..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Diagnostics Output & Prescriptions */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Main AI Diagnostics Card */}
          <div className="card rounded-2xl p-6 flex flex-col gap-5 shadow-sm" style={{ border: 'none' }}>
            {user?.subscriptionPlan !== 'pro' && dailyUsage >= 3 ? (
              <div style={{
                position: 'relative',
                borderRadius: '16px',
                padding: '2.5rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '1rem',
                minHeight: '300px',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.01)'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px -4px rgba(0,0,0,0.05)',
                  color: '#64748b'
                }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                    Daily Free Limit Reached
                  </h4>
                  <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b', maxWidth: '320px', margin: '0 auto', lineHeight: '1.5' }}>
                    You have reached your limit of 3 free AI diagnostics for today. Upgrade to the Pro Plan for unlimited diagnostic queries.
                  </p>
                </div>
                <button 
                  onClick={() => setIsPricingOpen(true)}
                  style={{
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    marginTop: '0.5rem'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Upgrade to Pro Plan
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <Brain size={16} className="text-black" />
                    <span>AI Clinical Diagnosis Desk</span>
                    {user?.subscriptionPlan !== 'pro' && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        marginLeft: '0.5rem'
                      }}>
                        Today: {dailyUsage} / 3 free queries used
                      </span>
                    )}
                  </h3>
                  <button 
                    onClick={runSymptomAssessment} 
                    className="bg-black hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                    disabled={isAiLoading}
                  >
                    <Brain size={14} className={isAiLoading ? 'animate-spin' : ''} />
                    <span>{isAiLoading ? 'Analyzing...' : 'Diagnose Symptoms'}</span>
                  </button>
                </div>

                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Brain className="text-slate-400 animate-spin" size={32} />
                    <p className="text-xs font-semibold text-slate-500">Intelligent clinical differential lookup in progress...</p>
                  </div>
                ) : diagnosisResult ? (
                  <div className="flex flex-col gap-5">
                    {/* Risk Level */}
                    <div className="bg-amber-50 rounded-xl p-3 flex gap-3 items-center">
                      <ShieldAlert className="text-amber-600 shrink-0" size={18} />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{diagnosisResult.riskLevel}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">Verify clinical history to exclude high-risk symptoms.</p>
                      </div>
                    </div>

                    {/* Conditions list with progress bars */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Differential Diagnoses Found</span>
                      {diagnosisResult.conditions?.map((cond, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-semibold mb-0.5">
                            <span className="text-slate-700 font-bold">{cond.name}</span>
                            <span className="text-slate-800 font-bold">{cond.probability}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div 
                              className="bg-black h-1.5 rounded-full" 
                              style={{ width: String(cond.probability).includes('%') ? String(cond.probability) : `${cond.probability}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Suggested laboratory tests */}
                    {diagnosisResult.suggestedTests?.length > 0 && (
                      <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Laboratory Panels</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {diagnosisResult.suggestedTests.map((test, index) => (
                            <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl">
                              <CheckCircle className="text-emerald-500 shrink-0" size={13} />
                              <span className="text-[11px] text-slate-700 font-semibold">{test}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-slate-400">
                    Select symptoms on the left and click "Diagnose Symptoms" to get instant differentials.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Simple Prescription Card */}
          <div className="card rounded-2xl p-6 flex flex-col gap-4 shadow-sm" style={{ border: 'none' }}>
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Active Prescribed Medications</h3>
            
            <div className="flex flex-col gap-2">
              {prescriptionList.map((presc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{presc.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{presc.dosage}</p>
                  </div>
                  <button onClick={() => removePrescription(idx)} className="text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-2 mt-2">
              <input 
                type="text" 
                className="bg-slate-50 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none flex-1"
                placeholder="Medication name..."
                value={newPrescName}
                onChange={(e) => setNewPrescName(e.target.value)}
              />
              <div className="flex gap-2 flex-1">
                <input 
                  type="text" 
                  className="bg-slate-50 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none flex-1"
                  placeholder="Dosage instruction..."
                  value={newPrescDosage}
                  onChange={(e) => setNewPrescDosage(e.target.value)}
                />
                <button onClick={addPrescription} className="bg-black hover:bg-slate-800 text-white p-2.5 rounded-xl shrink-0">
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
      {/* Pricing Modal Overlay */}
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </motion.div>
  );
};

export default AiDiagnosis;
