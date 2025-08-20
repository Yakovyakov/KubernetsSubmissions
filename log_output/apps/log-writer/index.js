const fs = require('fs');
const path = require('path');
const axios = require('axios')

const LOG_FILE = process.env.LOG_FILE_PATH || path.join(__dirname, 'shared-logs', 'output.log');

//const COUNTER_FILE = process.env.COUNTER_FILE_PATH || path.join(__dirname, 'shared-data', 'count.txt');

const url = process.env.PING_SERVER_URL ? `${process.env.PING_SERVER_URL}/pings` : 'http://localhost/pings';

function generateUUID() {
  return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const randomHash = generateUUID();

if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '');
}

async function getPings() {
  try {
    const response = await axios.get(url);
    return response.data.pings;
  } catch (error) {
    console.error('Error fetching counter from ping-pong:', error.message);
    return 0;
  }
}
const writeLog = async () => {
  const timestamp = new Date().toISOString();
  let counter = 0;
  counter = await getPings();
  
  const logLine = `${timestamp}: ${randomHash}. Ping / Pongs: ${counter}\n`;

  fs.appendFile(LOG_FILE, logLine, (err) => {
    if (err) {
      console.error('[Error]:', err);
    } else {
      console.log(logLine.trim());
    }
  });

  setTimeout(writeLog, 5000);
}

writeLog();

