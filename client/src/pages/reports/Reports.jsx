import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Users, Activity, TrendingUp, BarChart3, ShieldAlert, Brain, Clock, ChevronRight
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic analytic calculations
  const [stats, setStats] = useState({
    totalPatients: 12480,
    activeDoctors: 42,
    monthlyRevenue: '$428K',
    topService: 'Gen. Checkups'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        axios.get('/api/v1/patients'),
        axios.get('/api/v1/appointments'),
        axios.get('/api/v1/prescriptions')
      ]);

      const patientsData = patientsRes.data.data;
      const appointmentsData = appointmentsRes.data.data;
      const prescriptionsData = prescriptionsRes.data.data;

      setPatients(patientsData);
      setAppointments(appointmentsData);
      setPrescriptions(prescriptionsData);

      // Compute statistics dynamically if seeded records are available
      const totalPatients = patientsData.length > 0 ? patientsData.length : 12480;
      
      setStats({
        totalPatients: totalPatients,
        activeDoctors: 42,
        monthlyRevenue: '$428K',
        topService: 'Gen. Checkups'
      });

    } catch (err) {
      toast.error('Failed to load clinic statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Trend Data for Charts matching real-world clinical reports and the Stitch mock
  const patientLoadTrend = [
    { name: 'Jan', Patients: 18, Appointments: 28 },
    { name: 'Feb', Patients: 24, Appointments: 35 },
    { name: 'Mar', Patients: 32, Appointments: 42 },
    { name: 'Apr', Patients: 40, Appointments: 58 },
    { name: 'May', Patients: patients.length || 45, Appointments: appointments.length || 65 },
    { name: 'Jun', Patients: Math.round((patients.length || 45) * 1.2), Appointments: Math.round((appointments.length || 65) * 1.3) },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-full flex flex-col gap-6"
    >
      {/* Background organic accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full -z-10 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, #c8f17a 0%, transparent 70%)' }}></div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-headline-xl">Analytics Overview</h1>
          <p className="text-sm text-slate-500 font-body-md mt-1">Monitor clinic performance, patient flow, and resource allocation in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <span>Last 30 Days</span>
          </div>
          <button className="bg-black text-white hover:bg-slate-800 rounded-full px-6 py-2 text-xs font-semibold transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Bento Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/95 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0 pointer-events-none">
            <Users size={64} className="text-black" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Patients</p>
            <h2 className="text-3xl font-semibold text-slate-900">{stats.totalPatients.toLocaleString()}</h2>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <div className="bg-secondary-container text-on-secondary-container rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
              <TrendingUp size={10} />
              <span>14%</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">vs last month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/95 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0 pointer-events-none">
            <Activity size={64} className="text-black" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Doctors</p>
            <h2 className="text-3xl font-semibold text-slate-900">{stats.activeDoctors}</h2>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <div className="bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
              <span>Stable</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">across 4 departments</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/95 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0 pointer-events-none">
            <TrendingUp size={64} className="text-black" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Revenue</p>
            <h2 className="text-3xl font-semibold text-slate-900">{stats.monthlyRevenue}</h2>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <div className="bg-secondary-container text-on-secondary-container rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
              <TrendingUp size={10} />
              <span>8.2%</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">vs last month</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/95 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0 pointer-events-none">
            <BarChart3 size={64} className="text-black" />
          </div>
          <div className="relative z-10 pr-12">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Top Service</p>
            <h2 className="text-2xl font-semibold text-slate-900 mt-1 leading-tight">{stats.topService}</h2>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="text-[10px] font-bold text-slate-800">3,204 visits</span>
            <span className="text-[10px] font-bold text-slate-400">(25% of total)</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col h-full min-h-[400px] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Patient Flow Trends</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">Daily</button>
              <button className="px-3 py-1 bg-black text-white rounded-full text-xs font-semibold">Monthly</button>
            </div>
          </div>
          <div className="flex-1 w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={patientLoadTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#add461" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#add461" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Patients" stroke="#add461" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" />
                <Area type="monotone" dataKey="Appointments" stroke="#000000" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel Widgets */}
        <div className="flex flex-col gap-6 h-full">
          {/* Department Load Widget */}
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900">Department Load</h3>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Pediatrics</span>
                  <span className="text-slate-800 font-bold">85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-black h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Cardiology</span>
                  <span className="text-slate-800 font-bold">62%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-secondary-fixed-dim h-1.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Neurology</span>
                  <span className="text-slate-800 font-bold">40%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
            <button className="mt-auto pt-4 text-xs font-bold text-black border-t border-slate-100 text-center w-full hover:underline">
              Manage Staff Roster
            </button>
          </div>

          {/* System Health / Enterprise Tier Widget */}
          <div className="bg-black text-white rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col justify-between shadow-md">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container rounded-full blur-2xl opacity-20 pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-[#c8f17a]" size={16} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Enterprise Tier</h3>
              <p className="text-xs text-slate-400 leading-relaxed">All systems operational. Enterprise cloud storage at 45% capacity.</p>
            </div>
            <div className="mt-6 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Next Billing</p>
                <p className="text-xs font-semibold text-white">Oct 15, 2024</p>
              </div>
              <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 border border-white/10 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>


    </motion.div>
  );
};

export default Reports;
