const Patient = require('../models/Patient');
const mongoose = require('mongoose');

// @desc    Get all patients
// @route   GET /api/v1/patients
// @access  Private (Admin, Doctor, Receptionist)
exports.getPatients = async (req, res) => {
  try {
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
    // Role-based Access Control: Patient can only view their own patient file
    if (req.user.role === 'patient' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this patient record' });
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
// @access  Private (Receptionist, Admin)
exports.createPatient = async (req, res) => {
  try {
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
// @access  Private (Receptionist, Doctor, Admin)
exports.updatePatient = async (req, res) => {
  try {
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
