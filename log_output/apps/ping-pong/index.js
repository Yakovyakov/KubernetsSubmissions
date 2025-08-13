const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3002;
const COUNTER_FILE = process.env.COUNTER_FILE_PATH || path.join(__dirname, 'shared-data', 'count.txt');

if (!fs.existsSync(COUNTER_FILE)) {
  fs.writeFileSync(COUNTER_FILE, '0');
}

let counter = parseInt(fs.readFileSync(COUNTER_FILE, 'utf-8'));

// Endpoint that responds with incrementing counter

app.get('/pingpong', (req, res) => {
  counter++;
  fs.writeFileSync(COUNTER_FILE, counter.toString())
  res.send(`pong ${counter}`);
});

app.listen(PORT, () => {
  console.log(`Ping-pong service started on port ${PORT}`);
});
