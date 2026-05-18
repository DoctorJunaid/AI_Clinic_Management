import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Calendar, FileText, Pill, Check, Sparkles, Activity, Download, Heart, 
  MessageSquare, DollarSign, Clock, RefreshCw
} from 'lucide-react';
import './MyHealthHistory.css';

const MyHealthHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
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

      setAppointments(appsRes.data.data.slice(0, 3));
      setPrescriptions(presRes.data.data.slice(0, 2));
    } catch (error) {
      console.error("Error fetching patient history", error);
    } finally {
      setLoading(false);
    }
  };

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
            Good morning, Sarah. Your health is optimal today.
          </h2>
          <p className="text-slate-500 text-sm max-w-lg leading-relaxed font-body-md">
            All recent test results are within normal ranges. You have one upcoming appointment next week. Keep up the good work maintaining your wellness routine.
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
              
              {/* Timeline Item 1 */}
              <div className="relative flex gap-6 items-start group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-black text-white shadow shrink-0 z-10">
                  <Calendar size={16} />
                </div>
                <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">Annual Checkup</h4>
                    <span className="text-[9px] font-bold text-slate-600 bg-[#c8f17a] px-2 py-0.5 rounded">Upcoming</span>
                  </div>
                  <p className="text-slate-400 text-xs font-semibold mb-2">Dr. Emily Chen • General Practice</p>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                    <Clock size={12} />
                    <span>Oct 24, 2024 • 10:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative flex gap-6 items-start group opacity-70">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 z-10">
                  <Activity size={16} />
                </div>
                <div className="bg-white border border-slate-200/40 p-4 rounded-xl shadow-sm flex-1">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Blood Panel Results</h4>
                  <p className="text-slate-400 text-xs font-semibold mb-2">Quest Diagnostics</p>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                    <Check size={12} className="text-emerald-600" />
                    <span>Completed Sep 12, 2024</span>
                  </div>
                </div>
              </div>

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
                  <Sparkles className="text-[#c8f17a]" size={16} />
                  <span className="font-bold text-xs">AI Prescription Summary</span>
                </div>
                <span className="text-[9px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">Updated Today</span>
              </div>

              <div>
                <h3 className="font-headline-xl text-xl font-bold text-slate-900">Lisinopril 10mg</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-2">
                  Prescribed to help manage blood pressure. Take one tablet daily in the morning with water.
                </p>
              </div>

              {/* Lifestyle Synergy glassmorphic well */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 mt-2">
                <h4 className="text-[10px] font-bold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8f17a]"></span> Lifestyle Synergy
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-500">
                  <li className="flex items-start gap-2">
                    <Check className="text-emerald-600 shrink-0 mt-0.5" size={14} />
                    <span>Maintain low sodium diet as discussed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-emerald-600 shrink-0 mt-0.5" size={14} />
                    <span>Continue 30 mins of moderate daily walking.</span>
                  </li>
                </ul>
              </div>

              <button className="w-full bg-black text-white hover:bg-slate-800 transition-colors py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-auto">
                <Download size={14} />
                <span>Download Full Prescription</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default MyHealthHistory;
