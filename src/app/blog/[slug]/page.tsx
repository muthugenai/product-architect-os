import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '@/lib/posts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back
      </Link>
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-2 text-muted">{post.description}</p>
        )}
        <time
          dateTime={post.date}
          className="mt-4 block text-sm text-muted"
        >
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      </header>
      <div className="prose prose-invert prose-zinc max-w-none">
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}
