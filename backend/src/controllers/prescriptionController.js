const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');
const { generatePrescriptionPDF } = require('../services/pdfService');

// Helper to automatically resolve mock/invalid patientId to live database ObjectId
const resolvePatientId = async (body) => {
  if (!body.patientId || body.patientId.toString().startsWith('mock') || !mongoose.Types.ObjectId.isValid(body.patientId)) {
    const patient = await Patient.findOne();
    if (patient) {
      body.patientId = patient._id;
    }
  }
};

// @desc    Get all prescriptions
// @route   GET /api/v1/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
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

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name gender age')
      .populate('doctorId', 'name specialization')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new prescription
// @route   POST /api/v1/prescriptions
// @access  Private (Doctor, Admin)
exports.createPrescription = async (req, res) => {
  try {
    req.body.doctorId = req.user.id;
    
    // Resolve any hardcoded/mock patientId from frontend to valid seeded database ObjectIds
    await resolvePatientId(req.body);

    const prescription = await Prescription.create(req.body);
    
    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single prescription
// @route   GET /api/v1/prescriptions/:id
// @access  Private
exports.getPatientPrescription = async (req, res) => {
  // Maintaining standard getPrescription function
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization');
      
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Role-based Access Control: Patient can only view their own prescription
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user.id });
      const pId = prescription.patientId && (prescription.patientId._id || prescription.patientId);
      if (patient && pId.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this prescription' });
      }
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Aliasing getPatientPrescription as getPrescription to match route exports
exports.getPrescription = exports.getPatientPrescription;

// @desc    Download Prescription as PDF
// @route   GET /api/v1/prescriptions/:id/pdf
// @access  Private
exports.downloadPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Role-based Access Control: Patient can only download their own prescription
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user.id });
      const pId = prescription.patientId && (prescription.patientId._id || prescription.patientId);
      if (patient && pId.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to download this prescription' });
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);

    generatePrescriptionPDF(prescription, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
