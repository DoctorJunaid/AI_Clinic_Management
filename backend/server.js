const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes 
app.use('/api/v1/auth', require('./src/routes/authRoutes'));
app.use('/api/v1/patients', require('./src/routes/patientRoutes'));
app.use('/api/v1/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/v1/prescriptions', require('./src/routes/prescriptionRoutes'));
app.use('/api/v1/ai', require('./src/routes/aiRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
