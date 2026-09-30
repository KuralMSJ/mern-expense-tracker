const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const healthRoutes = require('./routes/health');
const transactionsRoutes = require('./routes/transactions');
const statsRoutes = require('./routes/stats');
const budgetsRoutes = require('./routes/budgets');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Finance Tracker API is running',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use(errorHandler);

connectDB();

app.listen(PORT);
