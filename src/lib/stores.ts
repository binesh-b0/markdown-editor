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
	typeof localStorage !== 'undefined' ? localStorage.getItem('markdown-editor-theme') : null;
export const theme = writable<'light' | 'dark'>(
	savedTheme === 'dark' || savedTheme === 'light' ? (savedTheme as 'light' | 'dark') : 'light'
);

/* ------------ file name ------------ */
const savedName =
	typeof localStorage !== 'undefined' ? localStorage.getItem('markdown-editor-name') : null;
export const fileName = writable<string>(savedName ?? 'Untitled');
fileName.subscribe((n) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('markdown-editor-name', n);
	}
});

theme.subscribe((t) => {
	if (typeof document !== 'undefined') {
		document.documentElement.classList.toggle('dark', t === 'dark');
		document.documentElement.classList.toggle('light', t === 'light');
	}
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('markdown-editor-theme', t);
	}
});

/* ------------ editor settings ------------ */

export interface EditorSettings {
	showLineNumbers: boolean;
}

const defaultSettings: EditorSettings = { showLineNumbers: true };

const savedSettings =
	typeof localStorage !== 'undefined' ? localStorage.getItem('markdown-editor-settings') : null;

export const editorSettings = writable<EditorSettings>(
	savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings
);

editorSettings.subscribe((val) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('markdown-editor-settings', JSON.stringify(val));
	}
});

export const showLineNumbers = derived(editorSettings, (s) => s.showLineNumbers);

/* ------------ throttled localStorage autosave ------------ */

if (typeof window !== 'undefined') {
	const saveToLS = debounce((v: string) => localStorage.setItem('markdown-editor-content', v));
	markdownContent.subscribe(saveToLS);
}
