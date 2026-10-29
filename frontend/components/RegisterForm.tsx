'use client';

import { useActionState } from 'react';
import { register, type LoginState } from '@/app/login/actions';

const inputClass =
  'rounded-full border border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10';

const outlineButtonClass =
  'border border-gray-400 text-gray-800 hover:bg-black hover:border-black hover:text-white font-bold py-2 px-4 rounded-full cursor-pointer disabled:opacity-50';

const initialState: LoginState = {};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-1 text-sm font-semibold">
        Username
        <input suppressHydrationWarning name="username" required autoComplete="username" className={inputClass} />
      </label>

      <label className="grid gap-1 text-sm font-semibold">
        Email
        <input suppressHydrationWarning name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>

      <label className="grid gap-1 text-sm font-semibold">
        Password
        <input suppressHydrationWarning name="password" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div>
        <button suppressHydrationWarning type="submit" disabled={pending} className={outlineButtonClass}>
          {pending ? 'Creating account...' : 'Register'}
        </button>
      </div>

    </form>
  );
}
