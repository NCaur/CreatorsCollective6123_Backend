const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001; // Automatically assign an available port

app.use(express.json({ limit: '10mb' }));

// Middleware
app.use(cors());
app.use(express.json());

const ATLAS_URI = process.env.ATLAS_URI;
mongoose.connect(ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error.message);
  });


app.get('/api/data', (req, res) => {
  res.send('Hello, this is your server response!');
});

const usersRouter = require('./routes/user');
app.use('/user', usersRouter);

const projectRoutes = require('./routes/project');
app.use('/api', projectRoutes);

const taskRoutes = require('./routes/task');
app.use('/task', taskRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

