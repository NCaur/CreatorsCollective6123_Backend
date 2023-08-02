const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  adminId: {
    type: mongoose.Types.ObjectId,
    ref: 'User', // Replace 'User' with the name of the user model if different
    required: true,
  },
  totalHours: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  members: [{
    type: mongoose.Types.ObjectId,
    ref: 'User', // Replace 'User' with the name of the user model if different
  }],
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
