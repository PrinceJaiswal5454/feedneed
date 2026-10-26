/**
 * Authentication & Profile Controller
 * Handles user registration, login, current user lookup, and profile updates.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RewardTransaction = require('../models/RewardTransaction');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user (Individual, NGO, or Admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      city,
      neighborhood,
      exactAddress,
      phone,
      contactPreference,
      organizationName,
      registrationNumber,
      beneficiaryFocus,
      operatingHours,
      bio,
    } = req.body;

    if (!name || !email || !password || !city || !neighborhood) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Name, Email, Password, City, Neighborhood).',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const allowedRoles = ['individual', 'ngo', 'admin'];
    const safeRole = allowedRoles.includes(role) ? role : 'individual';

    const ngoDetails =
      safeRole === 'ngo'
        ? {
            organizationName: organizationName || name,
            registrationNumber: registrationNumber || 'PENDING-REG',
            verificationStatus: 'pending',
            beneficiaryFocus: beneficiaryFocus || 'Community Hunger Relief',
            operatingHours: operatingHours || '9:00 AM - 7:00 PM',
          }
        : undefined;

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      city,
      neighborhood,
      exactAddress: exactAddress || '',
      phone: phone || '',
      contactPreference: contactPreference || 'approval_only',
      bio: bio || '',
      ngoDetails,
      badges: [
        {
          code: 'WELCOME_MEMBER',
          name: 'FeedNeed Member',
          icon: '🌿',
          description: 'Joined the FeedNeed food-sharing community.',
        },
      ],
    });

    const token = generateToken(user._id);
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message:
        safeRole === 'ngo'
          ? 'NGO account registered! Your verification badge is pending admin review.'
          : 'Account created! Welcome to FeedNeed.',
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended by an administrator.',
      });
    }

    const token = generateToken(user._id);
    const safeUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: `Welcome back, ${safeUser.name}!`,
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile & reward history
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const recentRewards = await RewardTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      success: true,
      user,
      recentRewards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & privacy settings
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const {
      name,
      bio,
      city,
      neighborhood,
      exactAddress,
      phone,
      contactPreference,
      showPhoneOnApproval,
      organizationName,
      registrationNumber,
      beneficiaryFocus,
      operatingHours,
      website,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (city !== undefined) user.city = city;
    if (neighborhood !== undefined) user.neighborhood = neighborhood;
    if (exactAddress !== undefined) user.exactAddress = exactAddress;
    if (phone !== undefined) user.phone = phone;
    if (contactPreference !== undefined) user.contactPreference = contactPreference;
    if (showPhoneOnApproval !== undefined) user.showPhoneOnApproval = showPhoneOnApproval;

    if (user.role === 'ngo') {
      user.ngoDetails = {
        ...user.ngoDetails,
        organizationName: organizationName ?? user.ngoDetails.organizationName,
        registrationNumber: registrationNumber ?? user.ngoDetails.registrationNumber,
        beneficiaryFocus: beneficiaryFocus ?? user.ngoDetails.beneficiaryFocus,
        operatingHours: operatingHours ?? user.ngoDetails.operatingHours,
        website: website ?? user.ngoDetails.website,
      };
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile and privacy preferences updated.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
};
