export const instant = false;
import { Suspense } from 'react';
import Breadcrumbs, { ROOT_CRUMB } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import { getPost } from '@/lib/api';
import { requireSession } from '@/lib/session';
import PostForm from '@/components/PostForm';

type EditPostProps = { params: Promise<{ id: string }> };

// Shared by the breadcrumb and the form. Non-owners get the same "not found" as a missing post.
async function loadOwnedPost(params: EditPostProps['params']) {
  const { id } = await params;
  const { token, user } = await requireSession();
  const post = await getPost(id, token);
  if (!post || post.author !== user.username) notFound();
  return post;
}

// Data access lives in its own components so they can sit inside <Suspense> (required by cacheComponents)
async function EditCrumbs({ params }: EditPostProps) {
  const post = await loadOwnedPost(params);
  return (
    <Breadcrumbs
      items={[
        ROOT_CRUMB,
        { label: post.title, href: `/posts/${post.documentId}` },
        { label: 'Edit post' },
      ]}
    />
  );
}

async function EditForm({ params }: EditPostProps) {
  const post = await loadOwnedPost(params);
  return <PostForm initial={post} postId={post.documentId} />;
}

export default function EditPost({ params }: EditPostProps) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl p-6 sm:p-8">
        <EditCrumbs params={params} />

        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <aside>
            <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Edit post</h1>
          </aside>

          <div>
            <Suspense fallback={<p>Loading post...</p>}>
              <EditForm params={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
