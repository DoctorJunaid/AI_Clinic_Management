const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const DiagnosisLog = require('../models/DiagnosisLog');

// @desc    Get dynamic clinical analytics dashboard stats
// @route   GET /api/v1/analytics/stats
// @access  Private (Admin, Doctor)
exports.getStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const activeDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const totalAppointments = await Appointment.countDocuments();
    
    // Revenue: Pro subscription ($2,999) + Completed appointments ($1,500)
    const proPatientsCount = await User.countDocuments({ role: 'patient', subscriptionPlan: 'pro' });
    const dynamicRevenue = (proPatientsCount * 2999) + (completedAppointments * 1500);

    // Calculate Top Specialization/Service by appointment volume
    const topSpec = await Appointment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: '$doctor.specialization',
          count: { $sum: 1 }
         }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const popularService = topSpec.length > 0 && topSpec[0]._id ? topSpec[0]._id : 'General Medicine';

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        activeDoctors,
        completedAppointments,
        totalAppointments,
        dynamicRevenue,
        popularService
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get 6-month load timeline charts for patients and appointments
// @route   GET /api/v1/analytics/trends
// @access  Private (Admin, Doctor)
exports.getTrends = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const appointmentTrends = await Appointment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const patientTrends = await Patient.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trends = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1; // 1-indexed
      trends.push({
        month: monthNames[d.getMonth()],
        year: year,
        monthNum: monthNum,
        appointments: 0,
        patients: 0
      });
    }

    appointmentTrends.forEach(item => {
      const matched = trends.find(t => t.year === item._id.year && t.monthNum === item._id.month);
      if (matched) {
        matched.appointments = item.count;
      }
    });

    patientTrends.forEach(item => {
      const matched = trends.find(t => t.year === item._id.year && t.monthNum === item._id.month);
      if (matched) {
        matched.patients = item.count;
      }
    });

    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top symptoms & condition outbreak statistics
// @route   GET /api/v1/analytics/outbreaks
// @access  Private (Admin, Doctor)
exports.getOutbreaks = async (req, res) => {
  try {
    const outbreaks = await DiagnosisLog.aggregate([
      { $unwind: '$conditions' },
      {
        $group: {
          _id: '$conditions.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const formattedOutbreaks = outbreaks.map(o => ({
      condition: o._id,
      count: o.count
    }));

    res.status(200).json({ success: true, data: formattedOutbreaks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get appointments breakdown by doctor specialties
// @route   GET /api/v1/analytics/department-load
// @access  Private (Admin, Doctor)
exports.getDepartmentLoad = async (req, res) => {
  try {
    const departmentLoad = await Appointment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $group: {
          _id: '$doctor.specialization',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formattedDeptLoad = departmentLoad.map(dl => ({
      department: dl._id || 'General Consultation',
      count: dl.count
    }));

    res.status(200).json({ success: true, data: formattedDeptLoad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
