const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.use(express.static('public'));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const users = {};
const exercises = {};

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const userId = new Date().toISOString();
  users[userId] = { username, _id: userId };
  exercises[userId] = [];

  res.json({ username, _id: userId });
});

// Add an exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  if (!users[userId]) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
  const newExercise = { description, duration: Number(duration), date: exerciseDate };
  exercises[userId].push(newExercise);

  res.json({
    username: users[userId].username,
    description,
    duration: Number(duration),
    date: exerciseDate,
    _id: userId
  });
});

// Get a list of all users
app.get('/api/users', (req, res) => {
  const userList = Object.values(users);
  res.json(userList);
});

// Get user exercises
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  if (!users[userId]) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises[userId] || [];

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit, 10));
  }

  res.json({
    username: users[userId].username,
    count: userExercises.length,
    _id: userId,
    log: userExercises.map(ex => ({
      ...ex,
      duration: Number(ex.duration)  // Ensure duration is a number
    }))
  });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
