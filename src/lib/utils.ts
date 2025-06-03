/** Simple debounce (used for throttled localStorage writes) */
export function debounce<T extends (...a: any[]) => void>(fn: T, wait = 500): T {
  let id: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), wait);
  }) as T;
}
/* -------------------------------------------------------------------
   YAML front‑matter helpers
   ------------------------------------------------------------------*/

/**
 * parseFrontMatter —
 * If `text` starts with `---\n`, extracts YAML front‑matter and returns:
 *   { meta: Record<string, string | string[]>; body: string }
 * Else returns null.
 *
 * ⚠️  This is a *minimal* parser (no nested objects). It handles:
 *   key: value
 *   key: [item1, item2]
 *   key:
 *   - item1
 *   - item2   <- (indented list not supported here)
 */
export function parseFrontMatter(text: string): {
  meta: Record<string, string | string[]>;
  body: string;
} | null {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;

  const yaml = text.slice(3, end).trim();
  const meta: Record<string, any> = {};

  yaml.split('\n').forEach((line) => {
    const [k, ...raw] = line.split(':');
    if (!k || raw.length === 0) return;
    const v = raw.join(':').trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      meta[k.trim()] = v
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
    } else {
      meta[k.trim()] = v.replace(/^['"]|['"]$/g, '');
    }
  });

  const body = text.slice(end + 4).replace(/^\s+/, ''); // trim leading newlines
  return { meta, body };
}

/**
 * buildFrontMatter — serialises fields into a YAML string with trailing `---`.
 */
export function buildFrontMatter(fields: {
  title?: string;
  author?: string;
  date?: string;
  tags?: string[];
}): string {
  const lines: string[] = ['---'];
  if (fields.title)  lines.push(`title: "${fields.title}"`);
  if (fields.author) lines.push(`author: "${fields.author}"`);
  if (fields.date)   lines.push(`date: "${fields.date}"`);
  if (fields.tags?.length)
    lines.push(`tags: [${fields.tags.map((t) => `"${t}"`).join(', ')}]`);
  lines.push('---\n');
  return lines.join('\n');
}
