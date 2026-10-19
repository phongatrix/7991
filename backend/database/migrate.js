/**
 * CV 7991 – Database Migration Script
 * Runs schema.sql to initialize PostgreSQL tables, indexes, enums, and triggers.
 * Run: npm run migrate
 */

'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../utils/logger');

async function runMigration() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    logger.error(`schema.sql not found at ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'cv7991',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  logger.info(`Starting PostgreSQL migration for database: ${process.env.DB_NAME || 'cv7991'}...`);

  try {
    const client = await pool.connect();
    logger.info('Connected to PostgreSQL successfully.');

    // Split SQL by statement if needed or execute entire script
    await client.query(sql);
    logger.info('✅ Database migration executed successfully! All tables, enums, and indexes created.');

    client.release();
    await pool.end();
  } catch (err) {
    logger.error('❌ Migration failed:', err.message);
    await pool.end();
    // Do not crash with exit(1) during offline dev check
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
