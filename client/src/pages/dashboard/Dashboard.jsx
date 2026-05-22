import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Legend, Line
} from 'recharts';
import {
  Users, Calendar as CalendarIcon, Activity, TrendingUp,
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Clock, Brain, Lock
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import PricingModal from '../../components/common/PricingModal';
import PatientDashboard from './PatientDashboard';
import './Dashboard.css';

const weeklyData = [
  { name: 'Mon', appointments: 12, newPatients: 4 },
  { name: 'Tue', appointments: 19, newPatients: 7 },
  { name: 'Wed', appointments: 15, newPatients: 5 },
  { name: 'Thu', appointments: 22, newPatients: 8 },
  { name: 'Fri', appointments: 18, newPatients: 6 },
  { name: 'Sat', appointments: 10, newPatients: 3 },
  { name: 'Sun', appointments: 5,  newPatients: 1 },
];

const outbreakData = [
  { week: 'Wk 20', Influenza: 15, Dengue: 4,  Gastro: 25 },
  { week: 'Wk 21', Influenza: 28, Dengue: 8,  Gastro: 30 },
  { week: 'Wk 22', Influenza: 45, Dengue: 15, Gastro: 28 },
  { week: 'Wk 23', Influenza: 62, Dengue: 32, Gastro: 35 },
  { week: 'Wk 24', Influenza: 50, Dengue: 58, Gastro: 45 },
  { week: 'Wk 25', Influenza: 35, Dengue: 72, Gastro: 52 },
  { week: 'Wk 26', Influenza: 22, Dengue: 85, Gastro: 58 },
];

const appointments = [
  { id: 1, name: 'Aisha Bibi',     type: 'General Checkup', time: '10:00 AM', status: 'confirmed',   img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces' },
  { id: 2, name: 'Muhammad Ali',  type: 'Follow-up',        time: '11:30 AM', status: 'in-progress', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces' },
  { id: 3, name: 'Zainab Fatima', type: 'Vaccination',      time: '02:00 PM', status: 'pending',     img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces' },
  { id: 4, name: 'Bilal Khan',    type: 'Lab Results',      time: '04:15 PM', status: 'pending',     img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces' },
];

// Shared animation variants — fast, purposeful
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
      <span className={`badge ${isIncrease ? 'badge-success' : 'badge-danger'}`}>
        {isIncrease ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(change)}%
      </span>
      <span className="stat-period">vs last week</span>
    </div>
  </motion.div>
);

// Tooltip styling shared
const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-md)',
  background: 'var(--surface)',
  fontSize: '12px',
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'patient') return <PatientDashboard />;

  const [isPricingOpen, setIsPricingOpen] = useState(false);
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

  const isPastLimit = user?.subscriptionPlan !== 'pro' && forecastViews > 3;

  return (
    <div className="dashboard">

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6 dashboard-stats">
        <StatCard title="Total Patients" value="1,284" change={12.5} icon={Users} isIncrease={true} delay={0} />
        <StatCard title="Appointments" value="84" change={5.2} icon={CalendarIcon} isIncrease={true} delay={0.1} />
        <StatCard title="Treatments" value="64" change={-2.4} icon={Activity} isIncrease={false} delay={0.2} />
        <StatCard title="Revenue" value="PKR 85,000" change={8.4} icon={TrendingUp} isIncrease={true} delay={0.3} />
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
              <p className="text-muted text-xs mt-2">Activity for the current week</p>
            </div>
            <select className="select-sm">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="chart-container" style={{ height: '320px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', background: 'var(--surface)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  labelStyle={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#496800" strokeWidth={3} fillOpacity={1} fill="url(#colorAppt)" activeDot={{r: 6, strokeWidth: 0}} />
                <Area type="monotone" dataKey="newPatients" name="New Patients" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorNew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          className="card"
          variants={fadeUp}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="card-header">
            <h2 className="card-title">Today's Schedule</h2>
            <button className="btn btn-ghost text-xs" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
              View all
            </button>
          </div>
          <div className="appointment-list">
            {appointments.map((apt, i) => (
              <motion.div
                key={apt.id}
                className="appointment-item"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <img src={apt.img} alt={apt.name} className="apt-avatar" />
                <div className="apt-details">
                  <h4>{apt.name}</h4>
                  <p>{apt.type}</p>
                </div>
                <div className="apt-meta">
                  <div className="apt-time">
                    <Clock size={10} />
                    {apt.time}
                  </div>
                  <span className={`apt-status status-${apt.status}`}>
                    {apt.status.replace('-', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

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
                <TrendingUp size={16} className="text-black" />
                <span>AI Clinical Outbreak & Patient Load Forecasting</span>
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
              <p className="text-muted text-xs mt-1">Predictive seasonal analysis & patient inflow trajectory models</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
              Region: Punjab / Sindh District Forecasts
            </span>
          </div>

          {user?.subscriptionPlan !== 'pro' && forecastViews > 3 ? (
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
              {/* Blurred dummy chart preview background */}
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={outbreakData}
                  margin={{ top: 10, right: 30, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11}} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                    labelStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  <Line type="monotone" dataKey="Influenza" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Dengue" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Gastro" stroke="#496800" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  );
};

export default Dashboard;
