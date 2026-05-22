const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  age: {
    type: Number,
    required: [true, 'Please add an age']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please add a gender']
  },
  contact: {
    type: String,
    required: [true, 'Please add a contact number']
  },
  email: {
    type: String,
    default: ''
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  vitals: {
    heartRate: {
      type: Number,
      default: 72
    },
    bloodPressure: {
      type: String,
      default: '120/80'
    },
    bloodGlucose: {
      type: Number,
      default: 100
    },
    spo2: {
      type: Number,
      default: 98
    },
    temperature: {
      type: Number,
      default: 98.6
    },
    respiratoryRate: {
      type: Number,
      default: 16
    }
  },
  scans: {
    type: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      publicId: { type: String, default: '' },
      fileType: { type: String, default: 'image/png' },
      size: { type: Number, default: 0 },
      date: { type: String, default: () => new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }
    }],
    default: []
  },
  allergies: {
    type: [String],
    default: []
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  avatar: {
    type: String,
    default: ''
  },
  avatarPublicId: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User' // Linked patient user account if exists
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
