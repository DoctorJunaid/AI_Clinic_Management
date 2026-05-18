const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// Mock data list for Offline Demo
let mockAppointments = [
  {
    _id: 'mock_a1',
    patientId: { _id: 'mock_p1', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    doctorId: { _id: 'mock_doc1', name: 'Dr. John Smith', specialization: 'Cardiology' },
    date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    status: 'scheduled',
    reason: 'Routine cardiovascular follow-up'
  },
  {
    _id: 'mock_a2',
    patientId: { _id: 'mock_p2', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
    doctorId: { _id: 'mock_doc1', name: 'Dr. John Smith', specialization: 'Cardiology' },
    date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    reason: 'Hypertension checkup'
  },
  {
    _id: 'mock_a3',
    patientId: { _id: 'mock_p3', name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
    doctorId: { _id: 'mock_doc2', name: 'Dr. Sarah Connor', specialization: 'Pediatrics' },
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    reason: 'Flu Vaccine'
  }
];

// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected. Falling back to offline mock appointments...');
      return res.status(200).json({ success: true, count: mockAppointments.length, data: mockAppointments });
    }

    let query = {};
    if (req.user.role === 'patient') query.patientId = req.user.id;
    if (req.user.role === 'doctor') query.doctorId = req.user.id;

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
// @access  Private (Patient, Receptionist)
exports.createAppointment = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newAppointment = {
        _id: 'mock_a_' + Date.now(),
        patientId: { _id: req.body.patientId || 'mock_p1', name: req.body.patientName || 'Sarah Jenkins' },
        doctorId: { _id: req.body.doctorId || 'mock_doc1', name: 'Dr. John Smith' },
        date: req.body.date || new Date().toISOString(),
        status: 'scheduled',
        reason: req.body.reason || 'General checkup',
        createdBy: req.user.id
      };
      mockAppointments.unshift(newAppointment);
      return res.status(201).json({ success: true, data: newAppointment });
    }

    req.body.createdBy = req.user.id;
    
    // Check doctor availability (Mock validation)
    const appointment = await Appointment.create(req.body);
    
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/v1/appointments/:id/status
// @access  Private (Doctor, Receptionist)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let index = mockAppointments.findIndex(a => a._id === req.params.id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Appointment not found' });
      mockAppointments[index].status = req.body.status;
      return res.status(200).json({ success: true, data: mockAppointments[index] });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
