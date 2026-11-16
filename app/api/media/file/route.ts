import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { getS4Config, getS4ArtPrefix } from "@/lib/s4-config";
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

  // Only artwork objects may be served through this proxy — never any
  // other key in the bucket, even if a future signing bug produced one.
  const artPrefix = getS4ArtPrefix();
  if (artPrefix && !payload.key.startsWith(artPrefix)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const body = response.Body;
    if (!body) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    const ext = payload.key.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Prevent downloads - images are for viewing only
      "Content-Disposition": "inline",
    };
    if (response.ContentLength) {
      headers["Content-Length"] = String(response.ContentLength);
    }

    // Stream the object through instead of buffering the whole file —
    // first pixels reach the client while the rest is still downloading
    // from S3.
    return new NextResponse(body.transformToWebStream(), { status: 200, headers });
  } catch (err) {
    console.error("S3 fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch from S3" }, { status: 500 });
  }
}