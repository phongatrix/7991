// ╔══════════════════════════════════════════════════════════════╗
// ║  CV 7991 – Backend API Server (Express + WebSocket)          ║
// ║  Entry point: node server.js                                 ║
// ╚══════════════════════════════════════════════════════════════╝

'use strict';

require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const compression   = require('compression');
const morgan        = require('morgan');
const http          = require('http');
const { WebSocketServer } = require('ws');
const swaggerUi     = require('swagger-ui-express');
const path          = require('path');

const logger        = require('./utils/logger');
const { swaggerSpec } = require('./config/swagger');
const { connectDB } = require('./database/connection');
const { connectRedis } = require('./config/redis');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { rateLimiter, uploadLimiter } = require('./middleware/rateLimiter');

// ── Route imports ──────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const documentRoutes  = require('./routes/documents');
const matrixRoutes    = require('./routes/matrices');
const questionRoutes  = require('./routes/questions');
const examRoutes      = require('./routes/exams');
const aiRoutes        = require('./routes/ai');
const questionBankRoutes = require('./routes/questionBank');

// ── App setup ──────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 4000;
const ENV  = process.env.NODE_ENV || 'development';

// ══════════════════════════════════════════════════════════════
// GLOBAL MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8991'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-ID'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// HTTP logging
app.use(morgan(ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: msg => logger.http(msg.trim()) },
}));

// Request ID
app.use((req, _, next) => {
  req.id = require('uuid').v4();
  next();
});

// Rate limiting
app.use('/api/', rateLimiter);

// ══════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cv7991-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: ENV,
  });
});

// API v1
const API = '/api/v1';
app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/documents`,     documentRoutes);
app.use(`${API}/matrices`,      matrixRoutes);
app.use(`${API}/questions`,     questionRoutes);
app.use(`${API}/exams`,         examRoutes);
app.use(`${API}/ai`,            aiRoutes);
app.use(`${API}/question-banks`,questionBankRoutes);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CV 7991 API Documentation',
}));
app.get('/api/openapi.json', (req, res) => res.json(swaggerSpec));

// Static uploads (dev only)
if (ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Serve Frontend Web App
const frontendDir = path.join(__dirname, '..');
app.use(express.static(frontendDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// ══════════════════════════════════════════════════════════════
// WEBSOCKET – Real-time progress tracking
// ══════════════════════════════════════════════════════════════

const wsClients = new Map(); // jobId → Set<ws>

wss.on('connection', (ws, req) => {
  const url    = new URL(req.url, `http://${req.headers.host}`);
  const jobId  = url.searchParams.get('jobId');
  const token  = url.searchParams.get('token');

  logger.info(`WS connected: jobId=${jobId}`);

  if (jobId) {
    if (!wsClients.has(jobId)) wsClients.set(jobId, new Set());
    wsClients.get(jobId).add(ws);
  }

  ws.on('close', () => {
    if (jobId && wsClients.has(jobId)) {
      wsClients.get(jobId).delete(ws);
      if (wsClients.get(jobId).size === 0) wsClients.delete(jobId);
    }
    logger.debug(`WS disconnected: jobId=${jobId}`);
  });

  ws.on('error', err => logger.error(`WS error: ${err.message}`));

  // Heartbeat
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
});

// Broadcast progress to all clients subscribed to a job
function broadcastProgress(jobId, data) {
  const clients = wsClients.get(jobId);
  if (!clients) return;
  const msg = JSON.stringify({ type: 'progress', jobId, ...data, ts: Date.now() });
  clients.forEach(ws => {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  });
}

// Heartbeat ping every 30s
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30_000);

wss.on('close', () => clearInterval(heartbeatInterval));

// Make broadcastProgress available app-wide
app.locals.broadcastProgress = broadcastProgress;
global.broadcastProgress = broadcastProgress;  // for use in services

// ══════════════════════════════════════════════════════════════
// STARTUP
// ══════════════════════════════════════════════════════════════

async function start() {
  try {
    // Connect databases
    await connectDB();
    logger.info('✓ PostgreSQL connected');

    await connectRedis();
    logger.info('✓ Redis connected');

    // Start server
    server.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════╗
║  CV 7991 Backend API – Running           ║
║  Port:    ${PORT}                             ║
║  Mode:    ${ENV.padEnd(10)}                   ║
║  Docs:    http://localhost:${PORT}/api/docs    ║
║  WS:      ws://localhost:${PORT}/ws           ║
╚═══════════════════════════════════════════╝`);
    });
  } catch (err) {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

start();

module.exports = { app, server };
