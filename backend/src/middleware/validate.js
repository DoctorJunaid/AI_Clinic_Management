const mongoose = require('mongoose');

// Utility helper to validate email regex
const isValidEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Generic validation runner middleware
exports.validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    Object.keys(schema).forEach((key) => {
      const rules = schema[key];
      const val = body[key];

      // Required check
      if (rules.required && (val === undefined || val === null || val === '')) {
        errors.push(`Field '${key}' is required.`);
        return;
      }

      if (val !== undefined && val !== null && val !== '') {
        // Type check
        if (rules.type === 'number' && typeof val !== 'number' && isNaN(Number(val))) {
          errors.push(`Field '${key}' must be a number.`);
        }
        if (rules.type === 'array' && !Array.isArray(val)) {
          errors.push(`Field '${key}' must be an array.`);
        }
        if (rules.type === 'string' && typeof val !== 'string') {
          errors.push(`Field '${key}' must be a string.`);
        }

        // Email check
        if (rules.isEmail && !isValidEmail(val)) {
          errors.push(`Field '${key}' must be a valid email address.`);
        }

        // ObjectId check
        if (rules.isObjectId && !mongoose.Types.ObjectId.isValid(val)) {
          errors.push(`Field '${key}' must be a valid MongoDB ObjectId.`);
        }

        // Min length check
        if (rules.minLength && String(val).length < rules.minLength) {
          errors.push(`Field '${key}' must be at least ${rules.minLength} characters long.`);
        }

        // Enum check
        if (rules.enum && !rules.enum.includes(val)) {
          errors.push(`Field '${key}' must be one of [${rules.enum.join(', ')}].`);
        }
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    next();
  };
};

// Predetermined validation schemas
exports.schemas = {
  register: {
    name: { required: true, type: 'string', minLength: 2 },
    email: { required: true, type: 'string', isEmail: true },
    password: { required: true, type: 'string', minLength: 6 },
    role: { type: 'string', enum: ['admin', 'doctor', 'receptionist', 'patient'] },
    phone: { type: 'string' },
    specialization: { type: 'string' }
  },
  login: {
    email: { required: true, type: 'string', isEmail: true },
    password: { required: true, type: 'string' }
  },
  createPatient: {
    name: { required: true, type: 'string' },
    age: { required: true, type: 'number' },
    gender: { required: true, type: 'string', enum: ['male', 'female', 'other'] },
    contact: { required: true, type: 'string' },
    address: { required: true, type: 'string' },
    email: { type: 'string' },
    bloodGroup: { type: 'string' }
  },
  createAppointment: {
    patientId: { required: true, isObjectId: true },
    doctorId: { required: true, isObjectId: true },
    date: { required: true, type: 'string' },
    timeSlot: { required: true, type: 'string' }
  },
  createPrescription: {
    patientId: { required: true, isObjectId: true },
    medicines: { required: true, type: 'array' }
  }
};
