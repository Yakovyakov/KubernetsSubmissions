const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 8080;
const LOG_FILE = process.env.LOG_FILE_PATH || path.join(__dirname, 'shared-logs', 'output.log');


// Endpoints
// status
app.get('/status', (req, res) => {

  try{
    const content = fs.readFileSync(LOG_FILE, 'utf8').trim();
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return res.type('text/plain').send('No log entries yet');

    const lastEntry = JSON.parse(lines[lines.length - 1]);

    res.type('text/plain').send(
      `file content: ${lastEntry.fileContent}\n` +
      `env variable: MESSAGE=${lastEntry.message}\n` +
      `${lastEntry.timestamp}: ${lastEntry.uuid}\n` +
      `Ping / Pongs: ${lastEntry.pings}\n`
    );
  } catch (err) {
    res.status(500).send('Error reading log');
  }
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
