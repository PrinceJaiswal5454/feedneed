/**
 * VolunteerApplication Mongoose Model
 * Connects individual volunteers with NGO campaigns and volunteer drives.
 */
const mongoose = require('mongoose');

const volunteerApplicationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGOCampaign',
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    preferredRole: {
      type: String,
      required: [true, 'Please select a volunteer role'],
    },
    availability: {
      type: String,
      required: [true, 'Please specify your available days and hours'],
    },
    hasVehicle: {
      type: Boolean,
      default: false,
    },
    experienceNote: {
      type: String,
      required: [true, 'Please briefly share how you can help'],
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed', 'Declined'],
      default: 'Pending',
    },
    hoursContributed: {
      type: Number,
      default: 0,
    },
    ngoResponseNote: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VolunteerApplication', volunteerApplicationSchema);
