const Prescription = require('../models/Prescription');

// @desc    Get all prescriptions
// @route   GET /api/v1/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patientId = req.user.id;
    if (req.user.role === 'doctor') query.doctorId = req.user.id;

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new prescription
// @route   POST /api/v1/prescriptions
// @access  Private (Doctor)
exports.createPrescription = async (req, res) => {
  try {
    req.body.doctorId = req.user.id;
    
    const prescription = await Prescription.create(req.body);
    
    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single prescription
// @route   GET /api/v1/prescriptions/:id
// @access  Private
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization');
      
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const { generatePrescriptionPDF } = require('../services/pdfService');

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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);

    generatePrescriptionPDF(prescription, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
