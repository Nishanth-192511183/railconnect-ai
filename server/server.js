require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { logger } = require('./utils/timeUtils');

// Routes
const authRoutes = require('./routes/auth');
const journeyRoutes = require('./routes/journey');
const trainRoutes = require('./routes/trains');
const riskRoutes = require('./routes/risk');
const recoveryRoutes = require('./routes/recovery');
const hospitalityRoutes = require('./routes/hospitality');
const aiRoutes = require('./routes/ai');

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
| Allows the deployed Vercel frontend to communicate with Railway.
| CORS_ORIGIN should be:
|
| https://railconnect-ai-7txj.vercel.app
|
| No /api at the end.
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://railconnect-ai-7txj.vercel.app',
  'https://railconnect-ai-7txj-git-main-railconnect-ai.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // (Postman, curl, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  })
);

/*
|--------------------------------------------------------------------------
| BODY PARSING
|--------------------------------------------------------------------------
| IMPORTANT:
| This must come BEFORE the API routes.
|
| The frontend sends:
| Content-Type: application/json
|
| Without express.json(), req.body can be undefined.
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  logger('REQUEST', `${req.method} ${req.originalUrl}`);

  next();
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'RailConnect AI Backend'
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/hospitality', hospitalityRoutes);
app.use('/api/ai', aiRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/*
|--------------------------------------------------------------------------
| Central Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error('[ERROR FULL]', err);
  console.error('[ERROR MESSAGE]', err?.message);
  console.error('[ERROR STACK]', err?.stack);

  logger('ERROR', err?.message || String(err));

  res.status(err.status || 500).json({
    success: false,
    message: err?.message || 'Internal server error',
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger(
    'SERVER',
    `RailConnect AI backend running on port ${PORT}`
  );
});

module.exports = app;