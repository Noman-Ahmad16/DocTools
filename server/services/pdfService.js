const express = require('express');
const cors = require('cors');
const pdfRoutes = require('../routes/pdfRoutes');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use('/api/pdf', pdfRoutes);

app.listen(PORT, () => {
  console.log(`PDF Service running on http://localhost:${PORT}`);
});
