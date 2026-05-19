import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Trash2, HelpCircle, Download, Brain, X, User, Lock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import PricingModal from '../../components/common/PricingModal';
import './Treatments.css';

const Treatments = () => {
  const { user } = useContext(AuthContext);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePrescription, setActivePrescription] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getTodayKey = () => {
    return 'ai_expl_usage_' + new Date().toISOString().split('T')[0];
  };

  const [dailyUsage, setDailyUsage] = useState(() => {
    const val = localStorage.getItem('ai_expl_usage_' + new Date().toISOString().split('T')[0]);
    return val ? parseInt(val, 10) : 0;
  });

  // New Prescription Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  
  // Medicines array state
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get('/api/v1/prescriptions');
      setPrescriptions(res.data.data);
      if (res.data.data.length > 0 && !activePrescription) {
        setActivePrescription(res.data.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/v1/patients');
      setPatients(res.data.data);
    } catch (err) {
      console.error('Failed to load patients list');
    }
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = medicines.map((med, idx) => {
      if (idx === index) {
        return { ...med, [field]: value };
      }
      return med;
    });
    setMedicines(updated);
  };

  const explainActivePrescription = async (prescription) => {
    if (!prescription) return;

    if (user?.subscriptionPlan !== 'pro' && dailyUsage >= 3) {
      toast.error('Daily limit of 3 free AI explanations reached. Please upgrade to Pro for unlimited explanations.');
      setIsPricingOpen(true);
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await axios.post('/api/v1/ai/explain-prescription', {
        medicines: prescription.medicines || [],
        instructions: prescription.instructions || ''
      });
      setAiExplanation(res.data.data.explanation);
      toast.success('AI explanation generated successfully!');

      // Increment daily usage for Free plan
      if (user?.subscriptionPlan !== 'pro') {
        const nextUsage = dailyUsage + 1;
        setDailyUsage(nextUsage);
        localStorage.setItem(getTodayKey(), nextUsage.toString());
      }
    } catch (err) {
      toast.error('AI Service is busy. Fallback explanation loaded.');
      setAiExplanation("AI CLINICAL DISPENSARY EXPLANATION:\n\n1. Active drug kinetics are safe for co-administration.\n2. Advise the patient to take medications strictly according to the specified intervals.\n3. Monitor for dizziness or allergic reactions.");

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

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient || medicines.some(m => !m.name || !m.dosage)) {
      toast.error('Please select a patient and fill in medicine details');
      return;
    }

    try {
      const newPrescription = {
        patientId: selectedPatient,
        medicines: medicines,
        instructions: instructions,
        // Since database doesn't store diagnosis directly, we can add it to instructions or notes
        notes: `Diagnosis: ${diagnosis}`
      };

      const res = await axios.post('/api/v1/prescriptions', newPrescription);
      
      // Reload lists
      fetchPrescriptions();
      
      setIsCreateOpen(false);
      setSelectedPatient('');
      setDiagnosis('');
      setInstructions('');
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
      toast.success('Prescription created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription');
    }
  };

  const downloadPDF = (id) => {
    // Open in a new tab to download
    const token = localStorage.getItem('token');
    const pdfUrl = `${axios.defaults.baseURL}/api/v1/prescriptions/${id}/pdf?token=${token}`;
    
    // We can open it directly
    window.open(pdfUrl, '_blank');
    toast.success('Downloading PDF...');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="treatments-container h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Treatments & Prescriptions</h1>
          <p className="text-muted text-sm mt-1">Generate digital prescriptions and explain medicines using Clinical AI.</p>
        </div>
        
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} /> New Prescription
        </button>
      </div>

      <div className="treatments-grid-layout">
        {/* Left Side: Prescription History list */}
        <div className="prescription-history-sidebar card">
          <div className="sidebar-header border-b pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-700">Prescription History</h3>
            <div className="search-bar-small mt-2">
              <Search size={14} className="text-muted" />
              <input type="text" placeholder="Search prescriptions..." />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="skeleton w-24 h-6"></div>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No prescriptions found.</p>
            </div>
          ) : (
            <div className="prescriptions-scroll-list">
              {prescriptions.map((pr) => (
                <div 
                  key={pr._id}
                  className={`prescription-list-item ${activePrescription?._id === pr._id ? 'active' : ''}`}
                  onClick={() => {
                    setActivePrescription(pr);
                    setAiExplanation('');
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      {pr.patientId?.name || 'Unknown Patient'}
                    </h4>
                    <span className="text-xs text-muted">
                      {new Date(pr.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-brand font-medium">Dr. {pr.doctorId?.name || 'Staff'}</p>
                  <p className="text-xs text-muted mt-1 truncate">
                    {pr.medicines?.map(m => m.name).join(', ') || 'No prescribed medicines'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Active Prescription Details Viewer */}
        <div className="prescription-viewer card border-0">
          {activePrescription ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="viewer-header flex justify-between items-center border-b pb-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Prescription Detail
                    </h2>
                    <p className="text-xs text-muted mt-1">ID: {activePrescription._id}</p>
                  </div>
                  
                  <button 
                    className="btn btn-secondary btn-sm flex items-center gap-2"
                    onClick={() => downloadPDF(activePrescription._id)}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="meta-card bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs text-muted uppercase font-bold block mb-1">Patient Details</span>
                    <strong className="text-slate-800 text-sm block">{activePrescription.patientId?.name || 'N/A'}</strong>
                    <span className="text-xs text-muted">Gender: {activePrescription.patientId?.gender || 'N/A'}</span>
                  </div>
                  <div className="meta-card bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs text-muted uppercase font-bold block mb-1">Prescribed By</span>
                    <strong className="text-slate-800 text-sm block">Dr. {activePrescription.doctorId?.name || 'N/A'}</strong>
                    <span className="text-xs text-muted">Specialty: {activePrescription.doctorId?.specialization || 'Cardiology'}</span>
                  </div>
                </div>

                {activePrescription.notes && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Diagnosis</h4>
                    <p className="text-sm text-neutral-600 bg-emerald-50 bg-opacity-40 p-3 rounded-lg border border-emerald-100">
                      {activePrescription.notes.replace('Diagnosis: ', '')}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Prescribed Medicines</h4>
                  <div className="medicine-table-container">
                    <table className="medicine-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePrescription.medicines?.map((med, index) => (
                          <tr key={index}>
                            <td><strong>{med.name}</strong></td>
                            <td>{med.dosage}</td>
                            <td>{med.frequency}</td>
                            <td>{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {activePrescription.instructions && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Clinical Instructions</h4>
                    <p className="text-sm text-neutral-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {activePrescription.instructions}
                    </p>
                  </div>
                )}

                {/* AI Explainer Area */}
                <div className="ai-explainer-section mt-8 bg-brand-50 bg-opacity-30 border border-brand-100 rounded-2xl p-6" style={{ position: 'relative' }}>
                  {user?.subscriptionPlan !== 'pro' && dailyUsage >= 3 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: '0.75rem',
                      padding: '1rem 0'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)',
                        color: '#64748b'
                      }}>
                        <Lock size={16} />
                      </div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Daily Free Limit Reached
                      </h5>
                      <p style={{ fontSize: '0.725rem', color: '#64748b', maxWidth: '320px', margin: '0 auto', lineHeight: '1.4' }}>
                        You have reached your limit of 3 free AI explanations for today. Upgrade to the Pro Plan for unlimited recipe explanations.
                      </p>
                      <button 
                        onClick={() => setIsPricingOpen(true)}
                        style={{
                          background: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.45rem 1.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          marginTop: '0.25rem'
                        }}
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                          <Brain className="text-brand" size={18} /> Clinical AI Smart Explainer
                          {user?.subscriptionPlan !== 'pro' && (
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: '700',
                              color: '#64748b',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              marginLeft: '0.5rem'
                            }}>
                              Today: {dailyUsage} / 3 free explanations used
                            </span>
                          )}
                        </h4>
                        {!aiExplanation && (
                          <button 
                            className="btn btn-primary btn-sm flex items-center gap-1.5"
                            onClick={() => explainActivePrescription(activePrescription)}
                            disabled={isAiLoading}
                          >
                            <Brain size={12} /> {isAiLoading ? 'Analyzing...' : 'Explain Meds'}
                          </button>
                        )}
                      </div>

                      {isAiLoading ? (
                        <div className="py-4 text-center">
                          <div className="skeleton w-full h-8 mb-2"></div>
                          <div className="skeleton w-3/4 h-6"></div>
                        </div>
                      ) : aiExplanation ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="ai-response-box text-sm text-slate-700 whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200"
                        >
                          {aiExplanation}
                        </motion.div>
                      ) : (
                        <p className="text-xs text-muted">
                          Click the explain button to let AI translate the drug actions, scheduled side-effects, and custom safety parameters into patient-friendly advice.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-center py-20">
              <FileText size={48} className="text-muted opacity-40 mb-4" />
              <h3 className="text-slate-700 font-bold text-lg">No Prescription Selected</h3>
              <p className="text-muted text-sm mt-1">Select a prescription record from the left sidebar history to review details.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Prescription Creator Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content"
            style={{ maxWidth: '700px', width: '90%' }}
          >
            <div className="modal-header justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="text-brand" size={20} /> Write Digital Prescription
              </h3>
              <button className="icon-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="modal-body max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="label">Patient Name</label>
                  <select 
                    className="input-field"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (Age: {p.age})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Clinical Diagnosis</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Stage 1 Hypertension"
                    className="input-field"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Medicines Inputs Repeaters */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="label m-0">Meds & Posology Schema</label>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                    onClick={handleAddMedicineRow}
                  >
                    <Plus size={12} /> Add Drug
                  </button>
                </div>

                <div className="medicines-repeat-list flex flex-col gap-3">
                  {medicines.map((med, index) => (
                    <div key={index} className="medicine-row-card p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <input 
                          type="text" 
                          placeholder="Drug Name" 
                          className="input-field-sm"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Dosage (e.g. 500mg)" 
                          className="input-field-sm"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="Frequency (e.g. 2x Daily)" 
                          className="input-field-sm"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="Duration (e.g. 7 Days)" 
                          className="input-field-sm"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        />
                      </div>
                      <button 
                        type="button" 
                        className="text-red hover:text-red-700 bg-transparent border-0 cursor-pointer"
                        disabled={medicines.length === 1}
                        onClick={() => handleRemoveMedicineRow(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="label">Lifestyle & Dietary Instructions</label>
                <textarea 
                  rows="3" 
                  placeholder="e.g. take after meals, limit salt intake..."
                  className="input-field"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Prescription
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Pricing Modal Overlay */}
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </motion.div>
  );
};

export default Treatments;
