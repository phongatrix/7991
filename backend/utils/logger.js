/**
 * CV 7991 – Logger Utility
 * Uses Winston if installed, otherwise falls back gracefully to formatted console logging.
 */

'use strict';

let logger;

try {
  const winston = require('winston');
  const path = require('path');
  const fs = require('fs');

  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  logger = winston.createLogger({
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
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 20 * 1024 * 1024,
        maxFiles: 10,
      }),
    ],
  });
} catch (_) {
  // Graceful Console Fallback if Winston is not yet installed
  const formatMsg = (level, msg, meta) => {
    const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const mStr = meta && Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `${ts} [${level.padEnd(5)}] ${msg}${mStr}`;
  };

  logger = {
    info: (msg, ...meta) => console.log(formatMsg('INFO', msg, meta[0])),
    warn: (msg, ...meta) => console.warn(formatMsg('WARN', msg, meta[0])),
    error: (msg, ...meta) => console.error(formatMsg('ERROR', msg, meta[0])),
    debug: (msg, ...meta) => console.debug(formatMsg('DEBUG', msg, meta[0])),
    http: (msg, ...meta) => console.log(formatMsg('HTTP', msg, meta[0])),
  };
}

module.exports = logger;
