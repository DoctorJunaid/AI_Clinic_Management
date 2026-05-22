import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Users, Activity, TrendingUp, BarChart3, Clock, ChevronRight
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeDoctors: 0,
    completedAppointments: 0,
    totalAppointments: 0,
    dynamicRevenue: 0,
    popularService: 'General Medicine'
  });
  const [trends, setTrends] = useState([]);
  const [departmentLoad, setDepartmentLoad] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, trendsRes, deptLoadRes] = await Promise.all([
        axios.get('/api/v1/analytics/stats'),
        axios.get('/api/v1/analytics/trends'),
        axios.get('/api/v1/analytics/department-load')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (trendsRes.data.success) setTrends(trendsRes.data.data);
      if (deptLoadRes.data.success) setDepartmentLoad(deptLoadRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load real-time clinic statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Process department load percentages dynamically relative to max department count
  const maxDeptCount = departmentLoad.length > 0 ? Math.max(...departmentLoad.map(d => d.count)) : 1;
  const processedDeptLoad = departmentLoad.map(d => ({
    department: d.department,
    count: d.count,
    percentage: maxDeptCount > 0 ? Math.round((d.count / maxDeptCount) * 100) : 0
  }));

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
            <span>Last 6 Months</span>
          </div>
          <button 
            onClick={fetchAnalyticsData}
            className="bg-black text-white hover:bg-slate-800 rounded-full px-6 py-2 text-xs font-semibold transition-colors"
          >
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Bento Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Patients */}
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
              <span>Live</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">active patient records</span>
          </div>
        </div>

        {/* Card 2: Active Doctors */}
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
              <span>On-duty</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">verified clinical providers</span>
          </div>
        </div>

        {/* Card 3: Dynamic Revenue */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/95 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0 pointer-events-none">
            <TrendingUp size={64} className="text-black" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">SaaS & Consultation Revenue</p>
            <h2 className="text-3xl font-semibold text-slate-900">PKR {stats.dynamicRevenue.toLocaleString()}</h2>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <div className="bg-secondary-container text-on-secondary-container rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5">
              <TrendingUp size={10} />
              <span>Realtime</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Pro subs + appointments</span>
          </div>
        </div>

        {/* Card 4: Top Service */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/95 transition-all shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity z-0 pointer-events-none">
            <BarChart3 size={64} className="text-black" />
          </div>
          <div className="relative z-10 pr-12">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Top Specialization</p>
            <h2 className="text-xl font-semibold text-slate-900 mt-1 leading-tight">{stats.popularService}</h2>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="text-[10px] font-bold text-slate-800">Highest Volume</span>
            <span className="text-[10px] font-bold text-slate-400">(by schedules)</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col h-full min-h-[400px] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Patient Inflow & Booking Trends</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
              Monthly Timeline
            </span>
          </div>
          <div className="flex-1 w-full h-[320px]">
            {trends.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted text-sm">
                No active scheduling history loaded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#add461" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#add461" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="patients" name="Patients Registered" stroke="#add461" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                  <Area type="monotone" dataKey="appointments" name="Appointments Booked" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAppts)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Side Panel Widgets */}
        <div className="flex flex-col gap-6 h-full">
          {/* Department Load Widget */}
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900">Department Clinical Load</h3>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {processedDeptLoad.length === 0 ? (
                <div className="text-slate-400 text-xs py-4 text-center">
                  No active clinic schedules recorded.
                </div>
              ) : (
                processedDeptLoad.slice(0, 5).map((d, index) => (
                  <div key={d.department || index}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">{d.department || 'General Medicine'}</span>
                      <span className="text-slate-800 font-bold">{d.count} appointments ({d.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div 
                        className="bg-black h-1.5 rounded-full" 
                        style={{ width: `${d.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
              <p className="text-xs text-slate-400 leading-relaxed">All core clinical microservices and MongoDB database indexes are healthy.</p>
            </div>
            <div className="mt-6 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Serverless Core</p>
                <p className="text-xs font-semibold text-white">MedFlow AI Production Engine</p>
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
