const mongoose = require('mongoose');

const diagnosisLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient'
  },
  doctorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: [{
    type: String,
    required: true
  }],
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  patientHistory: {
    type: String
  },
  aiResponse: {
    type: String
  },
  conditions: [{
    name: String,
    probability: String
  }],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  suggestedTests: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DiagnosisLog', diagnosisLogSchema);
