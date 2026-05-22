import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Activity, RefreshCw, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const patientId = user?._id || user?.id;
      const res = await axios.get('/api/v1/appointments', { params: { patientId } });
      let fetchedApps = res.data.data || res.data || [];
      
      if (patientId) {
        fetchedApps = fetchedApps.filter(app => {
          const appId = typeof app.patientId === 'object' ? app.patientId._id : app.patientId;
          return appId === patientId || app.patientId?.name === user?.name;
        });
      }

      setAppointments(fetchedApps.slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
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
      className="p-6 md:p-8 max-w-[1200px] mx-auto min-h-screen flex flex-col gap-6"
    >
      {/* Welcome Hero Section */}
      <section className="relative rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-200/60 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm">
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
              <Activity className="text-[#496800]" size={14} /> Vitals Stable
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/3 aspect-square max-w-[240px] rounded-[2rem] overflow-hidden relative border border-slate-200 shadow-sm">
          <img 
            alt="Wellness Banner" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYnnJ4rMhnER3dFNz3INGaEg4klciq1cYU7XwtqBSx60g4Z177m3-h4nwzBAy61QxIkue_DWSMQ3wOrVdwvCdTINgk7KHGPWOxXf8jVpF7Q_gju52RspO3w8IARSX6P9AYpYqJh3UxhAb44Hq7w2IuXt6OBfh_8I8exi5fZ83dxcdTSnn1oBzod2Rofx3cDdrMVhJ9wN-3oolBwvwUeWXsH_9K0Jn9_Z5LspktE3T2gCw52jtUSMKoElK6NtK1EzdPAg5mmT3vjOY"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md rounded-xl p-3 border border-slate-200/40 flex items-center justify-between shadow-sm">
            <span className="text-[10px] font-bold text-slate-700">Wellness Status</span>
            <div className="w-5 h-5 rounded-full bg-[#daee13] flex items-center justify-center text-black font-bold text-xs">
              ✓
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Appointments Preview */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-sm">Next Appointments</h3>
            <button onClick={() => navigate('/appointments')} className="text-[#496800] text-xs font-bold hover:underline">View All</button>
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
                      <h4 className="font-bold text-slate-800 text-sm">{apt.notes || 'General Consultation'}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${
                        apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'in progress' ? 'bg-[#c8f17a] text-slate-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs font-semibold mb-2">
                      {apt.doctor || 'Assigned Doctor'}
                    </p>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                      <Clock size={12} />
                      <span>{new Date(apt.date).toLocaleString(undefined, { dateStyle: 'medium' })} • {apt.timeSlot}</span>
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
                  <p className="text-slate-400 text-xs font-semibold">You have a clear schedule.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <button className="bg-white hover:bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-800 transition-all shadow-sm">
                <RefreshCw size={18} className="text-[#496800]" />
                <div className="text-left">
                  <span className="block">Request Refill</span>
                  <span className="text-xs text-slate-400 font-semibold mt-0.5">Renew your existing prescriptions</span>
                </div>
              </button>
              <button className="bg-white hover:bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-800 transition-all shadow-sm">
                <MessageSquare size={18} className="text-[#496800]" />
                <div className="text-left">
                  <span className="block">Message Doctor</span>
                  <span className="text-xs text-slate-400 font-semibold mt-0.5">Secure direct messaging</span>
                </div>
              </button>
              <button className="bg-white hover:bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-800 transition-all shadow-sm">
                <DollarSign size={18} className="text-[#496800]" />
                <div className="text-left">
                  <span className="block">Pay Bill</span>
                  <span className="text-xs text-slate-400 font-semibold mt-0.5">View and pay outstanding balances</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="bg-[#496800] rounded-2xl p-6 text-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#3d5700] transition-colors" onClick={() => navigate('/my-history')}>
            <div>
              <h3 className="font-bold text-sm mb-1">Clinical Records</h3>
              <p className="text-[#c8f17a] text-xs">View your AI analyzed prescriptions</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default PatientDashboard;
