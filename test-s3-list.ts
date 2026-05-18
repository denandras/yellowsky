import { readFileSync } from "fs";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

// Load .env.local manually
const envPath = ".env.local";
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
} catch {}

async function main() {
  const endpoint = process.env.S4_ENDPOINT!;
  const accessKeyId = process.env.S4_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.S4_SECRET_ACCESS_KEY!;
  const bucket = process.env.S4_BUCKET || "tb1";
  const prefix = process.env.S4_ART_PREFIX || "";
  const region = process.env.S4_REGION || "us-east-1";

  console.log("Config:", { endpoint, bucket, prefix, region, accessKeyId });

  const client = new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  const keys: string[] = [];
  let token: string | undefined;

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
        MaxKeys: 500,
      }),
    );

    for (const obj of list.Contents ?? []) {
      if (!obj.Key) continue;
      keys.push(obj.Key);
    }

    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);

  console.log(`\nFound ${keys.length} objects in S3:\n`);
  keys.sort().forEach((key) => console.log(`  ${key}`));
}

main().catch(console.error);