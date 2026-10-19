/**
 * CV 7991 – Redis Cache Connection with Graceful Fallback
 */

'use strict';

const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

async function connectRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = new Redis(url, {
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false,
    lazyConnect: true,
    connectTimeout: 1000,
    retryStrategy: () => null, // Do not endlessly retry if Redis server is down
  });

  redisClient.on('error', (err) => {
    // Suppress unhandled crash events in local development
  });

  try {
    await redisClient.connect();
    await redisClient.ping();
    logger.info('Redis cache connected successfully');
  } catch (err) {
    logger.warn(`Redis unavailable (${err.message}). In-memory caching fallback enabled.`);
    redisClient = null;
  }
  return redisClient;
}

function getRedis() {
  return redisClient;
}

module.exports = { connectRedis, getRedis };
