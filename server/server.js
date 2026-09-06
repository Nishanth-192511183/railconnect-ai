require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { logger } = require('./utils/timeUtils');

const authRoutes = require('./routes/auth');
const journeyRoutes = require('./routes/journey');
const trainRoutes = require('./routes/trains');
const riskRoutes = require('./routes/risk');
const recoveryRoutes = require('./routes/recovery');
const hospitalityRoutes = require('./routes/hospitality');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://railconnect-ai-7txj.vercel.app'
}));

// simple request logger
app.use((req, res, next) => {
  logger('REQUEST', `${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'RailConnect AI Backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/hospitality', hospitalityRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler - never leak stack traces
app.use((err, req, res, next) => {
  logger('ERROR', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.publicMessage || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger('SERVER', `RailConnect AI backend running on http://localhost:${PORT}`);
});

module.exports = app;
