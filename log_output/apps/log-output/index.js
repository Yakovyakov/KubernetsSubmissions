const express = require('express');

const app = express();

const PORT = process.env.PORT || 8080;

function generateUUID() {
  return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const randomHash = generateUUID();

// Endpoint /status
app.get('/status', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    randomString: randomHash
  });
});

const writeLog = () => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomHash}`);

  setTimeout(writeLog, 5000);
}

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  writeLog();
});
