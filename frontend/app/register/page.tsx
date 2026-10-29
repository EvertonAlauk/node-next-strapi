export const instant = false;
import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto grid max-w-4xl gap-8 p-3 sm:p-8 md:grid-cols-[320px_1fr]">
        <aside>
          <h1 className="mb-2 whitespace-nowrap text-3xl font-extrabold tracking-tight">Create account</h1>
          <p className="whitespace-nowrap text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-gray-900 hover:underline">
              Log in
            </Link>
          </p>
        </aside>

        <div>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
