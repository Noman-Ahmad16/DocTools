const express = require('express');
const cors = require('cors');
const wordRoutes = require('../routes/wordRoutes');
const excelRoutes = require('../routes/excelRoutes');
const pptRoutes = require('../routes/pptRoutes');
const documentRoutes = require('../routes/documentRoutes');

const app = express();
const PORT = 5003;

app.use(cors());
app.use(express.json());

app.use('/api/word', wordRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/ppt', pptRoutes);
app.use('/api/document', documentRoutes);

app.listen(PORT, () => {
  console.log(`Office Service running on http://localhost:${PORT}`);
});
