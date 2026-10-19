/**
 * CV 7991 – Middleware Stack
 * auth.js + errorHandler.js + rateLimiter.js
 */

'use strict';

// ══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE  (auth.js)
// ══════════════════════════════════════════════════════════════

const jwt    = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET  = process.env.JWT_SECRET  || 'cv7991-dev-secret-change-in-production';
const JWT_REFRESH = process.env.JWT_REFRESH || 'cv7991-refresh-secret';

/**
 * authenticate – verifies JWT Bearer token
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Token xác thực không được cung cấp',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id:    payload.sub,
      email: payload.email,
      role:  payload.role,
      name:  payload.name,
    };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token đã hết hạn' : 'Token không hợp lệ';
    return res.status(401).json({
      success: false,
      error: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      message: msg,
    });
  }
}

/**
 * authorize – role-based access control
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Yêu cầu quyền: ${roles.join(' hoặc ')}`,
      });
    }
    next();
  };
}

/**
 * Generate tokens
 */
function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.full_name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '2h' }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign({ sub: userId }, JWT_REFRESH, { expiresIn: '30d' });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH);
}


// ══════════════════════════════════════════════════════════════
// ERROR HANDLER  (errorHandler.js)
// ══════════════════════════════════════════════════════════════

/**
 * asyncHandler – wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * notFoundHandler – 404 for unknown routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route không tồn tại: ${req.method} ${req.path}`,
  });
}

/**
 * errorHandler – global error middleware
 */
function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack:   err.stack,
    path:    req.path,
    method:  req.method,
    userId:  req.user?.id,
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'FILE_TOO_LARGE',
      message: 'File quá lớn. Tối đa 50MB.',
    });
  }

  // Validation errors (Joi)
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: err.message,
      details: err.details,
    });
  }

  // DB unique constraint
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      message: 'Dữ liệu đã tồn tại',
    });
  }

  // Custom app errors
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error:   err.code || 'SERVER_ERROR',
    message: status < 500 ? err.message : 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}


// ══════════════════════════════════════════════════════════════
// RATE LIMITER  (rateLimiter.js)
// ══════════════════════════════════════════════════════════════

const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.',
  },
  skip: (req) => req.path === '/health',
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max:      20,
  message: {
    success: false,
    error: 'UPLOAD_LIMIT_EXCEEDED',
    message: 'Giới hạn upload 20 file/giờ. Vui lòng thử lại sau.',
  },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max:      10,
  message: {
    success: false,
    error: 'AI_RATE_LIMIT',
    message: 'Giới hạn 10 yêu cầu AI/phút.',
  },
});


// ══════════════════════════════════════════════════════════════
// LOGGER  (utils/logger.js)
// ══════════════════════════════════════════════════════════════

const winston = require('winston');

const loggerInstance = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
          return `${timestamp} [${level.toUpperCase().padEnd(5)}] ${message}${metaStr}`;
        })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize:  10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize:  20 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});


// ══════════════════════════════════════════════════════════════
// DB CONNECTION  (database/connection.js)
// ══════════════════════════════════════════════════════════════

const { Pool } = require('pg');

let pool = null;

async function connectDB() {
  pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME     || 'cv7991',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max:      20,
    idleTimeoutMillis:    30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  // Test connection
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
  return pool;
}

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const dur = Date.now() - start;
    if (dur > 1000) loggerInstance.warn(`Slow query (${dur}ms): ${text.slice(0, 80)}`);
    return result;
  } catch (err) {
    loggerInstance.error(`DB query error: ${err.message}\nQuery: ${text.slice(0, 200)}`);
    throw err;
  }
}

async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


// ══════════════════════════════════════════════════════════════
// REDIS CONFIG  (config/redis.js)
// ══════════════════════════════════════════════════════════════

const Redis = require('ioredis');
let redisClient = null;

async function connectRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  try {
    await redisClient.connect();
    await redisClient.ping();
    loggerInstance.info('Redis connected');
  } catch (err) {
    loggerInstance.warn(`Redis unavailable: ${err.message}. Caching disabled.`);
    redisClient = null;
  }
  return redisClient;
}

function getRedis() { return redisClient; }


// ══════════════════════════════════════════════════════════════
// SWAGGER CONFIG  (config/swagger.js)
// ══════════════════════════════════════════════════════════════

const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:   'CV 7991 – Exam Generation API',
      version: '1.0.0',
      description: 'API tạo đề thi theo Công văn 7991/BGDĐT-GDTr 2024.\nSupports: Document processing, Matrix generation, Question generation (AI), Exam assembly.',
      contact: { name: 'BGDĐT', url: 'https://bgddt.gov.vn' },
    },
    servers: [
      { url: 'http://localhost:4000/api/v1', description: 'Development' },
      { url: 'https://api.cv7991.edu.vn/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http', scheme: 'bearer', bearerFormat: 'JWT',
          description: 'JWT token từ POST /auth/login',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data:    { type: 'object' },
            meta:    { type: 'object', properties: { timestamp: { type: 'string' } } },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error:   { type: 'string',  example: 'VALIDATION_ERROR' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            file_name:  { type: 'string' },
            subject:    { type: 'string' },
            grade:      { type: 'integer' },
            status:     { type: 'string', enum: ['uploaded','processing','processed','failed'] },
            total_pages:{ type: 'integer' },
          },
        },
        Matrix: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            exam_type:      { type: 'string' },
            total_questions:{ type: 'integer' },
            is_valid:       { type: 'boolean' },
            topics:         { type: 'array', items: { type: 'object' } },
          },
        },
        Question: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            question_text:  { type: 'string' },
            cognitive_level:{ type: 'string', enum: ['NB','TH','VD','VDC'] },
            question_type:  { type: 'string', enum: ['TN','TL'] },
            correct_answer: { type: 'string', enum: ['A','B','C','D'] },
            sgk_page_start: { type: 'integer' },
            sgk_page_end:   { type: 'integer' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
});


// ══════════════════════════════════════════════════════════════
// ENV TEMPLATE (.env.example)
// ══════════════════════════════════════════════════════════════

const ENV_TEMPLATE = `# CV 7991 Backend – Environment Variables
# Copy to .env and fill in values

# Server
NODE_ENV=development
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8991

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH=your-refresh-token-secret
JWT_EXPIRES=2h

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cv7991
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# AI Providers (at least one required)
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-claude-api-key

# AI Models (optional overrides)
GEMINI_MODEL=gemini-1.5-pro
OPENAI_MODEL=gpt-4o
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# OCR (optional – for Google Vision)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Logging
LOG_LEVEL=info
`;

// Write .env.example if needed
if (require.main === module) {
  const fs   = require('fs');
  const path = require('path');
  const envFile = path.join(__dirname, '../.env.example');
  if (!fs.existsSync(envFile)) {
    fs.writeFileSync(envFile, ENV_TEMPLATE);
    console.log('Created .env.example');
  }
}


// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  // Auth
  authenticate,
  authorize,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  // Error handling
  asyncHandler,
  notFoundHandler,
  errorHandler,
  // Rate limiting
  rateLimiter,
  uploadLimiter,
  aiLimiter,
  // Logger
  logger: loggerInstance,
  // Database
  connectDB,
  query,
  transaction,
  db: { query, transaction },
  // Redis
  connectRedis,
  getRedis,
  // Swagger
  swaggerSpec,
};
