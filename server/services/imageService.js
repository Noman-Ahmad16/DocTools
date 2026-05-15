const express = require('express');
const cors = require('cors');
const imageRoutes = require('../routes/imageRoutes');

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());
app.use('/api/image', imageRoutes);

app.listen(PORT, () => {
  console.log(`Image Service running on http://localhost:${PORT}`);
});
