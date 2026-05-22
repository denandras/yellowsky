import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const envPath = join(process.cwd(), '.env.local');
const env = {};
const raw = readFileSync(envPath, 'utf8');
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq < 0) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const client = new S3Client({
  endpoint: env.S4_ENDPOINT,
  region: env.S4_REGION || 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S4_ACCESS_KEY_ID,
    secretAccessKey: env.S4_SECRET_ACCESS_KEY,
  },
});

const key = env.S4_ART_PREFIX + '2020.84 German Street.jpg';

const result = await client.send(new GetObjectCommand({
  Bucket: env.S4_BUCKET || 'tb1',
  Key: key,
}));

const buffer = Buffer.from(await result.Body.transformToByteArray());
writeFileSync(join(process.cwd(), 'public/hero.jpg'), buffer);
console.log('Downloaded', buffer.length, 'bytes');