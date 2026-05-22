import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { getS4Config } from "@/lib/s4-config";
import { verifyMediaAccessToken } from "@/lib/media-access-token";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cfg = getS4Config();
  if (!cfg) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 500 });
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const secret = process.env.MEDIA_TOKEN_SECRET ?? process.env.S4_SECRET_ACCESS_KEY;
  if (!secret) {
    return NextResponse.json({ error: "No signing secret" }, { status: 500 });
  }

  const payload = verifyMediaAccessToken(token, secret);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  const client = new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: cfg.bucket,
        Key: payload.key,
      }),
    );

    const body = await response.Body?.transformToByteArray();
    if (!body) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    const buffer = Buffer.from(body);

    const ext = payload.key.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Prevent downloads - images are for viewing only
      "Content-Disposition": "inline",
    };

    // Download parameter removed - images are not downloadable
    // Users can zoom via the UI instead

    return new NextResponse(buffer, { status: 200, headers });
  } catch (err) {
    console.error("S3 fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch from S3" }, { status: 500 });
  }
}