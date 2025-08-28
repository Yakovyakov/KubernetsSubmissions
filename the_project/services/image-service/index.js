const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require ('path');
const cors = require ('cors');
const { createHash } =  require('crypto');
const lockfile = require('lockfile');

const app = express();
const PORT = process.env.PORT || 3001;
const CACHE_TIME = process.env.CACHE_TIME || 10 * 60 * 1000; // 10 min
const API_IMAGE_URL = process.env.API_IMAGE_URL || 'https://picsum.photos/1200'
const IMAGE_DIR = process.env.IMAGE_DIR || __dirname;
const IMAGE_PATH = path.join(IMAGE_DIR, 'current_image.jpg');
const TEMP_IMAGE_PATH = path.join(IMAGE_DIR, 'temp_image.jpg');
const LOCK_FILE = path.join(IMAGE_DIR, 'image.lock');

// Lock config
const LOCK_OPTS = {
  wait: 5000,
  pollPeriod: 100
};

// Helper image hash
function fileHash(content) {
  return createHash('sha256').update(content).digest('hex');
}

// Function: secure get image
async function getImageWithLock() {
  try {
    
    await new Promise((resolve, reject) => {
      lockfile.lock(LOCK_FILE, LOCK_OPTS, (err) => {
        err ? reject(err) : resolve();
      });
    });
    
    if (fs.existsSync(IMAGE_PATH)) {
      const stats = fs.statSync(IMAGE_PATH);
      if ((Date.now() - stats.mtimeMs) < CACHE_TIME) {
        const image = fs.readFileSync(IMAGE_PATH);
        return { image, hash: fileHash(image) };
      }
    }
    
    const response = await axios.get(API_IMAGE_URL, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    if (!response.data || response.data.length < 1024) {
      throw new Error('Invalid image data');
    }

    fs.writeFileSync(TEMP_IMAGE_PATH, response.data);
    
    const tempContent = fs.readFileSync(TEMP_IMAGE_PATH);
    if (fileHash(tempContent) !== fileHash(response.data)) {
      throw new Error('File write verification failed');
    }

    
    fs.renameSync(TEMP_IMAGE_PATH, IMAGE_PATH);
    
    return { image: response.data, hash: fileHash(response.data) };
  } catch (error) {
    console.error('Error in image download:', error);
    
    // Fallback a imagen existente
    if (fs.existsSync(IMAGE_PATH)) {
      const image = fs.readFileSync(IMAGE_PATH);
      return { image, hash: fileHash(image), isFallback: true };
    }
    throw error;
  } finally {
    
    lockfile.unlockSync(LOCK_FILE);
  }
}

// Routes
app.get('/random-image', async (req, res) => {
  try {
    const { image, hash, isFallback } = await getImageWithLock();
    
    res.set({
      'Content-Type': 'image/jpeg',
      'X-Image-Hash': hash,
      ...(isFallback && { 'X-Image-Fallback': 'true' })
    });
    
    res.send(image);
  } catch (error) {
    console.error('Failed to serve image:', error);
    res.status(500).send('Image service unavailable');
  }
});

app.get('/simulate-crash', async (req, res) => {
  console.log('simulating crash...');
  process.exit(1);
});

// initialization
function ensureStorage() {
  try {
    if (!fs.existsSync(IMAGE_DIR)) {
      fs.mkdirSync(IMAGE_DIR, { recursive: true });
    }
    // if not exist then download
    if (!fs.existsSync(IMAGE_PATH)) {
      getImageWithLock().catch(console.error);
    }
  } catch (err) {
    console.error('Storage initialization failed:', err);
    process.exit(1);
  }
}

ensureStorage();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));