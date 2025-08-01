const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.end('TODO App will be implemented soon');
});

server.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
