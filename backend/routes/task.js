const express = require('express');
const router = express.Router();
const Task = require('../models/task.model');
const Project = require('../models/project.model');
const User = require('../models/user.model');
const { route } = require('./project');
const mongoose = require('mongoose');


// Create Task
router.post('/', async (req, res) => {
  console.log("this one hitsdsdasd", req)

  try {
    console.log("req.body", req.body)
    const { title, description, projectId, startDate, endDate, assignedTo, hourlyRate, createdByUserId, dependencyTaskId } = req.body;

    // Create a new task
    const task = new Task({
      title,
      description,
      projectId,
      startDate,
      endDate,
      createdByUserId,
      assignedToUserId: assignedTo,
      status: 'Not Started',
      hourlyRate,
      hoursWorked: 0,
      totalCost: 0,
      dependencyTaskId: dependencyTaskId || null,
    });

    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server Error' });
  }
});

//add test route
router.get('/', async (req, res) => {
  try {
    // Assuming you have an array of tasks objects
    // Replace this with your actual data
    const tasks = await Task.find({}).populate('dependencyTaskId', 'status');

    const getTaskSummaryData = (assignedToUserId) => {
      // Helper function to count tasks based on status
      const countByStatus = (items, status) => items.filter((item) => item.status === status).length;

      // Helper function to sum a property in an array of objects
      const sumProperty = (items, property) => items.reduce((acc, item) => acc + item[property], 0);

      // Filter tasks based on assignedToUserId
      const filteredTasks = tasks.filter((task) => task.assignedToUserId.equals(assignedToUserId));

      const totalTasks = filteredTasks.length;
      const completedTasks = countByStatus(filteredTasks, 'Completed');
      const inProgressTasks = countByStatus(filteredTasks, 'In Progress');
      const totalHours = sumProperty(filteredTasks, 'hoursWorked');
      const totalCost = sumProperty(filteredTasks, 'totalCost');

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        totalHours,
        totalCost,
        filteredTasks
      };
    };

    // Replace assignedToUserId with the user ID you want to filter
    //console.log("req.params.userId", req)
    const assignedToUserId = req.query.userId;
    const taskSummaryData = getTaskSummaryData(assignedToUserId);
    console.log("taskSummaryData", taskSummaryData)
    res.json(taskSummaryData);
  } catch (error) {
    console.log("sdfsdfsfsdfsdfsdfsdfsaffasdfads", error)
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get All Tasks for a Project
router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  // Define the JavaScript method
  const getTasksWithDetails = async (projectId) => {
    try {
      const tasks = await Task.find({ projectId })
        .populate('dependencyTaskId', 'title status')
        .populate('projectId', 'id title')
        .populate('assignedToUserId', 'email')
        .populate('completedByUserId', 'email');

      // console.log("tassdsdasdasdasdks", tasks)
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks with details:', error);
      throw error;
    }
  };

  getTasksWithDetails(projectId)
    .then((tasks) => {
      console.log("tasks", tasks)
      res.json(tasks);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    });



  // try {
  //   const { projectId } = req.params;

  //   // Fetch all tasks for the given project ID
  //   const tasks = await Task.find({ projectId });

  //   res.json(tasks);
  // } catch (error) {
  //   res.status(500).json({ error: 'Server Error' });
  // }
});
// router.get('/:projectId', async (req, res) => {
//   console.log("this one hit")
//   const { projectId } = req.params;
//   console.log("projectId", projectId)

//   // Define the JavaScript method
//   const fetchTasksWithDetails = async (projectId) => {
//     try {
//       const tasks = await Task.find({ projectId })
//         .populate({
//           path: 'dependencyTaskId',
//           select: 'id title status'
//         })
//         .populate({
//           path: 'projectId',
//           select: 'id title'
//         })
//         .populate({
//           path: 'assignedToUserId',
//           select: 'email' // Fetch only the email of the assigned user
//         })
//         .populate({
//           path: 'completedByUserId',
//           select: 'email'
//         });

//       // Extract the unique user ids from the tasks to fetch user details
//       const userIds = tasks.reduce((acc, task) => {
//         if (task.assignedToUserId) acc.add(task.assignedToUserId);
//         if (task.completedByUserId) acc.add(task.completedByUserId);
//         return acc;
//       }, new Set());
//       console.log("userIds", userIds)
//       // Convert the Set of user ids to an array
//       const uniqueUserIds = Array.from(userIds);
//       console.log("uniqueUserIds", uniqueUserIds)
//       // Fetch user details for the unique user ids
//       const users = await User.find({ _id: { $in: uniqueUserIds } });
//       console.log("users", users)
//       // Create a map to quickly access user details by user id
//       const userMap = users.reduce((map, user) => {
//         map[user._id.toString()] = user;
//         return map;
//       }, {});

//       const formattedTasks = tasks.map((task) => {
//         console.log("task", task);
//         return {
//           id: task._id.toString(),
//           title: task.title,
//           projectid: task.projectId._id,
//           project: task.projectId.title,
//           deptaskid: task.dependencyTaskId || null, // Use the full object
//           deptaskstatus: task.dependencyTaskId?.status || null,
//           assignedTo: task.assignedToUserId ? userMap[task.assignedToUserId.toString()].email : null, // Include the email of the assigned user if available
//           status: task.status,
//           hourlyrate: task.hourlyRate,
//           hoursworked: task.hoursWorked,
//           cost: task.totalCost,
//           startDate: new Date(task.startDate).toLocaleDateString(),
//           endDate: new Date(task.endDate).toLocaleDateString(),
//           createdByUserId: task.createdByUserId,
//           completedByUserId: task.completedByUserId ? userMap[task.completedByUserId.toString()].email : null, // Use the full object
//           completedDateTime: task.completedDateTime,
//         };
//       });

//       return formattedTasks;
//     } catch (error) {
//       console.error('Error fetching tasks with details:', error);
//       throw error;
//     }
//   };



//   fetchTasksWithDetails(projectId)
//     .then((tasks) => {
//       console.log("tasks", tasks)
//       res.json(tasks);
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).json({ error: 'Server Error' });
//     });
// });


//get Task by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId", userId)
    // Fetch all tasks for the given userId
    const tasks = await Task.find({ assignedToUserId: userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Mark Task as Complete
router.put('/complete/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    // Fetch task by ID
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if the task is already completed
    if (task.status === 'Completed') {
      return res.status(400).json({ error: 'Task is already marked as complete' });
    }

    // Mark the task as complete and update status and other details
    task.status = 'Completed';
    task.completedByUserId = userId;
    task.completedDateTime = new Date();
    await task.save();

    res.json(task);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server Error' });
  }
});

// Update Task Hours Worked
router.put('/hours-worked/:taskId', async (req, res) => {
  try {
    console.log("req.body", req.body)
    const { taskId } = req.params;
    const { hoursWorked } = req.body;

    // Fetch task by ID
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update the hours worked for the task
    task.hoursWorked = hoursWorked;
    task.totalCost = task.hourlyRate * hoursWorked;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});




module.exports = router;
