'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, SubmitEvent } from 'react';
import { buildFilterQuery, hasActiveFilters, type PostFilters as Filters } from '@/lib/filters';

type PostFiltersProps = { filters: Filters };

const inputClass =
  'w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 sm:w-80';

const outlineButtonClass =
  'border border-gray-400 text-gray-800 hover:bg-black hover:border-black hover:text-white font-bold py-2 px-4 rounded-full cursor-pointer';

export default function PostFilters({ filters }: PostFiltersProps) {
  const router = useRouter();

  // Reads the whole form and goes to the matching URL. Filters left empty are not in the URL.
  function applyFilters(form: HTMLFormElement) {
    const data = new FormData(form);
    const query = buildFilterQuery({
      search: String(data.get('search') ?? ''),
      mine: data.get('mine') === '1',
    });
    router.push(query ? `/?${query}` : '/');
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    applyFilters(e.currentTarget);
  }

  // "Only my posts" applies straight away, no need to press Search
  function handleMineChange(e: ChangeEvent<HTMLInputElement>) {
    applyFilters(e.currentTarget.form!);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-start gap-3">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          name="search"
          defaultValue={filters.search}
          placeholder="Search by title, author or content"
          className={inputClass}
        />
        <button type="submit" className={outlineButtonClass}>
          Search
        </button>

        {hasActiveFilters(filters) && (
          <Link href="/" className="text-sm text-gray-500 hover:text-black hover:underline">
            Clear
          </Link>
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm leading-5 text-gray-700">
        <input
          type="checkbox"
          name="mine"
          value="1"
          defaultChecked={filters.mine}
          onChange={handleMineChange}
          className="m-0 h-4 w-4 cursor-pointer accent-black"
        />
        <span>Only my posts</span>
      </label>
    </form>
  );
}
