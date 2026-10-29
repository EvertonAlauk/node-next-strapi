export const instant = false;
import Link from 'next/link';
import { Suspense } from 'react';
import { getPosts } from '@/lib/api';
import PostActionsMenu from '@/components/PostActionsMenu';
import PostFilters from '@/components/PostFilters';
import { hasActiveFilters, parseFilters } from '@/lib/filters';
import { requireSession } from '@/lib/session';
import { toExcerpt } from '@/lib/text';
import { parsePage } from '@/lib/pagination';
import Pagination from '@/components/Pagination';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const outlineButtonClass =
  'border border-gray-400 text-gray-800 hover:bg-black hover:border-black hover:text-white font-bold py-2 px-4 rounded-full cursor-pointer';

// Mobile: each row is a card and every cell is a block. md and up: a normal table row.
const cellClass =
  'block py-1 text-gray-600 md:table-cell md:border-y md:border-gray-200 md:bg-white md:px-5 md:py-4 md:group-hover:bg-gray-50';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function PostsSection({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const page = parsePage(raw.page);
  const hasFilters = hasActiveFilters(filters);

  const { token, user } = await requireSession();

  let result;
  try {
    result = await getPosts(filters, token, page);
  } catch (err) {
    console.error(err);
    return <p style={{ color: 'red' }}>Could not load posts. Check that the API is running.</p>;
  }

  const { posts, pageCount, total } = result;

  return (
    <div className="flex flex-col gap-5">
      {/* key remounts the form when any filter changes, so inputs pick up the new values (e.g. after Clear) */}
      <PostFilters key={JSON.stringify(filters)} filters={filters} />

      <div className="flex items-baseline justify-between">
        <span className="text-sm text-gray-500">
          {total} {total === 1 ? 'result' : 'results'}
        </span>
      </div>

      {posts.length === 0 ? (
        <p className="py-10 text-center text-gray-500">
          {hasFilters ? 'No posts match these filters.' : 'No posts yet.'}
        </p>
      ) : (
        <table className="w-full border-separate border-spacing-y-2 text-left block md:table">
          <thead className="hidden md:table-header-group">
            <tr className="text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-5 py-2 font-medium">Title</th>
              <th className="px-5 py-2 font-medium">Author</th>
              <th className="px-5 py-2 font-medium">Content</th>
              <th className="px-5 py-2 font-medium">Created</th>
              <th className="px-5 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {posts.map((post) => (
              <tr
                key={post.documentId}
                className="group mb-4 block rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:mb-0 md:table-row md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none"
              >
                <td className={`${cellClass} md:rounded-l-xl md:border-l`}>
                  <Link href={`/posts/${post.documentId}`} className="font-semibold text-gray-900 hover:underline underline-offset-4">
                    {post.title}
                  </Link>
                </td>
                <td className={cellClass}>{post.author || '—'}</td>
                <td className={cellClass}>{toExcerpt(post.content) || '—'}</td>
                <td className={cellClass}>{formatDate(post.createdAt)}</td>
                <td className={`${cellClass} pt-3 md:rounded-r-xl md:border-r`}>
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    {post.author === user.username && <PostActionsMenu id={post.documentId} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination page={page} pageCount={pageCount} search={filters.search} mine={filters.mine} />
    </div>
  );
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="p-4 sm:p-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Posts</h1>
          <Link href="/posts/new" className={outlineButtonClass}>
            + New post
          </Link>
        </header>

        <Suspense fallback={<p>Loading posts...</p>}>
          <PostsSection searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
