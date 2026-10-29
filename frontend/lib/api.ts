import { cache } from 'react';
import { buildFilterQuery, type PostFilters } from '@/lib/filters';

export type Post = {
  documentId: string;
  title: string;
  content?: string;
  author?: string;
  createdAt?: string;
};

export type PostsPage = {
  posts: Post[];
  page: number;
  pageCount: number;
  total: number;
};

const API = process.env.NEXT_PUBLIC_API_URL;

// Every request carries the logged-in user's JWT. The API rejects requests without one.
function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function getPosts(filters: Partial<PostFilters>, token: string, page = 1): Promise<PostsPage> {
  const params = new URLSearchParams(buildFilterQuery(filters));
  params.set('page', String(page));

  const res = await fetch(`${API}/posts?${params}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Error ${res.status} fetching posts: ${detail}`);
  }

  const { data, meta } = await res.json();
  return {
    posts: data,
    page: meta.pagination.page,
    pageCount: meta.pagination.pageCount,
    total: meta.pagination.total,
  };
}

// Memoized per request, so the breadcrumb and the form share one API call
export const getPost = cache(async (id: string, token: string): Promise<Post | null> => {
  const res = await fetch(`${API}/posts/${id}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return (await res.json()).data;
});
