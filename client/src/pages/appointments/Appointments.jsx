import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Filter, Search, ChevronRight, ChevronLeft, Sparkles, X
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './Appointments.css';

const Appointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  
  // Book Appointment Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 09:30 AM');
  const [notes, setNotes] = useState('');

  // Selected date on mini calendar
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date(2023, 9, 12)); // default Oct 12, 2023 matching mockup

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
    '03:30 PM - 04:00 PM',
    '04:00 PM - 04:30 PM'
  ];

  useEffect(() => {
    fetchAppointments();
    if (user?.role !== 'patient') {
      fetchPatients();
    } else {
      setSelectedPatient(user._id || user.id || '');
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/v1/appointments');
      setAppointments(res.data.data);
    } catch (err) {
      toast.error('Failed to load appointments from server');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/v1/patients');
      setPatients(res.data.data);
    } catch (err) {
      console.error('Failed to load patient records');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/v1/appointments/${id}/status`, { status: newStatus });
      setAppointments(appointments.map(app => app._id === id ? { ...app, status: newStatus } : app));
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleBookAppointment = async (e) => {
    if (e) e.preventDefault();
    const patientId = user?.role === 'patient' ? (user._id || user.id) : selectedPatient;
    if (!patientId || !appointmentDate || !timeSlot) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      let doctorId = 'mock_doctor_id_56789';
      if (user?.role !== 'patient') {
        const docRes = await axios.get('/api/v1/auth/me');
        doctorId = docRes.data.data._id;
      }

      const newApp = {
        patientId: patientId,
        doctorId: doctorId,
        date: new Date(appointmentDate).toISOString(),
        timeSlot: timeSlot,
        notes: notes
      };

      await axios.post('/api/v1/appointments', newApp);
      fetchAppointments();
      
      setSelectedPatient('');
      setAppointmentDate('');
      setNotes('');
      setIsBookModalOpen(false);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book slot');
    }
  };

  // Pre-seeded timeline records matching the high-fidelity mock
  const seedAppointments = [
    {
      _id: 'seed-1',
      patientId: { name: 'Sarah Jenkins' },
      notes: 'Annual Checkup',
      timeSlot: '09:00 AM',
      date: new Date(2023, 9, 12).toISOString(),
      status: 'in progress',
      doctor: 'Dr. Aris Thorne',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      isSeed: true,
      timeRelative: 'Started 12m ago'
    },
    {
      _id: 'seed-2',
      patientId: { name: 'Marcus Rodriguez' },
      notes: 'Blood Test Results',
      timeSlot: '10:30 AM',
      date: new Date(2023, 9, 12).toISOString(),
      status: 'pending',
      doctor: 'Lab Room B',
      initials: 'MR',
      isSeed: true
    },
    {
      _id: 'seed-3',
      patientId: { name: 'David Chen' },
      notes: 'Consultation',
      timeSlot: '11:15 AM',
      date: new Date(2023, 9, 12).toISOString(),
      status: 'confirmed',
      doctor: 'Dr. Aris Thorne',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      isSeed: true
    }
  ];

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let [_, hrs, mins, period] = match;
    hrs = parseInt(hrs, 10);
    mins = parseInt(mins, 10);
    if (period.toUpperCase() === 'PM' && hrs !== 12) hrs += 12;
    if (period.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
    return hrs * 60 + mins;
  };

  // Re-map and merge backend appointments
  const getTimelineAppointments = () => {
    const processedBackend = appointments.map(app => {
      const firstSlotPart = app.timeSlot ? app.timeSlot.split('-')[0].trim() : '09:00 AM';
      return {
        _id: app._id,
        patientId: app.patientId || { name: 'Guest Patient' },
        notes: app.notes || 'Routine Consultation',
        timeSlot: firstSlotPart,
        date: app.date,
        status: app.status,
        doctor: 'Dr. Aris Thorne', // default fallback physician
        isSeed: false
      };
    });

    let combined = [...seedAppointments];

    processedBackend.forEach(backendItem => {
      const exists = combined.some(seed => 
        seed.patientId.name.toLowerCase() === backendItem.patientId.name.toLowerCase() &&
        seed.timeSlot === backendItem.timeSlot
      );
      if (!exists) {
        combined.push(backendItem);
      }
    });

    if (filterStatus !== 'all') {
      combined = combined.filter(app => {
        if (filterStatus === 'pending') return app.status === 'pending';
        if (filterStatus === 'completed') return app.status === 'completed';
        return app.status === filterStatus;
      });
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      combined = combined.filter(app => 
        app.patientId.name.toLowerCase().includes(query) ||
        app.notes.toLowerCase().includes(query) ||
        (app.doctor && app.doctor.toLowerCase().includes(query))
      );
    }

    return combined.sort((a, b) => parseTime(a.timeSlot) - parseTime(b.timeSlot));
  };

  const displayAppointments = getTimelineAppointments();

  const renderMiniCalendar = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const daysInMonth = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 1).getDay();
    
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingArray = Array.from({ length: firstDayIndex }, () => null);
    const allDays = [...paddingArray, ...daysArray];

    const handlePrevMonth = () => {
      setSelectedCalendarDate(new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() - 1, 1));
    };
    
    const handleNextMonth = () => {
      setSelectedCalendarDate(new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() + 1, 1));
    };

    const hasDot = (day) => {
      if (selectedCalendarDate.getMonth() === 9 && selectedCalendarDate.getFullYear() === 2023) {
        return [2, 6, 10, 12, 19, 26].includes(day);
      }
      return day % 5 === 0 || day % 7 === 2;
    };

    return (
      <div className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-xs flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[15px] font-bold text-slate-800 font-heading">
            {monthNames[selectedCalendarDate.getMonth()]} {selectedCalendarDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors duration-150 cursor-pointer">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <button onClick={handleNextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors duration-150 cursor-pointer">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-y-1.5 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <span key={d} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {allDays.map((day, idx) => {
            if (day === null) return <span key={`pad-${idx}`} className="py-2 text-slate-200" />;
            const isSelected = day === selectedCalendarDate.getDate() && selectedCalendarDate.getMonth() === 9 && selectedCalendarDate.getFullYear() === 2023;
            return (
              <div 
                key={`day-${day}`} 
                onClick={() => setSelectedCalendarDate(new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), day))}
                className="flex flex-col items-center justify-center relative py-1 cursor-pointer"
              >
                <span className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-150 ${isSelected ? 'bg-black text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {day}
                </span>
                {hasDot(day) && (
                  <span className={`absolute bottom-0 w-1 h-1 rounded-full ${isSelected ? 'bg-[#c8f17a]' : 'bg-slate-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="p-2 md:p-4 max-w-[1600px] mx-auto min-h-screen flex flex-col gap-4"
    >
      {/* Top Header Bar */}
      <div className="flex justify-between items-center mb-4 border-b border-slate-100/60 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-heading">Reception Desk</h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Register clinic walk-ins, schedule appointments, and coordinate daily physician timelines.</p>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 appointments-appointments-grid gap-5 items-start">
        
        {/* Booking Card & Calendar Column */}
        <div className="appointments-col-left flex flex-col gap-4">
          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="w-full bg-black text-white rounded-[24px] p-5 flex items-center justify-between hover:bg-slate-900 transition-colors duration-150 group overflow-hidden relative cursor-pointer shadow-sm border border-black/5"
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Calendar size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold tracking-[0.28em] text-slate-400">Book Appointment</p>
                <h2 className="text-[16px] font-bold tracking-tight text-white">Schedule a new visit</h2>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#c8f17a]/15 rounded-full blur-2xl"></div>
          </button>

          {renderMiniCalendar()}
        </div>

        {/* Today's Schedule Column */}
        <div className="appointments-col-right flex flex-col gap-4">
          
          <div className="bg-white rounded-[20px] border border-slate-100/80 shadow-xs p-5 flex flex-col gap-4">
            
            {/* Table Header / Filters */}
            <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-[16px] font-bold text-slate-900 font-heading">Today's Schedule</h2>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setFilterStatus('all')}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold capitalize transition-colors duration-150 cursor-pointer ${filterStatus === 'all' ? 'bg-black text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    All ({displayAppointments.length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('pending')}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold capitalize transition-colors duration-150 cursor-pointer ${filterStatus === 'pending' ? 'bg-black text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    Pending
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-50 rounded-full px-3.5 py-1.5 flex items-center gap-2 border border-slate-100 w-44 focus-within:border-slate-300 focus-within:bg-white transition-all duration-150">
                  <Search size={12} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search schedules..." 
                    className="bg-transparent border-none text-[11px] font-semibold text-slate-700 placeholder-slate-400 outline-none w-full p-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer">
                  <Filter size={13} />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Smart Insights Banner (mockup widget styled inside glass-panel) */}
            <div className="rounded-[16px] p-4 border-l-4 border-l-[#c8f17a] bg-gradient-to-r from-[#c8f17a]/5 to-slate-50/10 border border-slate-100 flex gap-4 items-start shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#c8f17a] flex items-center justify-center shrink-0 shadow-sm shadow-[#c8f17a]/20">
                <Sparkles size={14} className="text-black" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-bold text-slate-800 font-heading">Smart Insights</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Just Now</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Dr. Thorne is 15 mins behind. New estimate for <span className="text-black font-bold">David Chen</span> is 11:30 AM.{' '}
                  <button className="text-[#496800] font-bold hover:underline cursor-pointer">Notify Patient?</button>
                </p>
              </div>
            </div>

            {/* Appointments List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Clock className="text-slate-300 animate-spin" size={20} />
              </div>
            ) : displayAppointments.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <Calendar size={28} className="text-slate-200 mb-2" />
                <h3 className="text-xs font-bold text-slate-600">No scheduled appointments</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs leading-normal">No entries match filters.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {displayAppointments.map((app, idx) => {
                  const isAfterLunch = parseTime(app.timeSlot) >= 720; // 12:00 PM
                  const isBeforeLunch = idx > 0 && parseTime(displayAppointments[idx - 1].timeSlot) < 720 && isAfterLunch;

                  const timeParts = app.timeSlot ? app.timeSlot.split(' ') : ['09:00', 'AM'];
                  const hourMin = timeParts[0];
                  const amPm = timeParts[1] || 'AM';

                  return (
                    <React.Fragment key={app._id}>
                      {/* Render lunch break separator */}
                      {isBeforeLunch && (
                        <div className="flex items-center gap-2 py-2 px-3">
                          <div className="flex-1 h-[1px] bg-slate-100"></div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">Lunch Break • 12:00 PM</span>
                          <div className="flex-1 h-[1px] bg-slate-100"></div>
                        </div>
                      )}

                      <div className="group flex items-center p-3 hover:bg-slate-50/50 rounded-xl transition-colors duration-150 border border-transparent hover:border-slate-100 relative gap-3">
                        
                        {/* Time */}
                        <div className="w-14 shrink-0 flex flex-col items-center border-r border-slate-100 pr-3">
                          <span className="text-[15px] font-bold text-slate-900 tracking-tight">{hourMin}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider font-mono">{amPm}</span>
                        </div>

                        {/* Patient info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            {app.avatarUrl ? (
                              <img 
                                src={app.avatarUrl} 
                                alt={app.patientId?.name} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-xs" 
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#f3f3f4] border border-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase text-xs">
                                {app.initials || (app.patientId?.name ? app.patientId.name.substring(0, 2) : 'PT')}
                              </div>
                            )}
                            {app.status === 'in progress' && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#c8f17a] border-2 border-white rounded-full"></span>
                            )}
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-0">
                            <h4 className="font-bold text-slate-800 text-[13px] truncate">{app.patientId?.name || 'Guest Patient'}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">{app.notes || 'Routine Consultation'}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">{app.doctor || 'Dr. Thorne'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status badge & operation triggers */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-2">
                            {/* Live action operations */}
                            {!app.isSeed && (
                              <div className="flex gap-1.5 items-center mr-1">
                                {app.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleStatusChange(app._id, 'confirmed')}
                                      className="px-2.5 py-0.5 rounded-full bg-black text-[#c8f17a] hover:bg-slate-800 text-[9px] font-bold transition-colors cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                  </>
                                )}
                                {app.status === 'confirmed' && (
                                  <>
                                    <button 
                                      onClick={() => handleStatusChange(app._id, 'completed')}
                                      className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-[9px] font-bold transition-colors cursor-pointer"
                                    >
                                      Done
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {app.status === 'in progress' && (
                              <span className="px-2.5 py-0.5 bg-[#c8f17a]/15 text-[#496800] rounded-full font-mono text-[9px] font-bold uppercase tracking-wider border border-[#c8f17a]/30">
                                <span>Active</span>
                              </span>
                            )}
                            {app.status === 'pending' && (
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                                <span>Pending</span>
                              </span>
                            )}
                            {app.status === 'confirmed' && (
                              <span className="px-2.5 py-0.5 border border-black text-black rounded-full font-mono text-[9px] font-bold uppercase tracking-wider">
                                <span>OK</span>
                              </span>
                            )}
                            {app.status === 'completed' && (
                              <span className="px-2.5 py-0.5 bg-[#f3f8e6] text-[#496800] rounded-full font-mono text-[9px] font-bold uppercase tracking-wider border border-[#e5f1cc]">
                                <span>Done</span>
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white rounded-[24px] max-w-xl w-full p-6 shadow-xl border border-slate-100 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-400">Book Appointment Slot</p>
                  <h3 className="text-[15px] font-bold text-slate-900">Create a new consultation appointment</h3>
                </div>
                <button 
                  onClick={() => setIsBookModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient File</label>
                    {user?.role === 'patient' ? (
                      <input 
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 focus:outline-none"
                        value={user?.name || ''}
                        disabled
                      />
                    ) : (
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-black transition-colors duration-150"
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Patient File --</option>
                        {patients.map(p => (
                          <option key={p._id} value={p._id}>{p.name} (Age: {p.age})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consultation Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-black transition-colors duration-150"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Slot</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-black transition-colors duration-150"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Symptoms / Reason</label>
                  <textarea 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-black transition-colors duration-150 resize-none min-h-[84px]"
                    placeholder="e.g. routine check-up, vaccine booster..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-black text-[#c8f17a] hover:bg-slate-900 py-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
                >
                  Confirm Scheduling
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Appointments;
