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
    markdownContent.set((e.target as HTMLTextAreaElement).value);
    updateLines(val);
    autoSize();
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
  spellcheck="false"
  placeholder="# Start typing Markdown..."
></textarea>
</div>
