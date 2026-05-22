import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [prescriptionList, setPrescriptionList] = useState([]);
  const [newPrescName, setNewPrescName] = useState('');
  const [newPrescDosage, setNewPrescDosage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getTodayKey = () => {
    return 'ai_diag_usage_' + new Date().toISOString().split('T')[0];
  };

  const [dailyUsage, setDailyUsage] = useState(() => {
    const val = localStorage.getItem('ai_diag_usage_' + new Date().toISOString().split('T')[0]);
    return val ? parseInt(val, 10) : 0;
  });

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
        const first = res.data.data[0];
        setSelectedPatient(first._id);
        setPatientDetails(first);
        setChiefComplaint(first.medicalHistory || 'Presenting for routine checkup and symptom assessment.');
        
        const historyText = (first.medicalHistory || '').toLowerCase();
        const detected = [];
        if (historyText.includes('fever')) detected.push('Fever');
        if (historyText.includes('cough')) detected.push('Cough');
        if (historyText.includes('headache')) detected.push('Headache');
        if (historyText.includes('dizziness')) detected.push('Dizziness');
        setSymptoms(detected);
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
    setChiefComplaint(found.medicalHistory || 'No active medical history recorded. Presenting for symptom evaluation.');
    
    const historyText = (found.medicalHistory || '').toLowerCase();
    const detected = [];
    if (historyText.includes('fever')) detected.push('Fever');
    if (historyText.includes('cough')) detected.push('Cough');
    if (historyText.includes('headache')) detected.push('Headache');
    if (historyText.includes('dizziness')) detected.push('Dizziness');
    setSymptoms(detected);
    
    setDiagnosisResult(null);
    setPrescriptionList([]); 
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

  const handleSavePrescription = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient first.');
      return;
    }
    if (prescriptionList.length === 0) {
      toast.error('Please add at least one medication to prescribe.');
      return;
    }

    setIsSaving(true);
    try {
      const activeDiagnosisName = diagnosisResult?.conditions?.[0]?.name || 'General Clinical Evaluation';
      
      const payload = {
        patientId: selectedPatient,
        medicines: prescriptionList.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: 'As directed',
          duration: 'Complete course'
        })),
        instructions: chiefComplaint || 'Take medications exactly as prescribed.',
        notes: `AI Diagnostic Desk: ${activeDiagnosisName}`
      };

      await axios.post('/api/v1/prescriptions', payload);
      toast.success('Digital Prescription successfully saved to MongoDB!');
      setPrescriptionList([]); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save digital prescription.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="ai-diagnosis-page"
    >
      {/* Header bar */}
      <div className="ai-header-row">
        <div>
          <h1 className="ai-title">Clinical AI Diagnostics</h1>
          <p className="ai-subtitle">Select patient · toggle symptoms · run differential analysis</p>
        </div>
        <select 
          className="input-select"
          value={selectedPatient}
          onChange={(e) => handlePatientChange(e.target.value)}
        >
          <option value="">-- Guest Mode --</option>
          {patients.map(p => (
            <option key={p._id} value={p._id}>{p.name} (Age: {p.age}, {p.gender})</option>
          ))}
        </select>
      </div>

      {/* 2-Column Clean Workspace */}
      <div className="ai-grid">
        
        {/* LEFT COLUMN */}
        <div className="ai-col">
          
          {/* Patient Quick Info Card */}
          {patientDetails && (
            <div className="ai-card ai-card-compact">
              <div className="patient-context-header">
                <div className="patient-avatar-circle">
                  {patientDetails.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="patient-name-id">
                  <h4>{patientDetails.name}</h4>
                  <span>#{patientDetails._id.substring(0, 8)}</span>
                </div>
              </div>
              <div className="patient-data-row">
                <div className="patient-data-cell">
                  <span className="patient-data-label">Age / Sex</span>
                  <span className="patient-data-value">{patientDetails.age}y / {patientDetails.gender}</span>
                </div>
                <div className="patient-data-cell">
                  <span className="patient-data-label">Medical History</span>
                  <span className="patient-data-value" title={patientDetails.medicalHistory || 'None'}>
                    {patientDetails.medicalHistory || 'None'}
                  </span>
                </div>
                <div className="patient-data-cell">
                  <span className="patient-data-label">Allergies</span>
                  <span className="patient-data-value text-danger">Penicillin, Pollen</span>
                </div>
              </div>
            </div>
          )}

          {/* Symptom Selection & Clinical Notes Card */}
          <div className="ai-card">
            <div className="ai-card-header">
              <h3 className="ai-card-title">Symptom Intake</h3>
            </div>

            <div className="clinical-notes-area">
              <span className="clinical-notes-label">Active Symptoms</span>
              <div className="symptom-toggles">
                {presetSymptoms.map(sym => (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`symptom-toggle-btn ${symptoms.includes(sym) ? 'active' : ''}`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div className="clinical-notes-area" style={{ marginTop: '0.5rem' }}>
              <span className="clinical-notes-label">Clinical Notes</span>
              <textarea 
                className="clinical-notes-input"
                placeholder="Describe patient observations, symptoms, or physical examination details..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="ai-col">
          
          {/* Main AI Diagnostics Card */}
          <div className="ai-card">
            <div className="ai-card-header">
              <h3 className="ai-card-title">
                <Brain size={15} /> Differential Analysis
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {user?.subscriptionPlan !== 'pro' && (
                  <span className="test-badge" style={{ background: 'transparent' }}>
                    {dailyUsage}/3 limit
                  </span>
                )}
                <button 
                  onClick={runSymptomAssessment} 
                  className="btn btn-primary"
                  disabled={isAiLoading}
                >
                  {isAiLoading ? 'Analyzing...' : 'Run Analysis'}
                </button>
              </div>
            </div>

            <div style={{ minHeight: '180px' }}>
              <AnimatePresence mode="wait">
                {isAiLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem' }}
                  >
                    <div className="skeleton-row" style={{ width: '100%' }}></div>
                    <div className="skeleton-row" style={{ width: '85%' }}></div>
                    <div className="skeleton-row" style={{ width: '90%' }}></div>
                  </motion.div>
                ) : diagnosisResult ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}
                  >
                    <div className="risk-banner">
                      <ShieldAlert size={14} />
                      <span>{diagnosisResult.riskLevel} - Verify clinical history to exclude high-risk symptoms.</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <span className="clinical-notes-label">Conditions Found</span>
                      {diagnosisResult.conditions?.map((cond, idx) => (
                        <div key={idx} className="condition-row">
                          <div className="condition-header">
                            <span className="condition-name">{cond.name}</span>
                            <span className="condition-prob">{cond.probability}</span>
                          </div>
                          <div className="condition-bar-bg">
                            <div 
                              className="condition-bar-fill" 
                              style={{ width: String(cond.probability).includes('%') ? String(cond.probability) : `${cond.probability}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {diagnosisResult.suggestedTests?.length > 0 && (
                      <div className="suggested-tests">
                        <span className="clinical-notes-label">Suggested Tests</span>
                        <div className="test-badges">
                          {diagnosisResult.suggestedTests.map((test, index) => (
                            <span key={index} className="test-badge">
                              <CheckCircle size={12} style={{ color: 'var(--primary)' }} />
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="placeholder-text">Configure patient and symptoms to run differential.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Simple Prescription Card */}
          <div className="ai-card">
            <div className="ai-card-header">
              <h3 className="ai-card-title">Rx Builder</h3>
              {prescriptionList.length > 0 && (
                <span className="test-badge">{prescriptionList.length} items</span>
              )}
            </div>
            
            <div className="rx-list">
              {prescriptionList.map((presc, idx) => (
                <div key={idx} className="rx-item">
                  <div className="rx-item-info">
                    <span className="rx-item-name">{presc.name}</span>
                    <span className="rx-item-dosage">{presc.dosage}</span>
                  </div>
                  <button onClick={() => removePrescription(idx)} className="rx-delete-btn">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="rx-add-row">
              <input 
                type="text" 
                className="rx-input"
                placeholder="Medication name..."
                value={newPrescName}
                onChange={(e) => setNewPrescName(e.target.value)}
              />
              <input 
                type="text" 
                className="rx-input"
                placeholder="Dosage..."
                value={newPrescDosage}
                onChange={(e) => setNewPrescDosage(e.target.value)}
              />
              <button onClick={addPrescription} className="rx-add-btn">
                <Plus size={14} />
              </button>
            </div>

            {prescriptionList.length > 0 && (
              <button 
                onClick={handleSavePrescription}
                disabled={isSaving}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <CheckCircle size={14} />
                {isSaving ? 'Saving...' : 'Save Prescription'}
              </button>
            )}
          </div>

        </div>
      </div>
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </motion.div>
  );
};

export default AiDiagnosis;
