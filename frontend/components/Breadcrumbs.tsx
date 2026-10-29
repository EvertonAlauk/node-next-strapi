import Link from 'next/link';

export type Crumb = { label: string; href?: string };

type BreadcrumbsProps = { items: Crumb[] };

// Renders like "Posts / Edit Post". The last item is the current page: bold, not a link
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined} className="font-semibold text-gray-900">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="text-gray-500 hover:text-black hover:underline">
                  {item.label}
                </Link>
              )}

              {!isLast && <span className="text-gray-300">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Common root crumb, so every page starts from the same place
export const ROOT_CRUMB: Crumb = { label: 'Posts', href: '/' };
