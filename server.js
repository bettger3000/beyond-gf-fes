const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './assets/shops/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.static('.'));

// API endpoint to get shops data
app.get('/api/shops', async (req, res) => {
  try {
    const data = await fs.readFile('./shops.json', 'utf8');
    const shops = JSON.parse(data);
    res.json(shops);
  } catch (error) {
    console.error('Error reading shops.json:', error);
    res.status(500).json({ error: 'Failed to read shops data' });
  }
});

// API endpoint to save shops data
app.post('/api/shops', async (req, res) => {
  try {
    const shops = req.body;
    
    // Validate that it's an array
    if (!Array.isArray(shops)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }

    // Create backup of current file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./shops-backup-${timestamp}.json`;
    
    try {
      const currentData = await fs.readFile('./shops.json', 'utf8');
      await fs.writeFile(backupPath, currentData, 'utf8');
      console.log(`Backup created: ${backupPath}`);
    } catch (backupError) {
      console.warn('Could not create backup:', backupError.message);
    }

    // Write new data to shops.json
    const jsonString = JSON.stringify(shops, null, 2);
    await fs.writeFile('./shops.json', jsonString, 'utf8');
    
    console.log(`Updated shops.json with ${shops.length} shops`);
    res.json({ success: true, message: `Successfully saved ${shops.length} shops` });
  } catch (error) {
    console.error('Error writing shops.json:', error);
    res.status(500).json({ error: 'Failed to save shops data' });
  }
});

// API endpoint to save individual shop
app.post('/api/shops/:id', async (req, res) => {
  try {
    const shopId = req.params.id;
    const updatedShop = req.body;
    
    // Read current shops data
    const data = await fs.readFile('./shops.json', 'utf8');
    let shops = JSON.parse(data);
    
    // Find and update the shop, or add new one
    const existingIndex = shops.findIndex(shop => shop.id === shopId);
    
    if (existingIndex !== -1) {
      shops[existingIndex] = updatedShop;
    } else {
      shops.push(updatedShop);
    }
    
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./shops-backup-${timestamp}.json`;
    await fs.writeFile(backupPath, data, 'utf8');
    
    // Save updated data
    const jsonString = JSON.stringify(shops, null, 2);
    await fs.writeFile('./shops.json', jsonString, 'utf8');
    
    console.log(`Updated shop ${shopId}`);
    res.json({ success: true, message: `Successfully updated shop ${shopId}` });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ error: 'Failed to update shop' });
  }
});

// API endpoint to delete a shop
app.delete('/api/shops/:id', async (req, res) => {
  try {
    const shopId = req.params.id;
    
    // Read current shops data
    const data = await fs.readFile('./shops.json', 'utf8');
    let shops = JSON.parse(data);
    
    // Filter out the shop to delete
    const initialCount = shops.length;
    shops = shops.filter(shop => shop.id !== shopId);
    
    if (shops.length === initialCount) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./shops-backup-${timestamp}.json`;
    await fs.writeFile(backupPath, data, 'utf8');
    
    // Save updated data
    const jsonString = JSON.stringify(shops, null, 2);
    await fs.writeFile('./shops.json', jsonString, 'utf8');
    
    console.log(`Deleted shop ${shopId}`);
    res.json({ success: true, message: `Successfully deleted shop ${shopId}` });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ error: 'Failed to delete shop' });
  }
});

// API endpoint for uploading images
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imagePath = `assets/shops/${req.file.filename}`;
    res.json({ 
      success: true, 
      imagePath: imagePath,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// API endpoint for uploading multiple images
app.post('/api/upload-images', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const imagePaths = req.files.map(file => `assets/shops/${file.filename}`);
    res.json({ 
      success: true, 
      imagePaths: imagePaths,
      filenames: req.files.map(file => file.filename)
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

app.listen(PORT, () => {
  console.log(`
🚀 Beyond GF Festival Server is running!
   
📍 Local server: http://localhost:${PORT}
📝 Admin panel: http://localhost:${PORT}/admin.html
🏪 Main site: http://localhost:${PORT}
   
The server will automatically save changes to shops.json
Press Ctrl+C to stop the server
  `);
});