import { WritingAdminPostClient } from "@/components/writing/writing-admin-post-client";
import { WritingFileArticle } from "@/components/writing/writing-file-article";
import { getPostBySlug, getPosts } from "@/lib/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

/** Allow slugs that exist only in browser storage (not in generateStaticParams). */
export const dynamicParams = true;

export default async function WritingPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (post) {
    return <WritingFileArticle post={post} />;
  }
  return <WritingAdminPostClient slug={slug} />;
}
