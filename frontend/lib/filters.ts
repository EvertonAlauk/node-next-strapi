// The search box looks into these fields (the API matches the same list in api/server.js)
export const SEARCH_FIELDS = ['title', 'author', 'content'] as const;

export type PostFilters = { search: string; mine: boolean };

// Reads the filters from URL params. Missing or repeated params mean "not set".
export function parseFilters(raw: Record<string, string | string[] | undefined>): PostFilters {
  const search = raw.search;
  return {
    search: typeof search === 'string' ? search.trim() : '',
    mine: raw.mine === '1',
  };
}

// Builds the query string, leaving out filters that are not set so the URL stays clean
export function buildFilterQuery(filters: Partial<PostFilters>): string {
  const params = new URLSearchParams();
  const search = filters.search?.trim();
  if (search) params.set('search', search);
  if (filters.mine) params.set('mine', '1');
  return params.toString();
}

export function hasActiveFilters(filters: Partial<PostFilters>): boolean {
  return Boolean(filters.search?.trim()) || Boolean(filters.mine);
}
