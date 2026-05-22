// Global Centralized Error Handling Middleware for MedFlow AI
module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to server console for clinical diagnostics
  console.error('🔥 Clinical API Server Error:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { status: 404, message };
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered. A record with these unique details already exists.';
    error = { status: 400, message };
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { status: 400, message };
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route. Invalid encryption session.';
    error = { status: 401, message };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Session expired. Please log in again.';
    error = { status: 401, message };
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error. Please contact clinical administrator.'
  });
};
