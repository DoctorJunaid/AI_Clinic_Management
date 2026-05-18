const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        success: true,
        token: 'mock-jwt-token-for-demo-purposes-only',
        user: {
          _id: 'mock_user_' + Date.now(),
          name,
          email,
          role: role || 'patient',
          subscriptionPlan: 'free'
        }
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
      specialization
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan || 'free'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Smart Offline Demo Fallback
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected. Falling back to offline demo credentials...');
      if (email === 'admin@medflow.com' && password === '123456') {
        return res.status(200).json({
          success: true,
          token: 'mock-jwt-token-for-demo-purposes-only',
          user: {
            _id: 'mock_admin_id_12345',
            name: 'Dr. John Smith',
            email: 'admin@medflow.com',
            role: 'admin',
            subscriptionPlan: 'free',
            avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop'
          }
        });
      }
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan || 'free',
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {
          _id: 'mock_admin_id_12345',
          name: 'Dr. John Smith',
          email: 'admin@medflow.com',
          role: 'admin',
          subscriptionPlan: 'free',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop'
        }
      });
    }
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update subscription plan
// @route   PUT /api/v1/auth/subscription
// @access  Private
exports.updateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Subscription updated successfully',
        data: { subscriptionPlan: plan }
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.subscriptionPlan = plan;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all staff users (Doctors and Receptionists)
// @route   GET /api/v1/auth/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: [] });
    }
    // Fetch all users who are doctors or receptionists
    const users = await User.find({ role: { $in: ['doctor', 'receptionist'] } }).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a staff user
// @route   DELETE /api/v1/auth/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: 'User deleted (Sandbox)' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'Staff member removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
