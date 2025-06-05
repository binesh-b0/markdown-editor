import { writable, derived } from 'svelte/store';
import { debounce } from './utils';
import { renderMarkdown } from './markdown';

/* ------------ content & preview ------------ */

export const markdownContent = writable<string>('');

export const htmlContent = derived(markdownContent, renderMarkdown);

/* ------------ dirty flag (derived) ------------ */

const lastSaved = writable<string>(''); // buffer at last explicit save

export const dirty = derived([markdownContent, lastSaved], ([curr, saved]) => curr !== saved);

/* expose helper for save handler */
export function markSaved(val: string) {
	lastSaved.set(val);
}

/* ------------ theme ------------ */

const savedTheme =
	typeof localStorage !== 'undefined'
		? (localStorage.getItem('markdown-editor-theme') as 'light' | 'dark' | null)
		: null;
export const theme = writable<'light' | 'dark'>(savedTheme ?? 'light');

theme.subscribe((t) => {
	if (typeof document !== 'undefined') {
		document.documentElement.classList.toggle('dark', t === 'dark');
		document.documentElement.classList.toggle('light', t === 'light');
	}
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('markdown-editor-theme', t);
	}
});

/* ------------ throttled localStorage autosave ------------ */

if (typeof window !== 'undefined') {
	const saveToLS = debounce((v: string) => localStorage.setItem('markdown-editor-content', v));
	markdownContent.subscribe(saveToLS);
}
