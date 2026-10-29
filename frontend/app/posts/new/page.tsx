export const instant = false;
import Breadcrumbs, { ROOT_CRUMB } from '@/components/Breadcrumbs';
import PostForm from '@/components/PostForm';

export default function NewPost() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl p-6 sm:p-8">
        <Breadcrumbs items={[ROOT_CRUMB, { label: 'New Post' }]} />

        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <aside>
            <h1 className="mb-6 text-3xl font-extrabold tracking-tight">New post</h1>
          </aside>
          <div>
            <PostForm />
          </div>
        </div>
      </div>
    </main>
  );
}
