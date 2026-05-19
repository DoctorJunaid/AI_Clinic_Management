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
        medicines: selectedPrescription.medications,
        instructions: selectedPrescription.notes
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
      className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col gap-6"
    >
      {/* Welcome Hero Section */}
      <section className="relative rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-200/60 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        {/* Decorative Background Element */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#c8f17a]/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex-1 relative z-10 space-y-4">
          <h2 className="font-headline-xl text-3xl md:text-4xl font-bold text-slate-900 max-w-xl">
            Good morning, {firstName}. Your health is optimal today.
          </h2>
          <p className="text-slate-500 text-sm max-w-lg leading-relaxed font-body-md">
            All recent test results are within normal ranges. Keep up the good work maintaining your wellness routine.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 text-slate-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#c8f17a]"></span> Health Score: 92/100
            </span>
            <span className="bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 text-slate-700 shadow-sm">
              <Activity className="text-emerald-600" size={14} /> Vitals Stable
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/3 aspect-square max-w-[240px] rounded-[2rem] overflow-hidden relative border border-slate-200 shadow-sm">
          <img 
            alt="Wellness Banner Illustration" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYnnJ4rMhnER3dFNz3INGaEg4klciq1cYU7XwtqBSx60g4Z177m3-h4nwzBAy61QxIkue_DWSMQ3wOrVdwvCdTINgk7KHGPWOxXf8jVpF7Q_gju52RspO3w8IARSX6P9AYpYqJh3UxhAb44Hq7w2IuXt6OBfh_8I8exi5fZ83dxcdTSnn1oBzod2Rofx3cDdrMVhJ9wN-3oolBwvwUeWXsH_9K0Jn9_Z5LspktE3T2gCw52jtUSMKoElK6NtK1EzdPAg5mmT3vjOY"
          />
          {/* Floating tag */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md rounded-xl p-3 border border-slate-200/40 flex items-center justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-700">Wellness Status</span>
            <div className="w-5 h-5 rounded-full bg-[#daee13] flex items-center justify-center text-black font-bold text-xs">
              ✓
            </div>
          </div>
        </div>
      </section>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Appointments & Actions (Span 7) */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Appointment Timeline */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-sm">Upcoming Appointments</h3>
            </div>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.2rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
              {appointments.length > 0 ? (
                appointments.map((apt, index) => (
                  <div key={apt._id || index} className="relative flex gap-6 items-start group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-black text-white shadow shrink-0 z-10">
                      <Calendar size={16} />
                    </div>
                    <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-sm">{apt.reason || 'General Consultation'}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${
                          apt.status === 'scheduled' || apt.status === 'confirmed' ? 'bg-[#c8f17a] text-slate-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs font-semibold mb-2">
                        {apt.doctorId?.name || 'Dr. Sarah Ahmed'} • {apt.doctorId?.specialization || 'Clinical Doctor'}
                      </p>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                        <Clock size={12} />
                        <span>{new Date(apt.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative flex gap-6 items-start group opacity-70">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 z-10">
                    <Calendar size={16} />
                  </div>
                  <div className="bg-white border border-slate-200/40 p-4 rounded-xl shadow-sm flex-1">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">No Scheduled Appointments</h4>
                    <p className="text-slate-400 text-xs font-semibold">Please book a slot from the Appointments panel when required.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Chips */}
          <div className="flex flex-wrap gap-3">
            <button className="bg-white hover:bg-slate-50 border border-slate-200 px-5 py-3 rounded-full flex items-center gap-2 text-xs font-bold text-slate-800 transition-all shadow-sm">
              <RefreshCw size={14} className="text-emerald-600" />
              <span>Request Refill</span>
            </button>
            <button className="bg-white hover:bg-slate-50 border border-slate-200 px-5 py-3 rounded-full flex items-center gap-2 text-xs font-bold text-slate-800 transition-all shadow-sm">
              <MessageSquare size={14} className="text-emerald-600" />
              <span>Message Doctor</span>
            </button>
            <button className="bg-white hover:bg-slate-50 border border-slate-200 px-5 py-3 rounded-full flex items-center gap-2 text-xs font-bold text-slate-800 transition-all shadow-sm">
              <DollarSign size={14} className="text-emerald-600" />
              <span>Pay Bill</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Prescription Summary Highlight (Span 5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-1 relative overflow-hidden shadow-sm flex flex-col h-full">
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
                    {selectedPrescription.medications?.map((med, idx) => (
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
                    {selectedPrescription.notes && (
                      <p className="text-slate-400 text-xs italic bg-slate-50 p-3 rounded-lg border border-slate-100 font-semibold leading-relaxed">
                        <strong>Doctor Notes:</strong> {selectedPrescription.notes}
                      </p>
                    )}
                  </div>

                  {/* AI Explanation Drawer/Well */}
                  {explaining && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center justify-center gap-3">
                      <Brain className="animate-pulse text-emerald-600" size={16} />
                      <span className="text-xs font-semibold text-slate-600">AI Explaining Prescription...</span>
                    </div>
                  )}

                  {!explaining && aiExplanation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mt-2 max-h-[220px] overflow-y-auto"
                    >
                      <h4 className="text-[10px] font-bold text-emerald-800 mb-2 flex items-center gap-2 uppercase tracking-wider">
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

      </div>
    </motion.div>
  );
};

export default MyHealthHistory;
