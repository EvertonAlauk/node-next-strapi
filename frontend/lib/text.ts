// Short plain-text preview of a post body: HTML tags and extra whitespace removed,
// cut to `max` characters with "..." when it is longer
export function toExcerpt(text: string | undefined, max = 100): string {
  const plain = (text ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}...`;
}
