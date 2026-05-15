const express = require('express');
const cors = require('cors');
const adminRoutes = require('../routes/adminRoutes');

const app = express();
const PORT = 5004;

app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Admin Service running on http://localhost:${PORT}`);
});
