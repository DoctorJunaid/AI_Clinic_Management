import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Filter, Search, ChevronRight, ChevronLeft, X, Plus
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import PatientAppointmentsView from './PatientAppointmentsView';
import './Appointments.css';

const Appointments = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'patient') {
    return <PatientAppointmentsView />;
  }
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  
  // Book Appointment Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  // Doctors & Slots state
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Selected date on mini calendar
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date()); 

  useEffect(() => {
    fetchAppointments(selectedCalendarDate);
    if (user?.role !== 'patient') {
      fetchPatients();
      fetchDoctors();
    } else {
      setSelectedPatient(user._id || user.id || '');
    }
  }, [user, selectedCalendarDate]);

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      fetchAvailableSlots(selectedDoctor, appointmentDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, appointmentDate]);

  const fetchAppointments = async (date) => {
    setIsLoading(true);
    try {
      const params = {};
      if (date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        params.date = `${yyyy}-${mm}-${dd}`;
      }
      const res = await axios.get('/api/v1/appointments', { params });
      setAppointments(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load appointments from server');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/v1/patients');
      setPatients(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load patient records');
    }
  };

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
    if (!patientId || !selectedDoctor || !appointmentDate || !timeSlot) {
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
      
      if (appointmentDate) {
        const parts = appointmentDate.split('-');
        const bookedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        setSelectedCalendarDate(bookedDate);
      } else {
        fetchAppointments(selectedCalendarDate);
      }
      
      setSelectedPatient('');
      setAppointmentDate('');
      setNotes('');
      setIsBookModalOpen(false);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book slot');
    }
  };

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

  const getTimelineAppointments = () => {
    let combined = (appointments || []).map(app => {
      const firstSlotPart = app.timeSlot ? String(app.timeSlot).split('-')[0].trim() : '09:00 AM';
      return {
        _id: app._id,
        patientId: app.patientId || { name: 'Guest Patient' },
        notes: app.notes || 'Routine Consultation',
        timeSlot: firstSlotPart,
        date: app.date,
        status: app.status,
        doctor: app.doctorId?.name || 'Dr. Thorne',
        isSeed: false
      };
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
      combined = combined.filter(app => {
        const name = app.patientId?.name || '';
        const notes = app.notes || '';
        const doctor = app.doctor || '';
        return name.toLowerCase().includes(query) ||
               notes.toLowerCase().includes(query) ||
               doctor.toLowerCase().includes(query);
      });
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

    const handlePrevMonth = () => setSelectedCalendarDate(new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() - 1, 1));
    const handleNextMonth = () => setSelectedCalendarDate(new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth() + 1, 1));

    const hasDot = (day) => {
      const today = new Date();
      if (selectedCalendarDate.getMonth() === today.getMonth() && selectedCalendarDate.getFullYear() === today.getFullYear()) {
        return [today.getDate(), today.getDate() + 1].includes(day);
      }
      return day % 5 === 0 || day % 7 === 2;
    };

    return (
      <div className="calendar-card">
        <div className="calendar-header">
          <h3 className="calendar-month">
            {monthNames[selectedCalendarDate.getMonth()]} {selectedCalendarDate.getFullYear()}
          </h3>
          <div className="calendar-nav-btns">
            <button onClick={handlePrevMonth} className="icon-btn">
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNextMonth} className="icon-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="calendar-days-header">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <span key={d} className="calendar-day-label">{d}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {allDays.map((day, idx) => {
            if (day === null) return <span key={`pad-${idx}`} />;
            const isSelected = day === selectedCalendarDate.getDate();
            const isToday = day === new Date().getDate() && selectedCalendarDate.getMonth() === new Date().getMonth() && selectedCalendarDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={`day-${day}`} 
                onClick={() => setSelectedCalendarDate(new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), day))}
                className="calendar-cell-wrapper"
              >
                <div className={`calendar-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}>
                  {day}
                </div>
                {hasDot(day) && (
                  <span className="calendar-dot brand" />
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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="appointments-page"
    >
      <div className="appointments-header">
        <h1 className="appointments-title">Reception Desk</h1>
        <p className="appointments-subtitle">Register clinic walk-ins, schedule appointments, and coordinate daily physician timelines.</p>
      </div>

      <div className="appointments-grid">
        
        {/* Left Column */}
        <div className="calendar-col">
          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="btn btn-primary book-btn"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} />
              <span>New Appointment</span>
            </div>
            <Plus size={16} />
          </button>
          {renderMiniCalendar()}
        </div>

        {/* Right Column */}
        <div className="schedule-card">
          <div className="schedule-header">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2 className="schedule-title">Schedule</h2>
              <div className="schedule-filters">
                <button 
                  onClick={() => setFilterStatus('all')}
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                >
                  All ({displayAppointments.length})
                </button>
                <button 
                  onClick={() => setFilterStatus('pending')}
                  className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                >
                  Pending
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div className="search-container">
                <Search size={14} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search schedules..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn btn-outline" style={{ padding: '0.375rem 0.5rem' }}>
                <Filter size={14} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <Clock className="text-muted animate-spin" size={24} />
            </div>
          ) : displayAppointments.length === 0 ? (
            <div className="empty-state">
              <Calendar size={28} className="text-muted" />
              <span className="empty-state-text">No appointments found.</span>
            </div>
          ) : (
            <div className="schedule-list">
              {displayAppointments.map((app, idx) => {
                const isAfterLunch = parseTime(app.timeSlot) >= 720; // 12:00 PM
                const isBeforeLunch = idx > 0 && parseTime(displayAppointments[idx - 1].timeSlot) < 720 && isAfterLunch;

                const timeParts = app.timeSlot ? String(app.timeSlot).split(' ') : ['09:00', 'AM'];
                const hourMin = timeParts[0];
                const amPm = timeParts[1] || 'AM';

                let statusBadgeClass = 'badge-neutral';
                if (app.status === 'in progress' || app.status === 'confirmed') statusBadgeClass = 'badge-success';
                else if (app.status === 'pending') statusBadgeClass = 'badge-warning';

                return (
                  <React.Fragment key={app._id}>
                    {isBeforeLunch && (
                      <div className="lunch-break">
                        <div className="lunch-line"></div>
                        <span className="lunch-text">Lunch • 12:00 PM</span>
                        <div className="lunch-line"></div>
                      </div>
                    )}

                    <div className="apt-row">
                      <div className="apt-time-col">
                        <span className="apt-time">{hourMin}</span>
                        <span className="apt-ampm">{amPm}</span>
                      </div>

                      <div className="apt-avatar">
                        {app.avatarUrl ? (
                          <img src={app.avatarUrl} alt={app.patientId?.name} />
                        ) : (
                          <span>{app.initials || (app.patientId?.name ? app.patientId.name.substring(0, 2).toUpperCase() : 'PT')}</span>
                        )}
                      </div>

                      <div className="apt-details">
                        <span className="apt-name">{app.patientId?.name || 'Guest Patient'}</span>
                        <div className="apt-meta">
                          <span>{app.notes || 'Routine'}</span>
                          <span className="apt-dot"></span>
                          <span>{app.doctor || 'Dr. Thorne'}</span>
                        </div>
                      </div>

                      <div className="apt-actions">
                        {!app.isSeed && app.status === 'pending' && (
                          <button onClick={() => handleStatusChange(app._id, 'confirmed')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem' }}>Confirm</button>
                        )}
                        {!app.isSeed && app.status === 'confirmed' && (
                          <button onClick={() => handleStatusChange(app._id, 'completed')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem' }}>Done</button>
                        )}
                        <span className={`badge ${statusBadgeClass}`}>{app.status}</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isBookModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="modal-card"
            >
              <div className="modal-header">
                <div className="modal-title-group">
                  <span className="modal-subtitle">Book Appointment Slot</span>
                  <h3 className="modal-title">Create a new consultation</h3>
                </div>
                <button onClick={() => setIsBookModalOpen(false)} className="icon-btn">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <label className="field-label">Patient File</label>
                    {user?.role === 'patient' ? (
                      <input type="text" className="input-field" value={user?.name || ''} disabled />
                    ) : (
                      <select className="input-field" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required>
                        <option value="">-- Choose Patient --</option>
                        {(patients || []).map(p => (
                          <option key={p._id} value={p._id}>{p.name} (Age: {p.age})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <label className="field-label">Date</label>
                    <input type="date" className="input-field" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <label className="field-label">Doctor</label>
                    <select 
                      className="input-field" 
                      value={selectedDoctor} 
                      onChange={(e) => setSelectedDoctor(e.target.value)} 
                      required
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctors.map(doc => (
                        <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.specialization || 'General'})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <label className="field-label">Time Slot</label>
                    <select 
                      className="input-field" 
                      value={timeSlot} 
                      onChange={(e) => setTimeSlot(e.target.value)} 
                      required
                      disabled={loadingSlots || availableSlots.length === 0}
                    >
                      {loadingSlots ? (
                        <option>Loading available slots...</option>
                      ) : availableSlots.length === 0 ? (
                        <option value="">-- Choose doctor & date --</option>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label className="field-label">Symptoms / Reason</label>
                  <textarea 
                    className="input-field" 
                    style={{ resize: 'none', minHeight: '80px' }}
                    placeholder="e.g. routine check-up..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
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
