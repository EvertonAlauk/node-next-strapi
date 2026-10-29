export const instant = false;
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import Breadcrumbs, { ROOT_CRUMB } from '@/components/Breadcrumbs';
import { getPost } from '@/lib/api';
import { requireSession } from '@/lib/session';

type PostPageProps = { params: Promise<{ id: string }> };

const outlineButtonClass =
  'inline-block border border-gray-400 text-gray-800 hover:bg-black hover:border-black hover:text-white font-bold py-2 px-4 rounded-full';

// Data access lives in its own component so it can sit inside <Suspense> (required by cacheComponents)
async function PostDetail({ params }: PostPageProps) {
  const { id } = await params;
  const { token, user } = await requireSession();
  const post = await getPost(id, token);
  if (!post) notFound();
  const isOwner = post.author === user.username;

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl p-6 sm:p-8">
        <Breadcrumbs items={[ROOT_CRUMB, { label: post.title }]} />

        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <aside>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">{post.title}</h1>

          </aside>

          <div className="whitespace-pre-wrap text-lg leading-8 text-gray-700">
            {post.author && (
              <div className="mt-6 flex items-center gap-3 mb-4">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{post.author}</p>
                  {date && <p className="text-gray-500">{date}</p>}
                </div>
              </div>
            )}
            {post.content || <span className="italic text-gray-400">No content.</span>}
            <div>
              {isOwner && (
                <Link href={`/posts/${post.documentId}/edit`} className={`${outlineButtonClass} mt-6`}>
                  Edit post
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PostPage({ params }: PostPageProps) {
  return (
    <Suspense fallback={<p className="p-8 text-center text-gray-500">Loading post...</p>}>
      <PostDetail params={params} />
    </Suspense>
  );
}
