import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';

interface PostCardProps {
  post: PostMeta;
}

/** Strategic Note: Minimal card design — high contrast, clear hierarchy, no visual noise. */
export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border-b border-border py-6 transition-colors first:pt-0 last:border-b-0 hover:border-accent/50"
    >
      <h3 className="font-medium tracking-tight text-foreground transition-colors group-hover:text-accent">
        {post.title}
      </h3>
      {post.description && (
        <p className="mt-1 text-sm text-muted line-clamp-2">{post.description}</p>
      )}
      <time
        dateTime={post.date}
        className="mt-2 block text-xs text-muted"
      >
        {formattedDate}
      </time>
    </Link>
  );
}
