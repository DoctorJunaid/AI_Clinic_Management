const Patient = require('../models/Patient');
const mongoose = require('mongoose');

// Mock data list for Offline Demo
let mockPatients = [
  { _id: 'mock_p1', name: 'Sarah Jenkins', age: 28, gender: 'female', contact: '555-0199', bloodGroup: 'O+', medicalHistory: 'General checkup • 10:00 AM' },
  { _id: 'mock_p2', name: 'Michael Chen', age: 34, gender: 'male', contact: '555-0143', bloodGroup: 'A-', medicalHistory: 'Follow up • 11:30 AM' },
  { _id: 'mock_p3', name: 'Emily Davis', age: 41, gender: 'female', contact: '555-0182', bloodGroup: 'B+', medicalHistory: 'Vaccination • 02:00 PM' },
  { _id: 'mock_p4', name: 'Robert Wilson', age: 52, gender: 'male', contact: '555-0177', bloodGroup: 'O-', medicalHistory: 'Lab Results • 04:15 PM' }
];

// @desc    Get all patients
// @route   GET /api/v1/patients
// @access  Private (Admin, Doctor, Receptionist)
exports.getPatients = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected. Falling back to offline mock patients...');
      return res.status(200).json({ success: true, count: mockPatients.length, data: mockPatients });
    }
    const patients = await Patient.find().sort('-createdAt');
    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single patient
// @route   GET /api/v1/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const patient = mockPatients.find(p => p._id === req.params.id);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      return res.status(200).json({ success: true, data: patient });
    }
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new patient
// @route   POST /api/v1/patients
// @access  Private (Receptionist)
exports.createPatient = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newPatient = {
        _id: 'mock_p_' + Date.now(),
        ...req.body,
        createdBy: req.user.id
      };
      mockPatients.unshift(newPatient);
      return res.status(201).json({ success: true, data: newPatient });
    }

    // Add user to req.body
    req.body.createdBy = req.user.id;

    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/v1/patients/:id
// @access  Private (Receptionist, Doctor)
exports.updatePatient = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let index = mockPatients.findIndex(p => p._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
      }
      mockPatients[index] = { ...mockPatients[index], ...req.body };
      return res.status(200).json({ success: true, data: mockPatients[index] });
    }

    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
