import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Calendar, FileText, Pill, Check, Activity, Download, Heart, 
  MessageSquare, DollarSign, Clock, RefreshCw, Eye, Brain
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './MyHealthHistory.css';

const MyHealthHistory = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const [appsRes, presRes] = await Promise.all([
        axios.get('/api/v1/appointments'),
        axios.get('/api/v1/prescriptions')
      ]);

      const fetchedApps = appsRes.data.data.slice(0, 3);
      const fetchedPres = presRes.data.data;
      
      setAppointments(fetchedApps);
      setPrescriptions(fetchedPres);
      if (fetchedPres.length > 0) {
        setSelectedPrescription(fetchedPres[0]);
      }
    } catch (error) {
      console.error("Error fetching patient history", error);
      toast.error("Failed to load health history data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (prescriptionId) => {
    if (!prescriptionId) return;
    try {
      toast.loading("Generating prescription PDF...");
      const response = await axios.get(`/api/v1/prescriptions/${prescriptionId}/pdf`, {
        responseType: 'blob'
      });
      toast.dismiss();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Prescription PDF downloaded successfully!");
    } catch (error) {
      toast.dismiss();
      console.error("Error downloading prescription PDF", error);
      toast.error("Failed to download prescription PDF");
    }
  };

  const handleExplainAI = async () => {
    if (!selectedPrescription) return;
    setExplaining(true);
    setAiExplanation('');
    try {
      const res = await axios.post('/api/v1/ai/explain-prescription', {
        medicines: selectedPrescription.medicines,
        instructions: selectedPrescription.instructions
      });
      setAiExplanation(res.data.data.explanation);
      toast.success("AI clinical insights generated!");
    } catch (error) {
      console.error("Error generating AI explanation", error);
      toast.error("Failed to generate AI prescription explanation");
    } finally {
      setExplaining(false);
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Patient';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 min-h-screen">
        <Clock className="text-slate-400 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 max-w-[1000px] mx-auto min-h-screen flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="font-headline-xl text-2xl font-bold text-slate-900">Clinical Records & Prescriptions</h1>
        <p className="text-slate-500 text-sm font-semibold">View and analyze your past prescriptions using AI insights.</p>
      </div>

      <div className="w-full flex flex-col gap-6">
        <div className="glass-panel rounded-2xl p-1 relative overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black to-[#c8f17a]"></div>
            
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <Brain className="text-black" size={16} />
                  <span className="font-bold text-xs">AI Prescription Summary</span>
                </div>
                <span className="text-[9px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">Updated Today</span>
              </div>

              {prescriptions.length > 0 && selectedPrescription ? (
                <>
                  {/* Select Prescription Dropdown if more than 1 */}
                  {prescriptions.length > 1 && (
                    <div className="mb-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Prescription File</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                        value={selectedPrescription?._id || ''}
                        onChange={(e) => {
                          const found = prescriptions.find(p => p._id === e.target.value);
                          setSelectedPrescription(found);
                          setAiExplanation('');
                        }}
                      >
                        {prescriptions.map((pr) => (
                          <option key={pr._id} value={pr._id}>
                            {pr.diagnoses?.join(', ') || 'Prescription'} - {new Date(pr.createdAt).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedPrescription.medicines?.map((med, idx) => (
                      <div key={idx} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                        <h3 className="font-headline-xl text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Pill className="text-slate-500" size={16} />
                          <span>{med.name} {med.dosage}</span>
                        </h3>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-1">
                          Frequency: {med.frequency} • Duration: {med.duration}
                        </p>
                      </div>
                    ))}
                    {selectedPrescription.instructions && (
                      <p className="text-slate-400 text-xs italic bg-slate-50 p-3 rounded-lg border border-slate-100 font-semibold leading-relaxed">
                        <strong>Doctor Notes:</strong> {selectedPrescription.instructions}
                      </p>
                    )}
                  </div>

                  {/* AI Explanation Drawer/Well */}
                  {explaining && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center justify-center gap-3">
                      <Brain className="animate-pulse text-[#496800]" size={16} />
                      <span className="text-xs font-semibold text-slate-600">AI Explaining Prescription...</span>
                    </div>
                  )}

                  {!explaining && aiExplanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#add461]/10 border border-[#add461]/30 rounded-xl p-4 mt-2 max-h-[220px] overflow-y-auto"
                    >
                      <h4 className="text-[10px] font-bold text-[#496800] mb-2 flex items-center gap-2 uppercase tracking-wider">
                        <Brain size={12} /> AI Clinical Insights
                      </h4>
                      <div className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {aiExplanation}
                      </div>
                    </motion.div>
                  )}

                  {!explaining && !aiExplanation && (
                    <button 
                      onClick={handleExplainAI}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 mt-2"
                    >
                      <Brain size={14} className="text-slate-600" />
                      <span>Explain with AI</span>
                    </button>
                  )}

                  <button 
                    onClick={() => handleDownloadPDF(selectedPrescription._id)}
                    className="w-full bg-black text-white hover:bg-slate-800 transition-colors py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-auto"
                  >
                    <Download size={14} />
                    <span>Download Full Prescription</span>
                  </button>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <FileText size={48} className="text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-700">No prescriptions found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">Your clinical records contain no prescription history.</p>
                </div>
              )}
            </div>
          </div>
      </div>
    </motion.div>
  );
};

export default MyHealthHistory;
