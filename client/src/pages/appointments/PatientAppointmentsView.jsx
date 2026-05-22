import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, User, FileText, CheckCircle2, Clock3, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './PatientAppointmentsView.css';

const PatientAppointmentsView = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  // Live Doctors & Dynamic Slots state
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      fetchAvailableSlots(selectedDoctor, appointmentDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, appointmentDate]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/v1/auth/users');
      const allUsers = res.data.data || res.data || [];
      const docs = allUsers.filter(u => u.role === 'doctor');
      setDoctors(docs);
      if (docs.length > 0) {
        setSelectedDoctor(docs[0]._id);
      }
    } catch (err) {
      console.error('Failed to load doctors list', err);
    }
  };

  const fetchAvailableSlots = async (docId, dateStr) => {
    setLoadingSlots(true);
    try {
      const res = await axios.get('/api/v1/appointments/slots', {
        params: { doctorId: docId, date: dateStr }
      });
      const slots = res.data.data || [];
      setAvailableSlots(slots);
      
      const firstAvail = slots.find(s => s.available);
      if (firstAvail) {
        setTimeSlot(firstAvail.timeSlot);
      } else {
        setTimeSlot('');
      }
    } catch (err) {
      console.error('Failed to fetch slots', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, [user]);

  const fetchMyAppointments = async () => {
    setIsLoading(true);
    try {
      const patientId = user?._id || user?.id;
      const res = await axios.get('/api/v1/appointments', { 
        params: { patientId } 
      });
      
      let data = res.data.data || res.data || [];
      
      if (patientId) {
        data = data.filter(app => {
          const appId = typeof app.patientId === 'object' ? app.patientId._id : app.patientId;
          return appId === patientId || app.patientId?.name === user?.name;
        });
      }

      setAppointments(data);
    } catch (err) {
      toast.error('Failed to load your appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    if (e) e.preventDefault();
    const patientId = user?._id || user?.id;
    
    if (!selectedDoctor || !appointmentDate || !timeSlot) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      const newApp = {
        patientId: patientId,
        doctorId: selectedDoctor,
        date: new Date(appointmentDate).toISOString(),
        timeSlot: timeSlot,
        notes: notes
      };

      await axios.post('/api/v1/appointments', newApp);
      
      setIsBookModalOpen(false);
      setAppointmentDate('');
      setNotes('');
      toast.success('Appointment booked successfully!');
      
      fetchMyAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book slot');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    if (status === 'confirmed' || status === 'in progress') {
      return (
        <span className="pa-badge status-confirmed">
          <CheckCircle2 size={10} /> Confirmed
        </span>
      );
    }
    return (
      <span className="pa-badge status-pending">
        <Clock3 size={10} /> Pending
      </span>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="patient-appointments-page relative"
    >
      <div className="patient-appointments-header">
        <div>
          <h1 className="pa-title">My Appointments</h1>
          <p className="pa-subtitle">Manage your upcoming visits and consultations securely.</p>
        </div>
        
        <button 
          className="pa-action-btn"
          onClick={() => setIsBookModalOpen(true)}
        >
          <Plus size={16} />
          Book New Visit
        </button>
      </div>

      {isLoading ? (
        <div className="pa-empty">
          <Clock className="animate-spin pa-empty-icon" size={32} />
          <p>Loading your appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="pa-empty">
          <Calendar className="pa-empty-icon text-muted" size={48} />
          <p>You have no upcoming appointments.</p>
        </div>
      ) : (
        <div className="pa-grid">
          {appointments.map((app, idx) => (
            <motion.div 
              key={app._id || idx}
              className="pa-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.2 }}
            >
              <div className="pa-card-header">
                <div className="pa-date-box">
                  <span className="pa-date">{formatDate(app.date)}</span>
                  <span className="pa-time">{app.timeSlot || '09:00 AM'}</span>
                </div>
                {getStatusBadge(app.status)}
              </div>
              
              <div className="pa-card-body">
                <div className="pa-doctor">
                  <User size={14} className="text-muted" />
                  {app.doctorId?.name || app.doctor || 'Assigned Doctor'}
                </div>
                {app.notes && (
                  <div className="pa-notes">
                    <FileText size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    {app.notes}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Book Appointment Slot</span>
                  <h3 className="text-xl font-bold text-slate-900 font-headline-xl">Create a new consultation</h3>
                </div>
                <button 
                  onClick={() => setIsBookModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleBookAppointment} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Patient</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed" 
                      value={user?.name || ''} 
                      disabled 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Doctor</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                      value={selectedDoctor} 
                      onChange={(e) => setSelectedDoctor(e.target.value)} 
                      required
                    >
                      {doctors.map(doc => {
                        const displayName = doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`;
                        return (
                          <option key={doc._id} value={doc._id}>{displayName} ({doc.specialization || 'General'})</option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Date</label>
                      <input 
                        type="date" 
                        className="w-full bg-white border border-slate-200 rounded px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                        value={appointmentDate} 
                        onChange={(e) => setAppointmentDate(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Time Slot</label>
                      <select 
                        className="w-full bg-white border border-slate-200 rounded px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-black focus:ring-1 focus:ring-black" 
                        value={timeSlot} 
                        onChange={(e) => setTimeSlot(e.target.value)} 
                        required
                        disabled={loadingSlots || availableSlots.length === 0}
                      >
                        {loadingSlots ? (
                          <option>Loading slots...</option>
                        ) : availableSlots.length === 0 ? (
                          <option value="">Choose doctor & date</option>
                        ) : (
                          availableSlots.map(slot => (
                            <option 
                              key={slot.timeSlot} 
                              value={slot.timeSlot} 
                              disabled={!slot.available}
                            >
                              {slot.timeSlot} {!slot.available ? '(Booked)' : ''}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Symptoms / Reason</label>
                    <textarea 
                      className="w-full bg-white border border-slate-200 rounded px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none min-h-[100px]" 
                      placeholder="e.g. routine check-up, headache..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-black hover:bg-slate-800 text-white transition-colors py-3.5 rounded text-sm font-bold mt-2"
                  >
                    Confirm Scheduling
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PatientAppointmentsView;
