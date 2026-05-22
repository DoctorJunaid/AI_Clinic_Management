const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Appointment = require('./src/models/Appointment');
const Patient = require('./src/models/Patient');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected!');

    const doctors = await User.find({ role: 'doctor' });
    console.log(`\n👨‍⚕️ Doctors in DB: ${doctors.length}`);
    doctors.forEach(doc => {
      console.log(`  - ID: ${doc._id}, Name: ${doc.name}, Specialization: ${doc.specialization}`);
    });

    const patients = await Patient.find();
    console.log(`\n🏥 Patients in DB: ${patients.length}`);
    patients.forEach(pat => {
      console.log(`  - ID: ${pat._id}, Name: ${pat.name}`);
    });

    const appointments = await Appointment.find();
    console.log(`\n📅 Appointments in DB: ${appointments.length}`);
    appointments.forEach(app => {
      console.log(`  - ID: ${app._id}, DoctorID: ${app.doctorId}, Date: ${app.date}, Slot: ${app.timeSlot}`);
    });

    if (doctors.length > 0) {
      const docId = doctors[0]._id;
      const dateStr = '2026-05-30';
      const searchDate = new Date(dateStr);
      
      const baseSlots = [
        '09:00 AM - 09:30 AM',
        '09:30 AM - 10:00 AM',
        '10:00 AM - 10:30 AM',
        '10:30 AM - 11:00 AM',
        '11:00 AM - 11:30 AM',
        '11:30 AM - 12:00 PM',
        '02:00 PM - 02:30 PM',
        '02:30 PM - 03:00 PM',
        '03:00 PM - 03:30 PM',
        '03:30 PM - 04:00 PM',
        '04:00 PM - 04:30 PM',
        '04:30 PM - 05:00 PM'
      ];

      const startOfDay = new Date(searchDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const dayApts = await Appointment.find({
        doctorId: docId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['pending', 'confirmed', 'completed', 'rescheduled'] }
      });

      console.log(`\n🔍 Slots check for Doctor ${doctors[0].name} on ${dateStr}:`);
      console.log(`  Start of Day: ${startOfDay.toISOString()}`);
      console.log(`  End of Day: ${endOfDay.toISOString()}`);
      console.log(`  Active Appointments found: ${dayApts.length}`);
      
      const bookedSlots = dayApts.map(app => app.timeSlot);
      const slots = baseSlots.map(slot => ({
        timeSlot: slot,
        available: !bookedSlots.includes(slot)
      }));

      console.log('  Slots generated:');
      console.log(slots);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
