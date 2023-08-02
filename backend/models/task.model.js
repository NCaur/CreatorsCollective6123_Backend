const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the Mongoose schema and model for the Task
const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  dependencyTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    //required: true,
  },
  createdByUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedToUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completedByUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  completedDateTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
    required: true,
  },
  hourlyRate: {
    type: Number,
    required: true,
  },
  hoursWorked: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
  },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
