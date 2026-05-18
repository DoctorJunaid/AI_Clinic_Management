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
