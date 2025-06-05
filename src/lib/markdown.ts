import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

import mkfootnote from 'markdown-it-footnote';
// import mkdeflist from 'markdown-it-deflist';
import { full as emoji } from 'markdown-it-emoji';
// import mkmark from 'markdown-it-mark';
// import mksub from 'markdown-it-sub';
// import mksup from 'markdown-it-sup';
// import mktask from 'markdown-it-task-lists';
// helper to annotate blocks with source line numbers
function lineNumbers(md: MarkdownIt) {
	md.core.ruler.after('block', 'line-numbers', (state) => {
		state.tokens.forEach((t) => {
			if (t.map && t.type.endsWith('_open')) {
				t.attrSet('data-line', String(t.map[0] + 1));
			}
		});
	});
}
export const md: MarkdownIt = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	highlight: (code: string, lang: string) => {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return `<pre class="hljs"><code>${
					hljs.highlight(code, { language: lang }).value
				}</code></pre>`;
			} catch {
				console.log(`Error highlighting code with language ${lang}`);
			}
		}
		return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`;
	}
})
	// Footnotes: [^1], etc.
	.use(mkfootnote)
	//   // Definition lists: term\n: definition
	//   .use(mkdeflist)
	//   // Emoji shortcodes like :joy:
	.use(emoji)
	.use(lineNumbers);
//   // ==highlight==
//   .use(mkmark)
//   // Subscript: H~2~O
//   .use(mksub)
//   // Superscript: X^2^
//   .use(mksup)
//   // Task lists: - [ ] or - [x]

export function renderMarkdown(markdown: string): string {
	return md.render(markdown);
}
