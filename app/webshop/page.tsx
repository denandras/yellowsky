import type { Metadata } from "next";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getMediaTokenSecret, getS4ArtPrefix, getS4Config } from "@/lib/s4-config";
import { createMediaAccessToken } from "@/lib/media-access-token";
import WebshopPageClient from "@/components/webshop-page-client";

type MediaItem = {
  id: string;
  title: string;
  viewUrl: string;
  downloadUrl: string;
};

export const metadata: Metadata = {
  title: "Webshop | Yellowsky",
  description: "Purchase yellow sketches and prints by András Dénes.",
};

export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

function isImageKey(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.has(ext);
}

function fileExtension(key: string) {
  return key.split(".").pop()?.toLowerCase() ?? "jpg";
}

function extractTitle(key: string): string {
  const filename = key.split("/").pop() ?? key;
  const name = filename.replace(/\.[^.]+$/, "");
  return name.replace(/[_-]/g, " ");
}

async function getArtItems(): Promise<MediaItem[]> {
  const cfg = getS4Config();
  const tokenSecret = getMediaTokenSecret();
  const artPrefix = getS4ArtPrefix();
  if (!cfg || !tokenSecret || !artPrefix) return [];

  const client = new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  const keys: string[] = [];
  let token: string | undefined;

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: cfg.bucket,
        Prefix: artPrefix,
        ContinuationToken: token,
        MaxKeys: 500,
      }),
    );

    for (const obj of list.Contents ?? []) {
      if (!obj.Key) continue;
      if (!isImageKey(obj.Key)) continue;
      keys.push(obj.Key);
    }

    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);

  const sortedKeys = [...keys].sort((a, b) => b.localeCompare(a));

  return sortedKeys.map((key, index) => {
    const ext = fileExtension(key);
    const ordinal = String(index + 1).padStart(3, "0");
    const safeName = `yellowsky-${ordinal}.${ext}`;
    const accessToken = createMediaAccessToken(
      {
        key,
        name: safeName,
        exp: Date.now() + 1000 * 60 * 60 * 24,
      },
      tokenSecret,
    );
    const encodedToken = encodeURIComponent(accessToken);

    return {
      id: `${index}`,
      title: extractTitle(key),
      viewUrl: `/api/media/file?token=${encodedToken}`,
      downloadUrl: `/api/media/file?token=${encodedToken}&download=1`,
    };
  });
}

export default async function WebshopPage() {
  const artItems = await getArtItems();
  const hasConfig = !!getS4Config() && !!getS4ArtPrefix();

  return <WebshopPageClient items={artItems} hasConfig={hasConfig} />;
}