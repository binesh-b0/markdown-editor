import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

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
});

export function renderMarkdown(markdown: string): string {
    return md.render(markdown);
}