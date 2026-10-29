import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';

type PaginationProps = { page: number; pageCount: number; search: string; mine: boolean };

// Smaller circles on mobile so the whole bar fits on one line
const circleBase =
  'flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold shadow-sm transition-colors sm:h-10 sm:min-w-10 sm:px-3';
const circleEnabled = `${circleBase} bg-white text-gray-700 hover:bg-gray-100`;
const circleCurrent = `${circleBase} bg-slate-700 text-white`;
const circleDisabled = `${circleBase} bg-white text-gray-300`;

// Keeps the filters in the URL, so moving between pages does not lose them
function pageHref(target: number, search: string, mine: boolean) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (mine) params.set('mine', '1');
  if (target > 1) params.set('page', String(target));
  const query = params.toString();
  return query ? `/?${query}` : '/';
}

// Like Google: 3 pages on each side of the current one. Near the start or the end the
// window slides, so it always shows 7 pages (or every page, when there are fewer).
function pageNumbers(page: number, pageCount: number): number[] {
  const windowSize = 7;
  const start = Math.max(1, Math.min(page - 3, pageCount - windowSize + 1));
  const end = Math.min(pageCount, start + windowSize - 1);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ page, pageCount, search, mine }: PaginationProps) {
  // Shown even with a single page (arrows inactive). Hidden only when there are no posts at all.
  if (pageCount < 1) return null;

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
      {page > 1 ? (
        <Link href={pageHref(page - 1, search, mine)} aria-label="Previous page" className={circleEnabled}>
          <FontAwesomeIcon icon={faAnglesLeft} />
        </Link>
      ) : (
        <span aria-hidden className={circleDisabled}>
          <FontAwesomeIcon icon={faAnglesLeft} />
        </span>
      )}

      {pageNumbers(page, pageCount).map((number) =>
        number === page ? (
          <span key={number} aria-current="page" className={circleCurrent}>
            {number}
          </span>
        ) : (
          <Link
            key={number}
            href={pageHref(number, search, mine)}
            aria-label={`Page ${number}`}
            className={circleEnabled}
          >
            {number}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link href={pageHref(page + 1, search, mine)} aria-label="Next page" className={circleEnabled}>
          <FontAwesomeIcon icon={faAnglesRight} />
        </Link>
      ) : (
        <span aria-hidden className={circleDisabled}>
          <FontAwesomeIcon icon={faAnglesRight} />
        </span>
      )}
    </nav>
  );
}
