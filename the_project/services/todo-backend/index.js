const express = require('express');

const { v4: uuidv4 } = require('uuid');

// hardencoded todos
const todos = [
  {id: uuidv4(), text: 'Learn JavaScript', done: false },
  {id: uuidv4(), text: 'Learn React', done: false },
  {id: uuidv4(), text: 'Learn Kubernetes', done: false },
  {id: uuidv4(), text: 'Build project', done: false },
];

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
// Routes
app.get('/todos', async (req, res) => {
  res.json(todos);
});

app.post('/todos', async (req, res) => {

  if (!req.body || typeof req.body !== 'object') {
    console.error('ERROR: Invalid request body');
    return res.status(400).json({ error: 'Invalid request body' });

  }

  const { text = '', done = false} = req.body;

  if (!text || text.trim() === '') {
    console.error('ERROR: Validation failed - Text is required');
    console.error('Request body:', req.body);
    return res.status(400).json({ error: 'Text is required' });
  }

  if (text.length > 140){
    console.error('ERROR: Validation failed - Text must be 140 characters or less');
    console.error(`Received ${text.length} characters, "${text.substring(0, 50)}..."`);
    return res.status(400).json({ error: 'Text must be 140 characters or less'});
  }

  const newTodo = {
    id: uuidv4(),
    text: text,
    done: false
  };

  todos.push(newTodo);

  res.status(201).json(newTodo);
});


app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found'});
})
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));