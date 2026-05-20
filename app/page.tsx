import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import HomePageClient from "@/components/home-page-client";
import { normalizeSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";

type CommunityPost = {
  id: string;
  image: string;
  author: string;
  likes: number;
  caption?: string;
  link?: string;
};

async function getCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const filePath = path.join(process.cwd(), "data/community-posts.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const initialLanguage = normalizeSiteLanguage(
    cookieStore.get(SITE_LANGUAGE_COOKIE)?.value,
  );
  const communityPosts = await getCommunityPosts();

  return <HomePageClient initialLanguage={initialLanguage} communityPosts={communityPosts} />;
}