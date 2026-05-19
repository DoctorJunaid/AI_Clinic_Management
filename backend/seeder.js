const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Load models
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const Appointment = require('./src/models/Appointment');
const Prescription = require('./src/models/Prescription');

const seedData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected successfully!');

    // Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();
    console.log('✅ Collections cleared!');

    console.log('👥 Seeding core users...');

    // 1. Seed Core Users
    // Password will be automatically encrypted by the model pre-save hook
    const adminUser = await User.create({
      name: 'Muhammad Junaid',
      email: 'admin@medflow.com',
      password: '123456',
      role: 'admin',
      phone: '555-0100',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
      subscriptionPlan: 'pro',
      isActive: true
    });

    const doctorUser = await User.create({
      name: 'Dr. Sarah Ahmed',
      email: 'doctor@medflow.com',
      password: '123456',
      role: 'doctor',
      phone: '555-0101',
      avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&h=150&fit=crop',
      specialization: 'Cardiology',
      subscriptionPlan: 'pro',
      isActive: true
    });

    const receptionistUser = await User.create({
      name: 'Sobia Khan (Reception)',
      email: 'reception@medflow.com',
      password: '123456',
      role: 'receptionist',
      phone: '555-0102',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
      subscriptionPlan: 'pro',
      isActive: true
    });

    const patientUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'patient@medflow.com',
      password: '123456',
      role: 'patient',
      phone: '555-0199',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      subscriptionPlan: 'free',
      isActive: true
    });

    console.log('✅ Core users seeded successfully!');

    // 2. Seed Patients
    console.log('🏥 Seeding patient records...');
    const patientSarah = await Patient.create({
      name: 'Sarah Jenkins',
      age: 28,
      gender: 'female',
      contact: '555-0199',
      email: 'patient@medflow.com',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      medicalHistory: 'Mild intermittent palpitations and fatigue.',
      address: '742 Evergreen Terrace, Springfield',
      createdBy: receptionistUser._id,
      userId: patientUser._id
    });

    const patientMichael = await Patient.create({
      name: 'Michael Chen',
      age: 34,
      gender: 'male',
      contact: '555-0143',
      email: 'michael.chen@example.com',
      bloodGroup: 'A-',
      allergies: [],
      medicalHistory: 'Borderline hypertension under dietary management.',
      address: '123 Maple Street, Metropolis',
      createdBy: receptionistUser._id
    });

    const patientEmily = await Patient.create({
      name: 'Emily Davis',
      age: 41,
      gender: 'female',
      contact: '555-0182',
      email: 'emily.davis@example.com',
      bloodGroup: 'B+',
      allergies: ['Sulfa Drugs'],
      medicalHistory: 'Routine checkups, seasonal rhinitis.',
      address: '456 Oak Avenue, Gotham',
      createdBy: receptionistUser._id
    });

    const patientRobert = await Patient.create({
      name: 'Robert Wilson',
      age: 52,
      gender: 'male',
      contact: '555-0177',
      email: 'robert.wilson@example.com',
      bloodGroup: 'O-',
      allergies: ['Lactose'],
      medicalHistory: 'Hypercholesterolemia diagnosed 2 years ago.',
      address: '789 Pine Road, Star City',
      createdBy: receptionistUser._id
    });

    console.log('✅ Patients seeded successfully!');

    // 3. Seed Appointments
    console.log('📅 Seeding appointments...');
    // Today
    const today = new Date();
    today.setHours(9, 0, 0, 0);

    const app1 = await Appointment.create({
      patientId: patientSarah._id,
      doctorId: doctorUser._id,
      date: new Date(today),
      timeSlot: '09:00 AM - 09:30 AM',
      status: 'completed',
      notes: 'Initial checkup for cardiac palpitations.',
      createdBy: receptionistUser._id
    });

    const app2 = await Appointment.create({
      patientId: patientSarah._id,
      doctorId: doctorUser._id,
      date: new Date(today.getTime() + 1 * 60 * 60 * 1000), // + 1 hour
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'confirmed',
      notes: 'Follow-up ECG report analysis.',
      createdBy: receptionistUser._id
    });

    // Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 30, 0, 0);

    const app3 = await Appointment.create({
      patientId: patientMichael._id,
      doctorId: doctorUser._id,
      date: tomorrow,
      timeSlot: '11:30 AM - 12:00 PM',
      status: 'pending',
      notes: 'Routine hypertension blood pressure mapping.',
      createdBy: receptionistUser._id
    });

    console.log('✅ Appointments seeded successfully!');

    // 4. Seed Prescriptions
    console.log('💊 Seeding prescriptions...');
    const pres1 = await Prescription.create({
      patientId: patientSarah._id,
      doctorId: doctorUser._id,
      appointmentId: app1._id,
      medicines: [
        { name: 'Lipitor (Atorvastatin)', dosage: '10mg', frequency: 'Once daily', duration: '30 Days' },
        { name: 'CoQ10 Supplement', dosage: '100mg', frequency: 'Once daily', duration: '30 Days' }
      ],
      instructions: 'Take Lipitor in the evening. Maintain low-sodium diets and gentle morning walks.',
      aiExplanation: 'AI CLINICAL DISPENSARY EXPLANATION:\n\n1. Atorvastatin (Lipitor) functions to safely downregulate hepatic synthesis of low-density lipoproteins (cholesterol) and secure vascular elasticity.\n2. Coenzyme Q10 (CoQ10) is added to support cellular mitochondrial energetics and counteract common statin-induced muscle stiffness.\n3. Safe clinical drug interaction profile confirmed.',
      pdfUrl: ''
    });

    const pres2 = await Prescription.create({
      patientId: patientMichael._id,
      doctorId: doctorUser._id,
      appointmentId: app3._id,
      medicines: [
        { name: 'Metformin Hydrochloride', dosage: '500mg', frequency: 'Twice daily', duration: '60 Days' }
      ],
      instructions: 'Take strictly with breakfast and dinner. Avoid alcoholic beverages.',
      aiExplanation: 'AI CLINICAL DISPENSARY EXPLANATION:\n\n1. Metformin is standard therapy that works by increasing peripheral glucose uptake and insulin sensitivity.\n2. Take with meals to reduce standard gastrointestinal side effects.',
      pdfUrl: ''
    });

    console.log('✅ Prescriptions seeded successfully!');
    console.log('\n⭐⭐⭐ SEEDING COMPLETED SUCCESSFULLY! ⭐⭐⭐\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error.message);
    process.exit(1);
  }
};

seedData();
