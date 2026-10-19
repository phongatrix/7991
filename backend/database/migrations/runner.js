/**
 * CV 7991 – Database Migration Runner
 * Executes all pending migration SQL files in alphabetical order.
 * Run: node backend/database/migrations/runner.js
 */

'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../../utils/logger');

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'cv7991',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  logger.info('Connecting to PostgreSQL to check pending migrations...');

  try {
    const client = await pool.connect();

    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Get applied migrations
    const appliedRes = await client.query('SELECT version FROM schema_migrations ORDER BY id ASC');
    const applied = new Set(appliedRes.rows.map((r) => r.version));

    // Read migration files
    const migrationsDir = __dirname;
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      logger.info(`Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        logger.info(`✅ Migration applied successfully: ${file}`);
        count++;
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`❌ Migration failed at ${file}: ${err.message}`);
        throw err;
      }
    }

    if (count === 0) {
      logger.info('All migrations are already up to date.');
    } else {
      logger.info(`🎉 Successfully applied ${count} migration(s).`);
    }

    client.release();
    await pool.end();
  } catch (err) {
    logger.warn(`Migration runner finished with notice: ${err.message}`);
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;
