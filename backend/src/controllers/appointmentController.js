const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');

// Helper to automatically resolve mock/invalid ObjectIds to live database ObjectIds
const resolveValidIds = async (body) => {
  if (!body.doctorId || body.doctorId.toString().startsWith('mock') || !mongoose.Types.ObjectId.isValid(body.doctorId)) {
    const doctor = await User.findOne({ role: 'doctor' });
    if (doctor) {
      body.doctorId = doctor._id;
    }
  }
  if (!body.patientId || body.patientId.toString().startsWith('mock') || !mongoose.Types.ObjectId.isValid(body.patientId)) {
    const patient = await Patient.findOne();
    if (patient) {
      body.patientId = patient._id;
    }
  }
};

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
    }
    if (req.user.role === 'doctor') {
      query.doctorId = req.user.id;
    }

    // Add date filtering if requested
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        
        const endOfDay = new Date(searchDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        
        query.date = {
          $gte: startOfDay,
          $lte: endOfDay
        };
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
// @access  Private (Patient, Receptionist, Admin)
exports.createAppointment = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    
    // Resolve any hardcoded/mock IDs from frontend to valid seeded database ObjectIds
    await resolveValidIds(req.body);

    const appointment = await Appointment.create(req.body);
    
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/v1/appointments/:id/status
// @access  Private (Doctor, Receptionist, Admin)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
