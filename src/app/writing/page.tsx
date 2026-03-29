import { WritingListClient } from "@/components/writing/writing-list-client";
import { WritingNewPostToolbar } from "@/components/writing/writing-new-post-toolbar";
import { getPosts } from "@/lib/posts";

export default function WritingPage() {
  const filePosts = getPosts();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-16">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Writing</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            Notes from the Technical Laboratory
          </h1>
        </header>

        <WritingNewPostToolbar />

        <WritingListClient filePosts={filePosts} />
      </div>
    </main>
  );
}
