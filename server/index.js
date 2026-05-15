const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pdfRoutes = require('./routes/pdfRoutes');
const imageRoutes = require('./routes/imageRoutes');
const documentRoutes = require('./routes/documentRoutes');
const wordRoutes = require('./routes/wordRoutes');
const excelRoutes = require('./routes/excelRoutes');
const pptRoutes = require('./routes/pptRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/word', wordRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/ppt', pptRoutes);
app.use('/api/admin', adminRoutes);

// Automatic File Cleanup (every 10 minutes)
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const ONE_HOUR = 60 * 60 * 1000;

const cleanupFiles = () => {
  if (!fs.existsSync(UPLOADS_DIR)) return;
  
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) return console.error('Error reading uploads directory:', err);
    
    const now = Date.now();
    files.forEach(file => {
      // Skip .gitkeep or other hidden files if any
      if (file.startsWith('.')) return;
      
      const filePath = path.join(UPLOADS_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error('Error stating file:', err);
        
        if (now - stats.mtimeMs > ONE_HOUR) {
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting old file:', err);
            else console.log(`Deleted old file: ${file}`);
          });
        }
      });
    });
  });
};

setInterval(cleanupFiles, 10 * 60 * 1000);

// Basic route
app.get('/', (req, res) => {
  res.send('DocTools API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
