import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

import mkfootnote from 'markdown-it-footnote';
// import mkdeflist from 'markdown-it-deflist';
import { full as emoji } from 'markdown-it-emoji'
// import mkmark from 'markdown-it-mark';
// import mksub from 'markdown-it-sub';
// import mksup from 'markdown-it-sup';
// import mktask from 'markdown-it-task-lists';
import mkanchor from 'markdown-it-anchor';
export const md: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight:(code:string,lang:string) => {
        if (lang && hljs.getLanguage(lang)) {
            try{
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
//   // ==highlight==
//   .use(mkmark)
//   // Subscript: H~2~O
//   .use(mksub)
//   // Superscript: X^2^
//   .use(mksup)
//   // Task lists: - [ ] or - [x]
//   .use(mktask, { enabled: true })
//   // Heading anchors: ### Title {#custom-id}
  // .use(mkanchor, {
  //   // let `{#my-id}` syntax work
  //   permalink: mkanchor.permalink.linkInsideHeader({
  //     symbol: '¶',
  //     placement: 'after'
  //   }),
  //   slugify: (s: string) =>
  //     encodeURIComponent(
  //       String(s)
  //         .trim()
  //         .toLowerCase()
  //         .replace(/\s+/g, '-')
  //     )
  // });

export function renderMarkdown(markdown: string): string {
    return md.render(markdown);
}