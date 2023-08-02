const express = require('express');
const router = express.Router();
const Project = require('../models/project.model');
const User = require('../models/user.model');
const Task = require('../models/task.model');

// Create Project (Only accessible by Admin)
router.post('/', async (req, res) => {
  const { userId, isAdmin, title } = req.body;
  try {
    // Check if the user is an admin
    if (!isAdmin) {
      return res.status(401).json({ error: 'Only admin can create projects' });
    }

    // Create a new project
    const project = new Project({
      title,
      status: 'Not Started',
      totalHours: 0,
      totalCost: 0,
      adminId: userId,
      members: [],
    });

    const response = await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get All Projects (Admin and Regular Users can access their assigned projects)
// router.get('/', async (req, res) => {
//   const { userId, isAdmin } = req.query;
//   try {
//     // Check if the user is an admin
//     if (isAdmin) {
//       // If admin, fetch all projects for that admin
//       const projects = await Project.find({ adminId: userId });
//       res.json(projects);
//     } else {
//       // If regular user, fetch projects for which the userId is included in members array
//       const projects = await Project.find({ members: userId });
//       res.json(projects);
//     }
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ error: 'Server Error' });
//   }
// });

router.get('/', async (req, res) => {
  const { userId, isAdmin } = req.query;

  try {
    // Define the JavaScript method
    const getProjectDetails = async (adminId) => {
      try {
        const projects = await Project.find({ adminId });
        const result = [];

        for (const project of projects) {
          const adminUser = await User.findById(project.adminId);
          const completedByUser = await User.findById(project.completedByUserId);
          //console.log("completedByUser", completedByUser)
          const tasks = await Task.find({ projectId: project._id });
          const inProgressTasks = await Task.countDocuments({ projectId: project._id, status: { $ne: 'Completed' } });
          const completedTasks = await Task.countDocuments({ projectId: project._id, status: 'Completed' });

          const totalTasks = tasks.length;
          const totalHours = tasks.reduce((acc, task) => acc + task.hoursWorked, 0);
          const totalCost = tasks.reduce((acc, task) => acc + task.totalCost, 0);

          result.push({
            _id: project._id,
            title: project.title,
            email: adminUser.email,
            completedBy: completedByUser == null ? "" : completedByUser.email,
            totalTasks,
            totalHours,
            totalCost,
            noofinprogressTasks: inProgressTasks,
            noofcompletedTasks: completedTasks,
          });
        }

        return result;
      } catch (error) {
        console.error('Error fetching project details:', error);
        throw error;
      }
    };

    // Example usage:
    const adminId = userId;
    // console.log("adminId", adminId);
    getProjectDetails(adminId)
      .then((result) => {
        res.json(result);
      })
      .catch((error) => {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
      });

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get Project Summary Data (Only accessible by Admin)
router.get('/summary', async (req, res) => {
  const { userId, isAdmin } = req.query;
  try {
    // Assuming you have two arrays: projects and tasks
    // Replace this with your actual data
    const projects = await Project.find({ adminId: userId });
    const tasks = await Task.find({ createdByUserId: userId });

    const getSummaryData = () => {
      // Helper function to count projects and tasks based on status
      const countByStatus = (items, status) => items.filter((item) => item.status === status).length;

      // Helper function to sum a property in an array of objects
      const sumProperty = (items, property) => items.reduce((acc, item) => acc + item[property], 0);

      const totalProjects = projects.length;
      const completedProjects = countByStatus(projects, 'Completed');
      const inProgressProjects = countByStatus(projects, 'In Progress');
      const totalTasks = tasks.length;
      const completedTasks = countByStatus(tasks, 'Completed');
      const inProgressTasks = countByStatus(tasks, 'In Progress');
      const totalHours = sumProperty(tasks, 'hoursWorked');
      const totalCost = sumProperty(tasks, 'totalCost');

      return {
        totalProjects,
        completedProjects,
        inProgressProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        totalHours,
        totalCost,
      };
    };

    const summaryData = getSummaryData();
    res.json(summaryData);

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server Error' });
  }
});


// Get Project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server Error' });
  }
});

// Mark Project as Complete (Only accessible by Admin)
router.put('/:projectId/complete', async (req, res) => {
  const { userId, isAdmin } = req.body;
  try {
    // Check if the user is an admin
    if (!isAdmin) {
      return res.status(401).json({ error: 'Only admin can mark projects as complete' });
    }

    const projectId = req.params.projectId;

    // Fetch project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Mark the project as complete and update status and other details
    project.status = 'Completed';
    project.completedDateTime = new Date();
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get Running Late Tasks (Only accessible by Admin)
router.get('/:projectId/running-late-tasks', async (req, res) => {
  const { userId, isAdmin } = req.body;
  try {
    // Check if the user is an admin
    if (!isAdmin) {
      return res.status(401).json({ error: 'Only admin can access running late tasks' });
    }

    const projectId = req.params.projectId;

    // Fetch all tasks of the project that are running late (based on endDate)
    const runningLateTasks = await Task.find({
      projectId,
      endDate: { $lt: new Date() },
      status: { $ne: 'Completed' },
    });

    res.json(runningLateTasks);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.delete('/:projectId', async(req, res) => {
  const {projectId} = req.params;
  try {
    await Project.findByIdAndRemove({_id:projectId})
    res.send("Success")
    
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server Error' });
  }
})

module.exports = router;
