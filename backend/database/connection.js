/**
 * CV 7991 – PostgreSQL Database Connection Pool & Query Interface
 * Includes graceful offline/mock fallback when PostgreSQL driver or server is not available.
 */

'use strict';

const logger = require('../utils/logger');

let pgModule = null;
try {
  pgModule = require('pg');
} catch (_) {
  // pg will be available once npm install finishes
}

let pool = null;

function getPool() {
  if (!pool && pgModule) {
    const { Pool } = pgModule;
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'cv7991',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pool;
}

async function connectDB() {
  const p = getPool();
  if (!p) {
    logger.warn('PostgreSQL client library not ready or offline. Running in-memory mode.');
    return null;
  }
  try {
    const client = await p.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info(`PostgreSQL connected to ${process.env.DB_NAME || 'cv7991'} at ${process.env.DB_HOST || 'localhost'}`);
    return p;
  } catch (err) {
    logger.warn(`PostgreSQL connection failed: ${err.message}. Operating in degraded/mock mode.`);
    return p;
  }
}

async function query(text, params) {
  const p = getPool();
  if (!p) {
    // Return empty mock result if DB driver not installed yet
    return { rows: [], rowCount: 0 };
  }
  const start = Date.now();
  try {
    const result = await p.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow query detected (${duration}ms): ${text.substring(0, 100)}`);
    }
    return result;
  } catch (err) {
    logger.error(`Database query error: ${err.message} | SQL: ${text.substring(0, 200)}`);
    throw err;
  }
}

async function transaction(fn) {
  const p = getPool();
  if (!p) return fn({ query: () => Promise.resolve({ rows: [], rowCount: 0 }) });
  const client = await p.connect();
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

module.exports = {
  getPool,
  connectDB,
  query,
  transaction,
};
