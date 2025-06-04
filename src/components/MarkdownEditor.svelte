<script lang="ts">
  import { markdownContent } from '$lib/stores';
  import { onMount } from 'svelte';

  let textareaEl: HTMLTextAreaElement;
  let lineNumEl: HTMLElement;

  function autoSize() {
    if (textareaEl) {
      textareaEl.style.height = 'auto';
      textareaEl.style.height = textareaEl.scrollHeight + 'px';
    }
  }
 
  function updateLines(text: string) {
    const lines = text.split('\n').length || 1;
    if (lineNumEl) {
      lineNumEl.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }
  }

  function handleInput(e: Event) {
    const val = (e.target as HTMLTextAreaElement).value;
    markdownContent.set(val);
    updateLines(val);
    autoSize();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value } = textareaEl;
      const startLine = value.lastIndexOf('\n', s - 1) + 1;
      let endLine = value.indexOf('\n', end);
      if (endLine === -1) endLine = value.length;
      const lines = value.slice(startLine, endLine).split('\n');

      const patched = lines
        .map((ln) => {
          if (e.shiftKey) {
            if (ln.startsWith('    ')) return ln.slice(4);
            if (ln.startsWith('\t')) return ln.slice(1);
            return ln.replace(/^\s{1,4}/, '');
          }
          return '    ' + ln;
        })
        .join('\n');

      const next = value.slice(0, startLine) + patched + value.slice(endLine);
      textareaEl.value = next;
      markdownContent.set(next);
      const newEnd = startLine + patched.length;
      textareaEl.setSelectionRange(startLine, newEnd);
      updateLines(next);
      return;
    }

    if (e.key === 'Enter') {
      const { selectionStart: s, value } = textareaEl;
      const prevStart = value.lastIndexOf('\n', s - 1) + 1;
      const prevLine = value.slice(prevStart, s);
      const olMatch = prevLine.match(/^(\s*)(\d+)\.\s+/);
      const ulMatch = prevLine.match(/^(\s*)([-*+] )/);
      if (olMatch) {
        e.preventDefault();
        const indent = olMatch[1];
        const num = Number(olMatch[2]) + 1;
        const insertion = `\n${indent}${num}. `;
        insertAtCursor(insertion, 0);
        return;
      }
      if (ulMatch) {
        e.preventDefault();
        const indent = ulMatch[1];
        const bullet = ulMatch[2];
        const insertion = `\n${indent}${bullet}`;
        insertAtCursor(insertion, 0);
        return;
      }
    }
  }

  $: updateLines($markdownContent);
  $: autoSize();
  onMount(autoSize);

  export function highlightLine(line: number | null) {
    if (!textareaEl || line == null) return;
    const lines = textareaEl.value.split('\n');
    const start = lines.slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
    const end = start + lines[line - 1].length;
    textareaEl.setSelectionRange(start, end);
  }

  export function jumpToLine(line: number) {
    if (!textareaEl) return;
    const lines = textareaEl.value.split('\n');
    const pos = lines.slice(0, line - 1).join('\n').length + (line > 1 ? 1 : 0);
    textareaEl.focus();
    textareaEl.setSelectionRange(pos, pos);
  }

export function wrapSelection(prefix: string, suffix = prefix, placeholder = '') {
    const { selectionStart: s, selectionEnd: e, value } = textareaEl;
    const selected = value.slice(s, e) || placeholder;
    const updated  = value.slice(0, s) + prefix + selected + suffix + value.slice(e);
    textareaEl.value = updated;
    markdownContent.set(updated);

    const cursor = s + prefix.length + (selected === placeholder ? 0 : selected.length);
    textareaEl.focus();
    textareaEl.setSelectionRange(cursor, cursor);
  }

export function insertAtCursor(text:string, cursorOffset = 0) {
    const {selectionStart:s, selectionEnd: e, value } = textareaEl;
    const updated = value.slice(0, s) + text + value.slice(e);
    textareaEl.value = updated;
    markdownContent.set(updated);
    const cursor = s + text.length + cursorOffset;
    textareaEl.focus();
    textareaEl.setSelectionRange(cursor, cursor);
  }

export function getTextarea(): HTMLTextAreaElement {
  return textareaEl;
}
</script>
<style>
  .editor-wrap {
    display: flex;
    height: 100%;
  }
  .line-numbers {
    user-select: none;
    text-align: right;
    padding: 0.5rem 0.75rem 0.5rem 0.25rem;
    border-right: 1px solid var(--border);
    font-family: var(--mono);
    opacity: 0.6;
  }
  textarea {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: none;
    resize: none;
    overflow-y: hidden;
    height: auto;
    font-family: var(--mono);
    line-height: 1.5;
    background: inherit;
    color: inherit;
    outline: none;
  }
</style>
<!-- textarea automatically bound via store subscription -->
<div class = "editor-wrap">
    <pre class="line-numbers" bind:this={lineNumEl}></pre>
    <textarea
  bind:this={textareaEl}
  bind:value={$markdownContent}
  on:input={handleInput}
  on:keydown={handleKeyDown}
  spellcheck="false"
  placeholder="# Start typing Markdown..."
></textarea>
</div>
