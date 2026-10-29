'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/app/login/actions';

const inputClass =
  'rounded-full border border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10';

const outlineButtonClass =
  'border border-gray-400 text-gray-800 hover:bg-black hover:border-black hover:text-white font-bold py-2 px-4 rounded-full cursor-pointer disabled:opacity-50';

const initialState: LoginState = {};

type LoginFormProps = { redirectTo?: string };

export default function LoginForm({ redirectTo = '' }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="grid gap-1 text-sm font-semibold">
        Email
        <input suppressHydrationWarning name="identifier" required autoComplete="username" className={inputClass} />
      </label>

      <label className="grid gap-1 text-sm font-semibold">
        Password
        <input suppressHydrationWarning name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div>
        <button suppressHydrationWarning type="submit" disabled={pending} className={outlineButtonClass}>
          {pending ? 'Logging in...' : 'Log in'}
        </button>
      </div>

    </form>
  );
}
