const Prescription = require('../models/Prescription');
const mongoose = require('mongoose');

// Mock data list for Offline Demo
let mockPrescriptions = [
  {
    _id: 'mock_pr1',
    patientId: { _id: 'mock_patient_id_55555', name: 'Sarah Jenkins' },
    doctorId: { _id: 'mock_doctor_id_56789', name: 'Dr. Sarah Ahmed' },
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in the morning', duration: '30 days' }
    ],
    diagnoses: ['Hypertension'],
    notes: 'Maintain low sodium diet and continue moderate daily walking.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mock_pr2',
    patientId: { _id: 'mock_p2', name: 'Michael Chen' },
    doctorId: { _id: 'mock_doctor_id_56789', name: 'Dr. Sarah Ahmed' },
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '60 days' }
    ],
    diagnoses: ['Type 2 Diabetes'],
    notes: 'Check blood glucose levels twice daily.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// @desc    Get all prescriptions
// @route   GET /api/v1/prescriptions
// @access  Private
exports.getPrescriptions = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected. Falling back to offline mock prescriptions...');
      let userPrescriptions = mockPrescriptions;
      if (req.user.role === 'patient') {
        userPrescriptions = mockPrescriptions.filter(pr => {
          const pId = pr.patientId && (pr.patientId._id || pr.patientId);
          return pId === req.user.id;
        });
      } else if (req.user.role === 'doctor') {
        userPrescriptions = mockPrescriptions.filter(pr => {
          const dId = pr.doctorId && (pr.doctorId._id || pr.doctorId);
          return dId === req.user.id;
        });
      }
      return res.status(200).json({ success: true, count: userPrescriptions.length, data: userPrescriptions });
    }

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
    if (mongoose.connection.readyState !== 1) {
      const newPrescription = {
        _id: 'mock_pr_' + Date.now(),
        patientId: { _id: req.body.patientId || 'mock_patient_id_55555', name: req.body.patientName || 'Sarah Jenkins' },
        doctorId: { _id: req.user.id, name: 'Dr. Sarah Ahmed' },
        medications: req.body.medications || [],
        diagnoses: req.body.diagnoses || [],
        notes: req.body.notes || '',
        createdAt: new Date().toISOString()
      };
      mockPrescriptions.unshift(newPrescription);
      return res.status(201).json({ success: true, data: newPrescription });
    }

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
    let prescription;
    if (mongoose.connection.readyState !== 1) {
      prescription = mockPrescriptions.find(p => p._id === req.params.id);
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }
    } else {
      prescription = await Prescription.findById(req.params.id)
        .populate('patientId', 'name age gender')
        .populate('doctorId', 'name specialization');
        
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }
    }

    // Role-based Access Control: Patient can only view their own prescription
    if (req.user.role === 'patient') {
      const pId = prescription.patientId && (prescription.patientId._id || prescription.patientId);
      if (pId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this prescription' });
      }
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
    let prescription;
    if (mongoose.connection.readyState !== 1) {
      prescription = mockPrescriptions.find(p => p._id === req.params.id);
    } else {
      prescription = await Prescription.findById(req.params.id)
        .populate('patientId', 'name age gender')
        .populate('doctorId', 'name specialization');
    }

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Role-based Access Control: Patient can only download their own prescription
    if (req.user.role === 'patient') {
      const pId = prescription.patientId && (prescription.patientId._id || prescription.patientId);
      if (pId !== req.user.id) {
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
