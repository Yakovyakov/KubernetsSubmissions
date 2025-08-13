const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 8080;
const LOG_FILE = process.env.LOG_FILE_PATH || path.join(__dirname, 'shared-logs', 'output.log');


// Endpoints
// status
app.get('/status', (req, res) => {

  fs.readFile(LOG_FILE, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading log file');
    } else {
      const lines = data.split('\n').filter(line => line.trim('') !== '');
      const lastLine = lines.length > 0 ? lines[lines.length - 1] : 'Log file is empty';
      res.type('text/plain').send(lastLine);
    }
  });
});

// logs

app.get('/logs', (req, res) => {

  fs.readFile(LOG_FILE, 'utf-8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading log file');
    } else {
      res.type('text/plain').send(data || 'No logs yet');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server(log-reader) started on port ${PORT}`);
});
