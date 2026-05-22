const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');

// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      // Find patient record corresponding to patient user
      const patient = await Patient.findOne({ userId: req.user.id });
      if (patient) {
        query.patientId = patient._id;
      } else {
        query.patientId = req.user.id;
      }
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user.id;
    }

    // Add date filtering if requested
    if (req.query.date) {
      let startOfDay, endOfDay;
      const dateParts = req.query.date.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        
        startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        
        query.date = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      } else {
        const searchDate = new Date(req.query.date);
        if (!isNaN(searchDate.getTime())) {
          startOfDay = new Date(searchDate);
          startOfDay.setUTCHours(0, 0, 0, 0);
          
          endOfDay = new Date(searchDate);
          endOfDay.setUTCHours(23, 59, 59, 999);
          
          query.date = {
            $gte: startOfDay,
            $lte: endOfDay
          };
        }
      }
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name contact avatar')
      .populate('doctorId', 'name specialization')
      .sort('date');

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book new appointment
// @route   POST /api/v1/appointments
// @access  Private (Patient, Receptionist, Admin, Doctor)
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, timeSlot, notes } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Normalize date to compare safely in UTC without timezone offset shifts
    let startOfDay, endOfDay, dbDate;
    const dateParts = typeof date === 'string' ? date.split('T')[0].split('-') : [];
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      
      startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
      dbDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    } else {
      const searchDate = new Date(date);
      startOfDay = new Date(searchDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      endOfDay = new Date(searchDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      dbDate = searchDate;
    }

    // Double booking check: is this doctor already booked at this date and slot?
    const existing = await Appointment.findOne({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      timeSlot,
      status: { $in: ['pending', 'confirmed', 'completed', 'rescheduled'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This timeslot has already been booked for the selected doctor. Please select another slot.'
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: dbDate,
      timeSlot,
      notes: notes || '',
      createdBy: req.user.id
    });

    // Populate patient and doctor details
    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name contact avatar')
      .populate('doctorId', 'name specialization');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/v1/appointments/:id/status
// @access  Private (Doctor, Receptionist, Admin)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name contact avatar')
      .populate('doctorId', 'name specialization');

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/v1/appointments/slots
// @access  Private
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: 'Please provide doctorId and date parameters' });
    }

    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Parse date safely to avoid timezone offset shifts
    let startOfDay, endOfDay;
    const dateParts = typeof date === 'string' ? date.split('T')[0].split('-') : [];
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      
      startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    } else {
      const searchDate = new Date(date);
      if (isNaN(searchDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid date' });
      }
      startOfDay = new Date(searchDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      endOfDay = new Date(searchDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
    }

    console.log(`[Diagnostic] getAvailableSlots called for doctorId=${doctorId}, date=${date}`);
    console.log(`[Diagnostic] Query bounds UTC: startOfDay=${startOfDay.toISOString()}, endOfDay=${endOfDay.toISOString()}`);

    // Define standard slot intervals (9 AM to 5 PM, omitting break 12 PM - 2 PM)
    const baseSlots = [
      '09:00 AM - 09:30 AM',
      '09:30 AM - 10:00 AM',
      '10:00 AM - 10:30 AM',
      '10:30 AM - 11:00 AM',
      '11:00 AM - 11:30 AM',
      '11:30 AM - 12:00 PM',
      // 12:00 PM - 02:00 PM Break
      '02:00 PM - 02:30 PM',
      '02:30 PM - 03:00 PM',
      '03:00 PM - 03:30 PM',
      '03:30 PM - 04:00 PM',
      '04:00 PM - 04:30 PM',
      '04:30 PM - 05:00 PM'
    ];

    // Find all active appointments for this doctor on this day
    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['pending', 'confirmed', 'completed', 'rescheduled'] }
    });

    console.log(`[Diagnostic] Found ${appointments.length} appointments for doctor on this day`);

    const bookedSlots = appointments.map(app => app.timeSlot);

    const slots = baseSlots.map(slot => ({
      timeSlot: slot,
      available: !bookedSlots.includes(slot)
    }));

    console.log(`[Diagnostic] Generated slots:`, slots.map(s => `${s.timeSlot}: ${s.available ? 'Free' : 'Booked'}`));

    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
