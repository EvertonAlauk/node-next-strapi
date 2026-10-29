'use client';

import { useActionState, useState, type ChangeEvent } from 'react';
import { createPost, updatePost, type PostFormState } from '@/app/posts/actions';
import type { Post } from '@/lib/api';

type PostFormProps = {
  initial?: Partial<Post>;
  postId?: string | null;
};

type FormFields = { title: string; content: string };

const initialState: PostFormState = {};

// The author is not editable here: the server sets it to the logged-in user
export default function PostForm({ initial = {}, postId = null }: PostFormProps) {
  const [form, setForm] = useState<FormFields>({
    title: initial.title || '',
    content: initial.content || '',
  });

  // Server action: runs on the server with the user's session, so no token reaches the browser
  const action = postId ? updatePost.bind(null, postId) : createPost;
  const [state, formAction, saving] = useActionState(action, initialState);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <form action={formAction} className="grid gap-3 max-w-6xl">
      <label htmlFor="title" className="font-bold">
        Title
      </label>
      <input
        className="border border-gray-300 rounded px-3 py-2"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <label htmlFor="content" className="font-bold">
        Content
      </label>
      <textarea
        className="border border-gray-300 rounded px-3 py-2"
        name="content"
        rows={8}
        value={form.content}
        onChange={handleChange}
      />
      {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <div>
        <button type="submit" disabled={saving} className="border border-gray-400 text-gray-800 hover:bg-black hover:border-black hover:text-white font-bold py-2 px-4 rounded-full cursor-pointer">
          {saving ? 'Saving...' : postId ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
