import { writable, derived } from 'svelte/store';
import { renderMarkdown } from './markdown';

/* ---------- content & preview ---------- */

export const markdownContent = writable<string>(
  '# Hello MarkdownEditor 👋\n\nStart typing on the left …'
);

export const htmlContent = derived(markdownContent, (src) => renderMarkdown(src));

/* ---------- dirty flag ---------- */

export const dirty = writable<boolean>(false);
markdownContent.subscribe(() => dirty.set(true));

/* ---------- theme ("light" | "dark") ---------- */

const storedTheme =
  typeof localStorage !== 'undefined'
    ? (localStorage.getItem('markdown-editor-theme') as 'light' | 'dark' | null)
    : null;

export const theme = writable<'light' | 'dark'>(storedTheme ?? 'light');

theme.subscribe((t) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(t);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('markdown-editor-theme', t);
  }
});
