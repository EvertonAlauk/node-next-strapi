// Reads ?page= from the URL. Anything that is not a positive whole number means page 1.
export function parsePage(value: string | string[] | undefined): number {
  const page = Number(typeof value === 'string' ? value : NaN);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}
