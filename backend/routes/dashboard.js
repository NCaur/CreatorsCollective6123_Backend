const express = require('express');
const router = express.Router();
const Project = require('../models/project.model');
const Task = require('../models/task.model');

// Route to get project overview data
router.get('/projects/overview/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const projectOverview = await Project.aggregate([
      {
        $match: {
          adminId: userId,
        },
      },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          inProgressProjects: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          totalTasks: { $sum: '$totalTasks' }, // Adjust this according to your project schema
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          totalHours: { $sum: '$hoursWorked' }, // Adjust this according to your project schema
          totalCost: { $sum: '$totalCost' }, // Adjust this according to your project schema
        },
      },
    ]);

    // Send the project overview data as the response
    res.json(projectOverview[0] || {});
  } catch (error) {
    console.log('Error fetching project overview:', error);
    res.status(500).json({ error: 'Error fetching project overview' });
  }
});

// Similar route for tasks overview

module.exports = router;
