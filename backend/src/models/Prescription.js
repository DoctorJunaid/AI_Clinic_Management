const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment'
  },
  medicines: [{
    name: { type: String },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String }
  }],
  instructions: {
    type: String,
    default: ''
  },
  aiExplanation: {
    type: String,
    default: ''
  },
  pdfUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
