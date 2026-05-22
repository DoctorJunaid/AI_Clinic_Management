import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell
} from 'recharts';
import {
  Users, Calendar as CalendarIcon, Activity, TrendingUp,
  MoreHorizontal, ArrowUpRight, Clock, Lock
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import PricingModal from '../../components/common/PricingModal';
import PatientDashboard from './PatientDashboard';
import './Dashboard.css';

// Shared animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.06 } },
};

const StatCard = ({ title, value, change, icon: Icon, isIncrease, delay }) => (
  <motion.div 
    className="card stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: 'easeOut' }}
  >
    <div className="stat-header">
      <div className="stat-icon-wrapper">
        <Icon className="stat-icon" size={20} strokeWidth={2.5} />
      </div>
      <button className="more-btn" aria-label="More options"><MoreHorizontal size={18} /></button>
    </div>
    <div className="stat-body">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
    <div className="stat-footer">
      <span className="badge badge-success">
        <ArrowUpRight size={12} />
        Live
      </span>
      <span className="stat-period">Realtime statistics</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'patient') return <PatientDashboard />;

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeDoctors: 0,
    completedAppointments: 0,
    totalAppointments: 0,
    dynamicRevenue: 0,
    popularService: 'General Consultation'
  });
  const [trends, setTrends] = useState([]);
  const [outbreaks, setOutbreaks] = useState([]);
  const [todayApts, setTodayApts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [forecastViews, setForecastViews] = useState(() => {
    const key = 'ai_forecasting_views_' + new Date().toISOString().split('T')[0];
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) : 0;
  });

  useEffect(() => {
    if (user?.subscriptionPlan !== 'pro') {
      const key = 'ai_forecasting_views_' + new Date().toISOString().split('T')[0];
      const curr = localStorage.getItem(key);
      const next = curr ? parseInt(curr, 10) + 1 : 1;
      localStorage.setItem(key, next.toString());
      setForecastViews(next);
    }
  }, [user?.subscriptionPlan]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const [statsRes, trendsRes, outbreaksRes, aptsRes] = await Promise.all([
          axios.get('/api/v1/analytics/stats'),
          axios.get('/api/v1/analytics/trends'),
          axios.get('/api/v1/analytics/outbreaks'),
          axios.get(`/api/v1/appointments?date=${todayStr}`)
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (trendsRes.data.success) setTrends(trendsRes.data.data);
        if (outbreaksRes.data.success) setOutbreaks(outbreaksRes.data.data);
        if (aptsRes.data.success) setTodayApts(aptsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch real dashboard analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isPastLimit = user?.subscriptionPlan !== 'pro' && forecastViews > 3;

  const barColors = ['#496800', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="dashboard">

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6 dashboard-stats">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} delay={0} />
        <StatCard title="Appointments Scheduled" value={stats.totalAppointments} icon={CalendarIcon} delay={0.1} />
        <StatCard title="Completed consultations" value={stats.completedAppointments} icon={Activity} delay={0.2} />
        <StatCard title="Clinic Revenue" value={`PKR ${stats.dynamicRevenue.toLocaleString()}`} icon={TrendingUp} delay={0.3} />
      </div>

      {/* Charts Row */}
      <motion.div
        className="grid grid-cols-3 gap-6 dashboard-main"
        variants={stagger}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1 }}
      >
        {/* Patient Flow Chart */}
        <motion.div 
          className="card col-span-2 chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
        >
          <div className="card-header">
            <div>
              <h2 className="card-title">Patient Flow Overview</h2>
              <p className="text-muted text-xs mt-2">Historical scheduling trends for the last 6 months</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
              Popular Speciality: {stats.popularService}
            </span>
          </div>
          <div className="chart-container" style={{ height: '320px', marginTop: '1rem' }}>
            {trends.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted text-sm">
                No historical patient data found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#496800" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#496800" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', background: 'var(--surface)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                    labelStyle={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="appointments" name="Appointments Booked" stroke="#496800" strokeWidth={3} fillOpacity={1} fill="url(#colorAppt)" activeDot={{r: 6, strokeWidth: 0}} />
                  <Area type="monotone" dataKey="patients" name="Patients Registered" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorNew)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          className="card"
          variants={fadeUp}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="card-header">
            <h2 className="card-title">Today's Appointments</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
              {todayApts.length} Today
            </span>
          </div>
          <div className="appointment-list">
            {todayApts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 h-full gap-2">
                <CalendarIcon size={32} className="text-slate-300" />
                <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  No consultations booked for today.
                </p>
              </div>
            ) : (
              todayApts.slice(0, 5).map((apt, i) => (
                <motion.div
                  key={apt._id}
                  className="appointment-item"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img src={apt.patientId?.avatar || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces'} alt={apt.patientId?.name} className="apt-avatar" />
                  <div className="apt-details">
                    <h4>{apt.patientId?.name || 'Walk-in Patient'}</h4>
                    <p>Dr. {apt.doctorId?.name} • {apt.doctorId?.specialization}</p>
                  </div>
                  <div className="apt-meta">
                    <div className="apt-time">
                      <Clock size={10} />
                      {apt.timeSlot.split(' - ')[0]}
                    </div>
                    <span className={`apt-status status-${apt.status}`}>
                      {apt.status}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Outbreaks forecasting section */}
      <div className="grid grid-cols-1 mt-4">
        <motion.div
          className="card chart-card p-6 rounded-2xl flex flex-col gap-4 shadow-sm"
          style={{ border: 'none', position: 'relative', overflow: 'hidden' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: 'easeOut' }}
        >
          <div className="card-header flex justify-between items-center border-b border-slate-100 pb-3 mb-2">
            <div>
              <h2 className="card-title flex items-center gap-2 flex-wrap">
                <Activity size={16} className="text-black" />
                <span>AI Clinical Outbreak & Conditions Prevalence</span>
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
                    Today: {forecastViews > 3 ? 3 : forecastViews} / 3 free views used
                  </span>
                )}
              </h2>
              <p className="text-muted text-xs mt-1">Real-time aggregate conditions grouped from active clinical diagnostic logs</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
              Punjab / Sindh District Trends
            </span>
          </div>

          {isPastLimit ? (
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              padding: '4rem 2rem',
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.96) 0%, rgba(241, 245, 249, 0.96) 100%)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '1rem',
              minHeight: '260px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0, left: 0,
                opacity: 0.08,
                background: 'repeating-linear-gradient(45deg, #000 0px, #000 10px, transparent 10px, transparent 20px)',
                filter: 'blur(4px)',
                pointerEvents: 'none'
              }} />

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
                color: '#64748b',
                zIndex: 2
              }}>
                <Lock size={20} />
              </div>
              <div style={{ zIndex: 2 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                  Daily Free Limit Reached
                </h4>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b', maxWidth: '380px', margin: '0 auto', lineHeight: '1.5' }}>
                  You have reached your limit of 3 free dashboard forecast views for today. Upgrade to the Pro Plan for unlimited outbreak forecasting.
                </p>
              </div>
              <button
                onClick={() => setIsPricingOpen(true)}
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 2,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Upgrade to Pro Plan
              </button>
            </div>
          ) : (
            <div className="chart-container" style={{ height: '280px', marginTop: '0.5rem' }}>
              {outbreaks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted text-sm">
                  <Activity size={24} className="text-slate-300" />
                  No outbreak conditions detected in diagnosis records.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={outbreaks}
                    margin={{ top: 10, right: 30, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="condition" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11}} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                      labelStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
                    />
                    <Bar dataKey="count" name="Case Count" radius={[6, 6, 0, 0]}>
                      {outbreaks.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  );
};

export default Dashboard;
