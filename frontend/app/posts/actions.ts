'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';

const API = process.env.NEXT_PUBLIC_API_URL;

export type PostFormState = { error?: string };

function readPostFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    content: String(formData.get('content') ?? ''),
  };
}

// Sends a create/update to the API. Returns an error message, or null on success.
async function savePost(path: string, method: 'POST' | 'PUT', token: string, data: object): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
  } catch {
    return 'Could not connect to the API.';
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return body.error || 'Failed to save the post.';
  }
  return null;
}

export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const { token } = await requireSession();

  const error = await savePost('/posts', 'POST', token, readPostFields(formData));
  if (error) return { error };

  revalidatePath('/');
  redirect('/');
}

export async function updatePost(id: string, _prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const { token } = await requireSession();

  const error = await savePost(`/posts/${id}`, 'PUT', token, readPostFields(formData));
  if (error) return { error };

  revalidatePath('/');
  redirect('/');
}

export async function deletePost(id: string): Promise<PostFormState> {
  const { token } = await requireSession();

  let res: Response;
  try {
    res = await fetch(`${API}/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return { error: 'Could not connect to the API.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.error || 'Failed to delete the post.' };
  }

  revalidatePath('/');
  return {};
}
