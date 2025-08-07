const express = require('express');

const app = express();
let counter = 0;
const PORT = process.env.PORT || 8081;

// Endpoint that responds with incrementing counter
app.get('/pingpong', (req, res) => {
  res.send(`pong ${counter++}`);
});

app.listen(PORT, () => {
  console.log(`Ping-pong service started on port ${PORT}`);
});
