const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 8080;
const LOG_FILE = process.env.LOG_FILE_PATH || path.join(__dirname, 'shared-logs', 'output.log');


// Endpoint /logs
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
