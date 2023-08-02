const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get all projects for a specific user
router.get('/projects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({ adminId: userId });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add a new project
router.post('/projects', async (req, res) => {
  try {
    const { title, adminId } = req.body;
    const newProject = await Project.create({ title, adminId });
    res.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete a project
router.delete('/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    await Project.findByIdAndDelete(projectId);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
