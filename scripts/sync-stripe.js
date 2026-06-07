#!/usr/bin/env node

/**
 * Sync YellowSky artworks to Stripe
 * Calls the admin sync endpoint to create/archive/reactivate products
 */

const https = require('https');

const HOSTNAME = process.env.YELLOWSKY_HOST || 'yellowsky.cc';
const LIMIT = parseInt(process.env.YELLOWSKY_SYNC_LIMIT || '50', 10);

const data = JSON.stringify({ dryRun: false, limit: LIMIT });

const options = {
  hostname: HOSTNAME,
  port: 443,
  path: '/api/admin/sync-products',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log(`[${new Date().toISOString()}] Starting YellowSky Stripe sync...`);

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode >= 400) {
      console.error(`[${new Date().toISOString()}] Sync failed: ${res.statusCode}`);
      console.error(body);
      process.exit(1);
    }
    try {
      const result = JSON.parse(body);
      const created = Array.isArray(result.created) ? result.created.length : (result.created || 0);
      const archived = Array.isArray(result.archived) ? result.archived.length : (result.archived || 0);
      const reactivated = Array.isArray(result.reactivated) ? result.reactivated.length : (result.reactivated || 0);
      console.log(`[${new Date().toISOString()}] Sync complete: created=${created}, archived=${archived}, reactivated=${reactivated}`);
      if (result.errors && result.errors.length > 0) {
        console.error(`[${new Date().toISOString()}] Errors:`, result.errors);
      }
    } catch (e) {
      console.log(`[${new Date().toISOString()}] Sync result:`, body);
    }
  });
});

req.on('error', (e) => {
  console.error(`[${new Date().toISOString()}] Sync error:`, e.message);
  process.exit(1);
});

req.write(data);
req.end();